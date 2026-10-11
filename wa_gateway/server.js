const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let wppconnect;
try {
  wppconnect = require('@wppconnect-team/wppconnect');
} catch (e) {
  console.log('[WPPConnect] Library @wppconnect-team/wppconnect is still loading...');
}

const app = express();
const PORT = process.env.PORT || 21465;

app.use(cors());
app.use(express.json());

// Session state
let clientInstance = null;
let currentQrBase64 = null;
let currentQrAscii = null;
let connectionState = 'DISCONNECTED'; // DISCONNECTED, INITIALIZING, QR_READY, CONNECTED, ERROR
let connectedPhone = null;
let connectedName = null;
let lastError = null;

// Determine Chrome path
function getChromeExecutablePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

/**
 * Format phone to WhatsApp format: 628xxxxxxxxxx
 */
function formatWhatsAppPhone(phone) {
  if (!phone) return '';
  let clean = phone.toString().replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (!clean.startsWith('62')) {
    clean = '62' + clean;
  }
  return clean;
}

/**
 * Initialize WPPConnect Client
 */
async function startClient() {
  if (!wppconnect) {
    try {
      wppconnect = require('@wppconnect-team/wppconnect');
    } catch (e) {
      connectionState = 'ERROR';
      lastError = 'WPPConnect library belum terinstall.';
      return;
    }
  }

  if (connectionState === 'INITIALIZING' || connectionState === 'CONNECTED') {
    return;
  }

  try {
    connectionState = 'INITIALIZING';
    lastError = null;
    console.log('[WPPConnect] Memulai inisialisasi sesi WhatsApp Dental Care...');

    const chromePath = getChromeExecutablePath();
    console.log('[WPPConnect] Menggunakan browser:', chromePath || 'default puppeteer');
    killLingeringChrome();

    clientInstance = await wppconnect.create({
      session: 'dental-care-clinic',
      catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
        currentQrBase64 = base64Qr;
        currentQrAscii = asciiQR;
        connectionState = 'QR_READY';
        console.log(`[WPPConnect] QR Code siap di-scan (percobaan ke-${attempts})`);
      },
      statusFind: (statusSession, session) => {
        console.log(`[WPPConnect] Status session: ${statusSession}`);
        if (statusSession === 'isLogged' || statusSession === 'inChat') {
          connectionState = 'CONNECTED';
          currentQrBase64 = null;
          currentQrAscii = null;
        } else if (statusSession === 'notLogged') {
          connectionState = 'QR_READY';
        } else if (statusSession === 'browserClose' || statusSession === 'qrReadFail') {
          connectionState = 'DISCONNECTED';
          clientInstance = null;
        }
      },
      headless: 'new',
      devtools: false,
      useChrome: true,
      debug: false,
      logQR: false,
      autoClose: 0,
      tokenStore: 'file',
      folderNameToken: path.join(__dirname, 'tokens'),
      puppeteerOptions: {
        executablePath: chromePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    connectionState = 'CONNECTED';
    currentQrBase64 = null;
    currentQrAscii = null;

    try {
      const host = await clientInstance.getHostDevice();
      connectedPhone = host?.phone || host?.id?.user || host?.wid?.user || 'Klinik Dental Care';
      connectedName = host?.pushname || host?.name || 'Dental Care WhatsApp';
      console.log(`[WPPConnect] Berhasil terhubung! Akun: ${connectedName} (${connectedPhone})`);
    } catch (e) {
      console.log('[WPPConnect] Terhubung, namun belum dapat membaca host info.');
    }

    if ((!connectedPhone || connectedPhone === 'Klinik Dental Care') && clientInstance.page) {
      try {
        const info = await clientInstance.page.evaluate(() => {
          if (typeof WPP !== 'undefined' && WPP.conn) {
            const wid = WPP.conn.getMyUserId();
            return {
              user: wid ? (wid.user || wid._serialized) : null,
              pushname: (typeof WPP.whatsapp !== 'undefined' && WPP.whatsapp.Conn) ? WPP.whatsapp.Conn.pushname : null,
            };
          }
          return null;
        });
        if (info && info.user) connectedPhone = info.user;
        if (info && info.pushname) connectedName = info.pushname;
      } catch (e) {}
    }
  } catch (err) {
    console.error('[WPPConnect] Gagal menginisialisasi sesi:', err);
    connectionState = 'ERROR';
    lastError = err.message || 'Gagal memulai browser WPPConnect';
    clientInstance = null;
  }
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

/**
 * GET /api/status - Status koneksi WPPConnect
 */
app.get('/api/status', (req, res) => {
  res.json({
    status: connectionState,
    connected: connectionState === 'CONNECTED',
    phone: connectedPhone,
    name: connectedName,
    hasQr: !!currentQrBase64,
    lastError,
    session: 'dental-care-clinic',
  });
});

/**
 * GET /api/qr - Ambil gambar QR Code
 */
app.get('/api/qr', (req, res) => {
  res.json({
    status: connectionState,
    connected: connectionState === 'CONNECTED',
    qr: currentQrBase64,
    ascii: currentQrAscii,
  });
});

/**
 * Kill any lingering Chrome/Edge processes holding the dental-care-clinic user data folder
 */
function killLingeringChrome() {
  try {
    execSync('powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = \'chrome.exe\'\\" | Where-Object { $_.CommandLine -like \'*dental-care-clinic*\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"', { stdio: 'ignore' });
  } catch (e) {}
}

/**
 * Safely and thoroughly cleanup client session without hanging
 */
async function cleanupSession() {
  console.log('[WPPConnect] Membersihkan sesi & proses browser...');
  const current = clientInstance;
  clientInstance = null;

  if (current) {
    try {
      // 1. Send page logout command with max 1.5s timeout
      if (current.page) {
        await Promise.race([
          current.page.evaluate(() => {
            if (typeof WPP !== 'undefined' && WPP.conn && typeof WPP.conn.logout === 'function') {
              return WPP.conn.logout();
            }
          }).catch(() => {}),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      }
    } catch (e) {}

    try {
      // 2. Close client with max 1.5s timeout
      await Promise.race([
        current.close().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch (e) {}
  }

  // 3. Force kill lingering Chrome processes locking files
  killLingeringChrome();

  connectionState = 'DISCONNECTED';
  connectedPhone = null;
  connectedName = null;
  currentQrBase64 = null;
  currentQrAscii = null;
  lastError = null;

  // 4. Remove session folder so clean tokens state is reached
  const tokenDir = path.join(__dirname, 'tokens', 'dental-care-clinic');
  try {
    if (fs.existsSync(tokenDir)) {
      fs.rmSync(tokenDir, { recursive: true, force: true });
      console.log('[WPPConnect] Folder token sesi berhasil dihapus.');
    }
  } catch (rmErr) {
    console.warn('[WPPConnect] Gagal menghapus folder token:', rmErr.message);
  }
}

/**
 * POST /api/reconnect - Memulai ulang koneksi / request QR baru
 */
app.post('/api/reconnect', async (req, res) => {
  try {
    console.log('[WPPConnect] Menerima permintaan reconnect...');
    await cleanupSession();
    res.json({ success: true, message: 'Inisialisasi ulang dimulai.' });

    setTimeout(() => {
      startClient();
    }, 1000);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/**
 * Send WhatsApp message with LID resolution and multiple fallbacks
 */
async function sendMessageWithLidFallback(client, phone, message) {
  if (!client || connectionState !== 'CONNECTED') {
    throw new Error('WPPConnect belum terhubung ke WhatsApp. Silakan scan QR code terlebih dahulu.');
  }

  const cleanPhone = formatWhatsAppPhone(phone);
  if (!cleanPhone || cleanPhone.length < 8) {
    throw new Error('Nomor telepon tidak valid.');
  }

  const standardChatId = `${cleanPhone}@c.us`;
  let targetChatId = standardChatId;
  let resolvedVia = 'default';

  // Step 1: Query contact information to resolve LID & check if number is on WhatsApp
  if (client.page) {
    try {
      const contactInfo = await client.page.evaluate(async (rawId) => {
        try {
          if (typeof WPP === 'undefined') {
            return { rawId, error: 'WPP not initialized in page' };
          }

          // 1. Check existing chat in store
          if (WPP.chat && typeof WPP.chat.get === 'function') {
            const existing = WPP.chat.get(rawId);
            if (existing && existing.id) {
              return {
                targetId: existing.id._serialized || existing.id.toString(),
                exists: true,
                from: 'chatStore',
              };
            }
          }

          // 2. Query contact existence from WhatsApp server (resolves LID & registers in cache)
          if (WPP.contact && typeof WPP.contact.queryExists === 'function') {
            const queryRes = await WPP.contact.queryExists(rawId);
            if (queryRes) {
              const lidStr = queryRes.lid ? (queryRes.lid._serialized || queryRes.lid.toString()) : null;
              const widStr = queryRes.wid ? (queryRes.wid._serialized || queryRes.wid.toString()) : null;
              return {
                targetId: lidStr || widStr || rawId,
                lid: lidStr,
                wid: widStr,
                exists: true,
                from: 'queryExists',
              };
            } else {
              return { exists: false };
            }
          }

          // 3. Fallback: try getPnLidEntry if available
          if (WPP.contact && typeof WPP.contact.getPnLidEntry === 'function') {
            const entry = await WPP.contact.getPnLidEntry(rawId);
            if (entry && entry.lid) {
              const lidStr = entry.lid._serialized || entry.lid.toString();
              return {
                targetId: lidStr,
                lid: lidStr,
                exists: true,
                from: 'getPnLidEntry',
              };
            }
          }
        } catch (err) {
          return { error: err.message };
        }
        return { targetId: rawId, from: 'none' };
      }, standardChatId);

      if (contactInfo) {
        if (contactInfo.exists === false) {
          throw new Error(`Nomor ${cleanPhone} tidak terdaftar di WhatsApp.`);
        }
        if (contactInfo.targetId) {
          targetChatId = contactInfo.targetId;
          resolvedVia = contactInfo.from || 'query';
          console.log(`[WPPConnect] Resolusi nomor ${cleanPhone}: target = ${targetChatId} (${resolvedVia})`);
        }
      }
    } catch (evalErr) {
      if (evalErr.message && evalErr.message.includes('tidak terdaftar di WhatsApp')) {
        throw evalErr;
      }
      console.warn(`[WPPConnect] Warning evaluasi kontak ${cleanPhone}: ${evalErr.message}`);
    }
  }

  // Step 2: Attempt sending text message
  let sendResult = null;
  let lastSendError = null;

  // Try 1: sendText with targetChatId
  try {
    console.log(`[WPPConnect] Mengirim pesan ke ${targetChatId}...`);
    sendResult = await client.sendText(targetChatId, message);
  } catch (err1) {
    lastSendError = err1;
    console.warn(`[WPPConnect] Gagal kirim ke ${targetChatId}: ${err1.message}`);

    // Try 2: If targetChatId differed from standardChatId, try standardChatId
    if (targetChatId !== standardChatId) {
      try {
        console.log(`[WPPConnect] Mencoba alternatif ke standardChatId ${standardChatId}...`);
        sendResult = await client.sendText(standardChatId, message);
      } catch (err2) {
        lastSendError = err2;
        console.warn(`[WPPConnect] Alternatif standardChatId juga gagal: ${err2.message}`);
      }
    }

    // Try 3: Direct WPP.chat.sendTextMessage in browser page evaluate
    if (!sendResult && client.page) {
      try {
        console.log(`[WPPConnect] Mencoba kirim langsung via evaluate WPP.chat.sendTextMessage...`);
        sendResult = await client.page.evaluate(async ({ to, text }) => {
          if (typeof WPP === 'undefined' || !WPP.chat) {
            throw new Error('WPP.chat tidak tersedia di halaman');
          }
          return await WPP.chat.sendTextMessage(to, text, {
            waitForAck: true,
            createChat: true,
          });
        }, { to: targetChatId, text: message });
      } catch (err3) {
        lastSendError = err3;
        console.warn(`[WPPConnect] Evaluate sendTextMessage gagal: ${err3.message}`);
      }
    }
  }

  if (!sendResult) {
    throw new Error(lastSendError ? lastSendError.message : 'Gagal mengirim pesan WhatsApp');
  }

  return {
    to: cleanPhone,
    chatId: targetChatId,
    messageId: sendResult?.id || sendResult?.to?._serialized || (typeof sendResult === 'object' ? JSON.stringify(sendResult) : 'OK'),
  };
}

/**
 * POST /api/send-message - Kirim pesan tunggal
 */
app.post('/api/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nomor telepon (phone) dan pesan (message) wajib diisi.',
      });
    }

    if (!clientInstance || connectionState !== 'CONNECTED') {
      return res.status(503).json({
        success: false,
        message: 'WPPConnect belum terhubung ke WhatsApp. Silakan scan QR code terlebih dahulu.',
        status: connectionState,
      });
    }

    const result = await sendMessageWithLidFallback(clientInstance, phone, message);

    res.json({
      success: true,
      message: 'Pesan berhasil dikirim via WPPConnect!',
      to: result.to,
      chatId: result.chatId,
      messageId: result.messageId,
    });
  } catch (err) {
    console.error('[WPPConnect] Gagal mengirim pesan:', err);
    res.status(500).json({
      success: false,
      message: `Gagal mengirim pesan: ${err.message}`,
    });
  }
});

/**
 * POST /api/send-bulk - Kirim pesan massal dengan jeda aman
 */
app.post('/api/send-bulk', async (req, res) => {
  try {
    const { recipients, delayMs = 1500 } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Daftar penerima (recipients) wajib berupa array tidak kosong.',
      });
    }

    if (!clientInstance || connectionState !== 'CONNECTED') {
      return res.status(503).json({
        success: false,
        message: 'WPPConnect belum terhubung. Silakan scan QR code terlebih dahulu.',
        status: connectionState,
      });
    }

    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i++) {
      const item = recipients[i];

      try {
        const sendRes = await sendMessageWithLidFallback(clientInstance, item.phone, item.message);
        results.push({
          id: item.id,
          name: item.name,
          phone: sendRes.to,
          success: true,
          messageId: sendRes.messageId,
        });
        sentCount++;
      } catch (errSend) {
        results.push({
          id: item.id,
          name: item.name,
          phone: item.phone,
          success: false,
          error: errSend.message,
        });
        failedCount++;
      }

      // Safe interval delay between messages to prevent spam detection
      if (i < recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    res.json({
      success: true,
      total: recipients.length,
      sent: sentCount,
      failed: failedCount,
      results,
    });
  } catch (err) {
    console.error('[WPPConnect] Gagal memproses bulk send:', err);
    res.status(500).json({
      success: false,
      message: `Terjadi kesalahan saat pengiriman massal: ${err.message}`,
    });
  }
});

/**
 * POST /api/logout - Keluar dan hapus sesi
 */
app.post('/api/logout', async (req, res) => {
  try {
    console.log('[WPPConnect] Menerima permintaan logout...');
    await cleanupSession();

    res.json({
      success: true,
      message: 'Berhasil logout dari WhatsApp. Silakan scan QR code baru.',
    });

    // Auto restart in background after response is sent
    setTimeout(() => {
      startClient();
    }, 1200);
  } catch (err) {
    console.error('[WPPConnect] Gagal logout:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Express HTTP Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🦷 Dental Care Clinic - WPPConnect WhatsApp Gateway`);
  console.log(`🚀 Gateway Server aktif di: http://localhost:${PORT}`);
  console.log(`📡 Endpoint Status : http://localhost:${PORT}/api/status`);
  console.log(`📷 Endpoint QR     : http://localhost:${PORT}/api/qr`);
  console.log(`=======================================================`);

  // Auto start client on launch
  startClient();
});
