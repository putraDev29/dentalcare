const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Clean up any outdated nested wa-js in @wppconnect-team/wppconnect to ensure the latest root version is always used
try {
  const nestedWaJs = path.join(__dirname, 'node_modules', '@wppconnect-team', 'wppconnect', 'node_modules', '@wppconnect', 'wa-js');
  if (fs.existsSync(nestedWaJs)) {
    fs.rmSync(nestedWaJs, { recursive: true, force: true });
    console.log('[WPPConnect] Membersihkan nested wa-js lama agar menggunakan versi terbaru.');
  }
} catch (e) {}

let wppconnect;
try {
  wppconnect = require('@wppconnect-team/wppconnect');
} catch (e) {
  console.log('[WPPConnect] Library @wppconnect-team/wppconnect is still loading...');
}

const app = express();
const PORT = process.env.PORT || 21465;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

process.on('uncaughtException', (err) => {
  console.error('[WPPConnect Uncaught Exception]:', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[WPPConnect Unhandled Rejection]:', reason?.message || reason);
});

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
      headless: process.env.HEADLESS === 'false' || process.argv.includes('--visible') ? false : 'new',
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
          '--remote-debugging-port=54109',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--js-flags=--max-old-space-size=256',
          '--renderer-process-limit=2',
          '--disable-extensions',
          '--disable-default-apps',
          '--disable-component-update',
          '--mute-audio',
          '--no-default-browser-check',
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
            const wid = typeof WPP.conn.getMyUserWid === 'function' ? WPP.conn.getMyUserWid() : (typeof WPP.conn.getMyUserId === 'function' ? WPP.conn.getMyUserId() : null);
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
    const scriptPath = path.join(__dirname, 'kill_chrome.ps1');
    if (fs.existsSync(scriptPath)) {
      execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`, { stdio: 'ignore' });
    } else {
      execSync('powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = \'chrome.exe\'\\" | Where-Object { $_.CommandLine -like \'*dental-care-clinic*\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"', { stdio: 'ignore' });
    }
  } catch (e) {}
}

/**
 * Safely and thoroughly cleanup client session without hanging
 */
async function cleanupSession(clearTokens = false) {
  console.log(`[WPPConnect] Membersihkan sesi & proses browser (clearTokens: ${clearTokens})...`);
  const current = clientInstance;
  clientInstance = null;

  if (current) {
    try {
      // 1. Send page logout command with max 1.5s timeout (hanya jika memang logout permanen)
      if (clearTokens && current.page) {
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

  // 4. Hapus folder token HANYA jika diminta logout secara eksplisit
  if (clearTokens) {
    const tokenDir = path.join(__dirname, 'tokens', 'dental-care-clinic');
    try {
      if (fs.existsSync(tokenDir)) {
        fs.rmSync(tokenDir, { recursive: true, force: true });
        console.log('[WPPConnect] Folder token sesi berhasil dihapus (logout).');
      }
    } catch (rmErr) {
      console.warn('[WPPConnect] Gagal menghapus folder token:', rmErr.message);
    }
  }
}

/**
 * POST /api/reconnect - Memulai ulang koneksi / request QR baru
 */
app.post('/api/reconnect', async (req, res) => {
  try {
    console.log('[WPPConnect] Menerima permintaan reconnect...');
    // Pertahankan kredensial token sesi agar tidak perlu scan QR ulang jika sudah login
    await cleanupSession(false);
    res.json({ success: true, message: 'Inisialisasi ulang dimulai.' });

    setTimeout(() => {
      startClient();
    }, 1000);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/**
 * Automatically dismiss any blocking modals in WhatsApp Web (e.g. What's New, Retry, Close buttons)
 */
async function dismissBlockingModals(page) {
  if (!page) return;
  try {
    await page.evaluate(() => {
      // 1. Close icon buttons
      const closeButtons = document.querySelectorAll('span[data-icon="x"], span[data-icon="close"]');
      closeButtons.forEach((btn) => btn.closest('button')?.click());

      // 2. Click "Coba Lagi" if error dialog
      const retryBtn = Array.from(document.querySelectorAll('button, div[role="button"]')).find((b) =>
        (b.innerText || '').includes('Coba Lagi')
      );
      if (retryBtn) retryBtn.click();

      // 3. Action buttons
      const actionButtons = Array.from(document.querySelectorAll('button, div[role="button"]'));
      for (const b of actionButtons) {
        const t = (b.innerText || '').trim().toLowerCase();
        if (['lanjut', 'tutup', 'oke', 'ok', 'mengerti'].includes(t)) {
          if (b.closest('[role="dialog"]') || b.closest('[data-animate-modal-popup="true"]')) {
            b.click();
          }
        }
      }
    });
  } catch (e) {}
}

/**
 * Send WhatsApp message reliably to any phone number (including own number or other numbers)
 */
async function sendMessageWithLidFallback(client, phone, message) {
  if (!client || connectionState !== 'CONNECTED') {
    throw new Error('WPPConnect belum terhubung ke WhatsApp. Silakan scan QR code terlebih dahulu.');
  }

  const cleanPhone = formatWhatsAppPhone(phone);
  if (!cleanPhone || cleanPhone.length < 8) {
    throw new Error('Nomor telepon tidak valid.');
  }

  if (client.page) {
    await dismissBlockingModals(client.page);
  }

  // Canonical WhatsApp phone JID is ALWAYS <phone>@c.us (never @lid!)
  const standardChatId = `${cleanPhone}@c.us`;
  let targetChatId = standardChatId;

  // Cek apakah nomor tujuan adalah nomor WhatsApp gateway sendiri (Catatan ke Diri Sendiri / Message Yourself)
  let isOwnNumber = false;
  if (connectedPhone) {
    const cleanConnected = formatWhatsAppPhone(connectedPhone);
    if (
      cleanPhone === cleanConnected ||
      (cleanPhone.length >= 8 && cleanConnected.length >= 8 && (cleanPhone.endsWith(cleanConnected.slice(-9)) || cleanConnected.endsWith(cleanPhone.slice(-9))))
    ) {
      isOwnNumber = true;
      console.log(`[WPPConnect] Mengirim ke nomor gateway sendiri (${cleanPhone}) via fitur Catatan ke Diri Sendiri.`);
    }
  }

  // Jika bukan nomor sendiri, validasi keberadaan nomor di WhatsApp via queryWidExists
  if (!isOwnNumber && client.page) {
    try {
      const contactInfo = await client.page.evaluate(async (rawId) => {
        if (typeof WPP === 'undefined' || !WPP.contact) return { exists: true };
        try {
          if (typeof WPP.contact.queryWidExists === 'function') {
            const queryRes = await WPP.contact.queryWidExists(rawId);
            if (!queryRes) return { exists: false };
            const widStr = queryRes.wid ? (queryRes.wid._serialized || queryRes.wid.toString()) : rawId;
            return {
              exists: true,
              targetId: (widStr && !widStr.endsWith('@lid')) ? widStr : rawId,
            };
          }
        } catch (err) {
          return { error: err.message, targetId: rawId };
        }
        return { exists: true, targetId: rawId };
      }, standardChatId);

      if (contactInfo && contactInfo.exists === false) {
        throw new Error(`Nomor ${cleanPhone} tidak terdaftar di WhatsApp.`);
      }

      if (contactInfo && contactInfo.targetId && !contactInfo.targetId.endsWith('@lid')) {
        targetChatId = contactInfo.targetId;
      }
    } catch (evalErr) {
      if (evalErr.message && evalErr.message.includes('tidak terdaftar di WhatsApp')) {
        throw evalErr;
      }
      console.warn(`[WPPConnect] Warning validasi kontak ${cleanPhone}:`, evalErr.message);
    }
  }

  // Pastikan targetChatId SELALU berakhiran @c.us, jangan pernah kirim ke @lid
  if (!targetChatId || targetChatId.endsWith('@lid')) {
    targetChatId = standardChatId;
  }

  let sendResult = null;
  let lastSendError = null;

  // METODE 1: Direct WPP.chat.sendTextMessage dalam browser context dengan race timeout aman
  if (client.page) {
    try {
      console.log(`[WPPConnect] Mengirim pesan ke ${targetChatId} (isOwnNumber: ${isOwnNumber})...`);
      sendResult = await client.page.evaluate(async ({ target, text }) => {
        if (typeof WPP === 'undefined' || !WPP.chat) {
          throw new Error('WPP.chat tidak tersedia di halaman browser');
        }

        // Buka / cari chat terlebih dahulu agar state chat terinisialisasi
        try {
          await WPP.chat.find(target);
        } catch (e) {}

        // Kirim dengan createChat: true dan waitForAck: true
        const sendPromise = WPP.chat.sendTextMessage(target, text, {
          createChat: true,
          waitForAck: true,
        });

        // Timeout balap 12 detik agar tidak hang jika server WA lambat mengirim ACK
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve({ isTimeout: true }), 12000);
        });

        const res = await Promise.race([sendPromise, timeoutPromise]);

        if (res && !res.isTimeout) {
          const msgId = res?.id
            ? (typeof res.id === 'object' ? (res.id._serialized || res.id.toString()) : String(res.id))
            : null;
          const isFailure = !!res?.isSendFailure || (typeof res?.ack === 'number' && res.ack < 0);
          return {
            id: msgId || 'OK',
            ack: typeof res?.ack === 'number' ? res.ack : 1,
            to: res?.to ? (typeof res.to === 'object' ? (res.to._serialized || res.to.toString()) : String(res.to)) : target,
            isSendFailure: isFailure,
          };
        }

        // Jika timeout ACK 12 detik, cek apakah pesan sudah masuk ke obrolan
        const chat = WPP.chat.get(target) || WPP.chat.getActiveChat();
        const lastMsg = chat?.msgs?.last();
        const isFailure = !!lastMsg?.isSendFailure || (typeof lastMsg?.ack === 'number' && lastMsg.ack < 0);
        return {
          id: lastMsg?.id?._serialized || lastMsg?.id || ('wa-msg-' + Date.now()),
          ack: typeof lastMsg?.ack === 'number' ? lastMsg.ack : 0,
          to: target,
          queued: true,
          isSendFailure: isFailure,
        };
      }, { target: targetChatId, text: message });
    } catch (errEvaluate) {
      console.warn(`[WPPConnect] Direct WPP.chat.sendTextMessage gagal: ${errEvaluate.message}, mencoba client.sendText...`);
      lastSendError = errEvaluate;
    }
  }

  // METODE 2: Fallback ke client.sendText bawaan WPPConnect
  if (!sendResult) {
    try {
      console.log(`[WPPConnect] Mencoba client.sendText ke ${targetChatId}...`);
      const fallbackRes = await client.sendText(targetChatId, message, {
        createChat: true,
        waitForAck: false,
      });
      const msgId = fallbackRes?.id
        ? (typeof fallbackRes.id === 'object' ? (fallbackRes.id._serialized || fallbackRes.id.toString()) : String(fallbackRes.id))
        : 'OK';
      sendResult = {
        id: msgId,
        ack: 1,
        to: targetChatId,
      };
    } catch (errSendText) {
      console.error(`[WPPConnect] client.sendText juga gagal:`, errSendText.message);
      if (!lastSendError) lastSendError = errSendText;
    }
  }

  if (!sendResult || !sendResult.id || sendResult.isSendFailure) {
    throw new Error(lastSendError ? lastSendError.message : `Gagal mengirim pesan WhatsApp ke ${cleanPhone}: pesan ditolak oleh WhatsApp (isSendFailure: true).`);
  }

  console.log(`[WPPConnect] ✅ Pesan sukses terkirim ke ${targetChatId} (ID: ${sendResult.id}, ACK: ${sendResult.ack})`);

  return {
    to: cleanPhone,
    chatId: targetChatId,
    messageId: sendResult.id,
    ack: sendResult.ack,
  };
}

/**
 * Send WhatsApp file (document, PDF, etc.) reliably to any phone number
 */
async function sendFileWithFallback(client, phone, fileBase64, filename = 'Invoice.pdf', caption = '') {
  if (!client || connectionState !== 'CONNECTED') {
    throw new Error('WPPConnect belum terhubung ke WhatsApp. Silakan scan QR code terlebih dahulu.');
  }

  const cleanPhone = formatWhatsAppPhone(phone);
  if (!cleanPhone || cleanPhone.length < 8) {
    throw new Error('Nomor telepon tidak valid.');
  }

  if (client.page) {
    await dismissBlockingModals(client.page);
  }

  const standardChatId = `${cleanPhone}@c.us`;
  let targetChatId = standardChatId;

  // Pastikan data uri base64 terformat dengan benar
  let dataUri = fileBase64;
  if (!dataUri.startsWith('data:')) {
    dataUri = `data:application/pdf;base64,${fileBase64}`;
  }

  let sendResult = null;
  let lastSendError = null;

  // METODE 1: Direct WPP.chat.sendFileMessage dalam browser context
  if (client.page) {
    try {
      console.log(`[WPPConnect] Mengirim berkas ${filename} ke ${targetChatId}...`);
      sendResult = await client.page.evaluate(async ({ target, file, name, text }) => {
        if (typeof WPP === 'undefined' || !WPP.chat) {
          throw new Error('WPP.chat tidak tersedia di browser');
        }

        try {
          await WPP.chat.find(target);
        } catch (e) {}

        const sendPromise = WPP.chat.sendFileMessage(target, file, {
          type: 'document',
          filename: name,
          caption: text || '',
          createChat: true,
          waitForAck: true,
        });

        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve({ isTimeout: true }), 20000);
        });

        const res = await Promise.race([sendPromise, timeoutPromise]);

        if (res && !res.isTimeout) {
          const msgId = res?.id
            ? (typeof res.id === 'object' ? (res.id._serialized || res.id.toString()) : String(res.id))
            : null;
          const isFailure = !!res?.isSendFailure || (typeof res?.ack === 'number' && res.ack < 0);
          return {
            id: msgId || 'OK',
            ack: typeof res?.ack === 'number' ? res.ack : 1,
            to: res?.to ? (typeof res.to === 'object' ? (res.to._serialized || res.to.toString()) : String(res.to)) : target,
            isSendFailure: isFailure,
          };
        }

        const chat = WPP.chat.get(target) || WPP.chat.getActiveChat();
        const lastMsg = chat?.msgs?.last();
        const isFailure = !!lastMsg?.isSendFailure || (typeof lastMsg?.ack === 'number' && lastMsg.ack < 0);
        return {
          id: lastMsg?.id?._serialized || lastMsg?.id || ('wa-file-' + Date.now()),
          ack: typeof lastMsg?.ack === 'number' ? lastMsg.ack : 0,
          to: target,
          queued: true,
          isSendFailure: isFailure,
        };
      }, { target: targetChatId, file: dataUri, name: filename, text: caption });
    } catch (errEvaluate) {
      console.warn(`[WPPConnect] Direct WPP.chat.sendFileMessage gagal: ${errEvaluate.message}, mencoba client.sendFile...`);
      lastSendError = errEvaluate;
    }
  }

  // METODE 2: Fallback ke client.sendFile bawaan WPPConnect
  if (!sendResult && typeof client.sendFile === 'function') {
    try {
      console.log(`[WPPConnect] Mencoba client.sendFile ke ${targetChatId}...`);
      const fallbackRes = await client.sendFile(targetChatId, dataUri, filename, caption);
      const msgId = fallbackRes?.id
        ? (typeof fallbackRes.id === 'object' ? (fallbackRes.id._serialized || fallbackRes.id.toString()) : String(fallbackRes.id))
        : 'OK';
      sendResult = {
        id: msgId,
        ack: 1,
        to: targetChatId,
      };
    } catch (errSendFile) {
      console.error(`[WPPConnect] client.sendFile juga gagal:`, errSendFile.message);
      if (!lastSendError) lastSendError = errSendFile;
    }
  }

  if (!sendResult || !sendResult.id || sendResult.isSendFailure) {
    throw new Error(lastSendError ? lastSendError.message : `Gagal mengirim berkas PDF WhatsApp ke ${cleanPhone}`);
  }

  console.log(`[WPPConnect] ✅ Berkas ${filename} berhasil dikirim ke ${targetChatId} (ID: ${sendResult.id}, ACK: ${sendResult.ack})`);

  return {
    to: cleanPhone,
    chatId: targetChatId,
    messageId: sendResult.id,
    ack: sendResult.ack,
    filename,
  };
}


/**
 * GET /api/check-phone - Periksa status nomor dan histori pesan di WhatsApp
 */
app.get('/api/check-phone', async (req, res) => {
  try {
    const phone = req.query.phone;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Parameter phone wajib diisi' });
    }
    const clean = formatWhatsAppPhone(phone);
    const standardChatId = `${clean}@c.us`;

    if (!clientInstance || connectionState !== 'CONNECTED' || !clientInstance.page) {
      return res.status(503).json({ success: false, message: 'WPPConnect belum terhubung' });
    }

    const check = await clientInstance.page.evaluate(async (rawId) => {
      let queryRes = null;
      if (typeof WPP !== 'undefined' && WPP.contact && typeof WPP.contact.queryExists === 'function') {
        try {
          queryRes = await WPP.contact.queryExists(rawId);
        } catch (e) {}
      }

      const widStr = queryRes?.wid ? (queryRes.wid._serialized || queryRes.wid.toString()) : rawId;
      const lidStr = queryRes?.lid ? (queryRes.lid._serialized || queryRes.lid.toString()) : null;

      const chat = (typeof WPP !== 'undefined' && WPP.chat)
        ? (WPP.chat.get(lidStr || widStr) || WPP.chat.get(widStr))
        : null;

      const lastMsgs = (chat?.msgs || []).slice(-5).map((m) => {
        const safeProps = {};
        for (const k of Object.keys(m || {})) {
          if (typeof m[k] !== 'function' && typeof m[k] !== 'object') {
            safeProps[k] = m[k];
          }
        }
        return {
          id: m?.id?._serialized || m?.id,
          body: m?.body,
          ack: m?.ack,
          isSendFailure: !!m?.isSendFailure,
          type: m?.type,
          subtype: m?.subtype,
          t: m?.t,
          to: m?.to?._serialized || m?.to,
          props: safeProps,
        };
      });

      return {
        exists: !!queryRes,
        wid: widStr,
        lid: lidStr,
        biz: !!queryRes?.biz,
        bizName: queryRes?.bizInfo?.verifiedName?.name || null,
        chatFound: !!chat,
        chatId: chat?.id?._serialized || null,
        chatCanSend: chat?.canSendMsg ? (typeof chat.canSendMsg === 'function' ? chat.canSendMsg() : chat.canSendMsg) : null,
        chatIsReadOnly: chat?.isReadOnly,
        contactIsBlocked: chat?.contact?.isBlocked,
        lastMessages: lastMsgs,
      };
    }, standardChatId);

    res.json({ success: true, phone: clean, ...check });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/**
 * GET /api/debug-chats - Ambil daftar chat aktif dan histori terbaru
 */
app.get('/api/debug-chats', async (req, res) => {
  try {
    if (!clientInstance || connectionState !== 'CONNECTED' || !clientInstance.page) {
      return res.status(503).json({ success: false, message: 'WPPConnect belum terhubung' });
    }

    const chats = await clientInstance.page.evaluate(async () => {
      if (typeof WPP === 'undefined' || !WPP.chat) return [];
      const list = await WPP.chat.list({ count: 15 });
      return (list || []).map((c) => {
        const lastMsg = c?.msgs?.last();
        return {
          id: c.id?._serialized || c.id,
          name: c.name || c.formattedTitle || c.contact?.name || c.contact?.pushname,
          isGroup: !!c.isGroup,
          unreadCount: c.unreadCount || 0,
          lastMsg: lastMsg ? {
            id: lastMsg.id?._serialized || lastMsg.id,
            body: (lastMsg.body || '').substring(0, 40),
            ack: lastMsg.ack,
            isSendFailure: !!lastMsg.isSendFailure,
          } : null,
        };
      });
    });

    res.json({ success: true, chats });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/**
 * GET /api/screenshot - Capture current WhatsApp Web screenshot for debugging
 */
app.get('/api/screenshot', async (req, res) => {
  try {
    if (!clientInstance || !clientInstance.page) {
      return res.status(503).json({ success: false, message: 'Browser belum siap' });
    }
    const buffer = await clientInstance.page.screenshot({ type: 'png' });
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/**
 * POST /api/diagnose-send - Run precise diagnostic on sendTextMessage
 */
app.post('/api/diagnose-send', async (req, res) => {
  try {
    const { to, text = 'Pesan uji coba diagnostik' } = req.body;
    if (!clientInstance || !clientInstance.page) {
      return res.status(503).json({ success: false, message: 'Browser belum siap' });
    }

    const diag = await clientInstance.page.evaluate(async ({ target, message }) => {
      let findChat = null;
      let findErr = null;
      try {
        findChat = await WPP.chat.find(target);
      } catch (e) {
        findErr = e.message;
      }

      let openBottomRes = null;
      try {
        openBottomRes = await WPP.chat.openChatBottom(target);
      } catch (e) {}

      let sendRes = null;
      let sendErr = null;
      try {
        sendRes = await WPP.chat.sendTextMessage(target, message, { waitForAck: false });
      } catch (e) {
        sendErr = e.message;
      }

      await new Promise((r) => setTimeout(r, 2000));

      const chat = WPP.chat.get(target);
      const msgsArray = Array.isArray(chat?.msgs) ? chat.msgs : (chat?.msgs?.models ? chat.msgs.models : (chat?.msgs ? Array.from(chat.msgs) : []));

      const messages = msgsArray.map((m) => ({
        id: m.id?._serialized || m.id,
        body: m.body,
        isSendFailure: !!m.isSendFailure,
        ack: m.ack,
        type: m.type,
        subtype: m.subtype,
        status: m.status,
      }));

      return {
        target,
        findErr,
        findChatId: findChat?.id?._serialized || findChat?.id,
        openBottomRes,
        sendRes: {
          id: sendRes?.id?._serialized || sendRes?.id,
          ack: sendRes?.ack,
          to: sendRes?.to?._serialized || sendRes?.to,
          sendMsgResult: sendRes?.sendMsgResult,
        },
        sendErr,
        chatFound: !!chat,
        messagesCount: msgsArray.length,
        messages,
      };
    }, { target: to, message: text });

    res.json({ success: true, diag });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/**
 * POST /api/send-via-dom - Send message using native DOM keyboard typing (100% human-like flow)
 */
app.post('/api/send-via-dom', async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, message: 'Nomor telepon dan pesan wajib diisi' });
    }
    const clean = formatWhatsAppPhone(phone);
    const standardChatId = `${clean}@c.us`;

    if (!clientInstance || connectionState !== 'CONNECTED' || !clientInstance.page) {
      return res.status(503).json({ success: false, message: 'WPPConnect belum terhubung' });
    }

    const page = clientInstance.page;
    await dismissBlockingModals(page);

    // 1. Find and open chat natively via WPP
    const chatInfo = await page.evaluate(async (to) => {
      const c = await WPP.chat.find(to);
      const chatId = c.id?._serialized || c.id?.toString();
      await WPP.chat.openChatBottom(chatId);
      return { id: chatId, name: c.name };
    }, standardChatId);

    // 2. Wait for chat UI and input box
    await new Promise((r) => setTimeout(r, 1200));

    // 3. Find and click input box
    const inputSelector = 'footer div[contenteditable="true"], div[contenteditable="true"][data-tab="10"], footer [role="textbox"]';
    await page.waitForSelector(inputSelector, { timeout: 6000 });
    await page.click(inputSelector);

    // 4. Type the message
    await page.keyboard.type(message, { delay: 10 });
    await new Promise((r) => setTimeout(r, 400));

    // 5. Click the Send button or press Enter
    const sentViaClick = await page.evaluate(() => {
      const sendBtn = document.querySelector('button span[data-icon="send"]')?.closest('button') ||
                      document.querySelector('span[data-icon="send"]')?.closest('button') ||
                      document.querySelector('footer button[aria-label="Kirim"], footer button[aria-label="Send"]');
      if (sendBtn) {
        sendBtn.click();
        return true;
      }
      return false;
    });

    if (!sentViaClick) {
      await page.keyboard.press('Enter');
    }

    // 6. Wait for message to be sent and observe status
    await new Promise((r) => setTimeout(r, 2000));

    const lastMsg = await page.evaluate((chatId) => {
      const chat = WPP.chat.get(chatId) || WPP.chat.getActiveChat();
      const last = chat?.msgs?.last();
      return last ? {
        id: last.id?._serialized || last.id,
        body: last.body,
        ack: last.ack,
        isSendFailure: !!last.isSendFailure,
      } : null;
    }, chatInfo.id);

    res.json({
      success: true,
      chat: chatInfo,
      lastMsg,
    });
  } catch (e) {
    console.error('[WPPConnect DOM Send Error]:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});



/**
 * POST /api/clear-chat - Hapus atau bersihkan pesan gagal dalam chat tertentu
 */
app.post('/api/clear-chat', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Parameter phone wajib diisi' });
    }
    const clean = formatWhatsAppPhone(phone);
    const standardChatId = `${clean}@c.us`;

    if (!clientInstance || connectionState !== 'CONNECTED' || !clientInstance.page) {
      return res.status(503).json({ success: false, message: 'WPPConnect belum terhubung' });
    }

    const result = await clientInstance.page.evaluate(async (rawId) => {
      if (typeof WPP === 'undefined' || !WPP.chat) {
        return { success: false, error: 'WPP.chat unavailable' };
      }

      let queryRes = null;
      if (WPP.contact && typeof WPP.contact.queryExists === 'function') {
        try {
          queryRes = await WPP.contact.queryExists(rawId);
        } catch (e) {}
      }

      const widStr = queryRes?.wid ? (queryRes.wid._serialized || queryRes.wid.toString()) : rawId;
      const lidStr = queryRes?.lid ? (queryRes.lid._serialized || queryRes.lid.toString()) : null;

      const targetIds = [lidStr, widStr, rawId].filter(Boolean);
      let cleared = [];

      for (const tId of targetIds) {
        try {
          const chat = WPP.chat.get(tId);
          if (chat) {
            // Coba hapus chat secara keseluruhan agar WhatsApp Web membuat sesi chat baru yang bersih
            if (typeof WPP.chat.delete === 'function') {
              await WPP.chat.delete(tId);
              cleared.push({ id: tId, action: 'delete' });
            } else if (typeof WPP.chat.clear === 'function') {
              await WPP.chat.clear(tId);
              cleared.push({ id: tId, action: 'clear' });
            }
          }
        } catch (err) {
          cleared.push({ id: tId, error: err.message });
        }
      }

      return { success: true, cleared };
    }, standardChatId);

    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});


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
    console.error('[WPPConnect] Gagal mengirim pesan:', err.message);
    res.status(422).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * POST /api/send-file - Kirim berkas dokumen/PDF via WhatsApp
 */
app.post('/api/send-file', async (req, res) => {
  try {
    const { phone, filename = 'Invoice.pdf', caption = '' } = req.body;
    const fileBase64 = req.body.fileBase64 || req.body.file;

    if (!phone || !fileBase64) {
      return res.status(400).json({
        success: false,
        message: 'Nomor telepon (phone) dan data berkas (fileBase64/file) wajib diisi.',
      });
    }

    if (!clientInstance || connectionState !== 'CONNECTED') {
      return res.status(503).json({
        success: false,
        message: 'WPPConnect belum terhubung ke WhatsApp. Silakan scan QR code terlebih dahulu.',
        status: connectionState,
      });
    }

    const result = await sendFileWithFallback(clientInstance, phone, fileBase64, filename, caption);

    res.json({
      success: true,
      message: `Berkas ${filename} berhasil dikirim via WPPConnect!`,
      to: result.to,
      chatId: result.chatId,
      messageId: result.messageId,
      filename: result.filename,
    });
  } catch (err) {
    console.error(`[WPPConnect Error Kirim Berkas]:`, err.message);
    res.status(422).json({
      success: false,
      message: err.message || 'Gagal mengirim berkas via WhatsApp',
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
    await cleanupSession(true);

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
