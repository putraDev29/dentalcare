<?php

namespace App\Console\Commands;

use App\Services\WhatsAppGatewayService;
use Illuminate\Console\Command;

class SendWhatsAppH1Reminders extends Command
{
    protected $signature = 'whatsapp:send-h1';
    protected $description = 'Kirim otomatis pengingat jadwal kontrol H-1 ke seluruh pasien via WPPConnect';

    public function handle(WhatsAppGatewayService $gateway): int
    {
        $this->info('Memulai pengecekan dan pengiriman pengingat jadwal kontrol H-1...');

        $status = $gateway->getStatus();
        if (empty($status['connected'])) {
            $this->error('WPPConnect Gateway belum terhubung/offline. Status: ' . ($status['status'] ?? 'UNKNOWN'));
            return 1;
        }

        $res = $gateway->sendH1ControlReminders();

        if (!empty($res['success'])) {
            $this->info("Berhasil! Total: {$res['total']}, Terkirim: {$res['sent']}, Gagal: {$res['failed']}");
            return 0;
        }

        $this->error('Gagal mengirim pengingat: ' . ($res['message'] ?? 'Error tidak diketahui'));
        return 1;
    }
}
