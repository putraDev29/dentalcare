<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Encounter;
use App\Models\Appointment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppGatewayService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.whatsapp_gateway.url', 'http://127.0.0.1:21465');
    }

    /**
     * Get connection status from WPPConnect Gateway
     */
    public function getStatus(): array
    {
        try {
            $response = Http::timeout(3)->get("{$this->baseUrl}/api/status");
            if ($response->successful()) {
                return $response->json();
            }
            return [
                'status' => 'ERROR',
                'connected' => false,
                'message' => 'Gateway server responded with status: ' . $response->status(),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'OFFLINE',
                'connected' => false,
                'message' => 'WPPConnect Gateway offline atau belum dijalankan di port 21465.',
            ];
        }
    }

    /**
     * Get QR code from WPPConnect Gateway
     */
    public function getQrCode(): array
    {
        try {
            $response = Http::timeout(4)->get("{$this->baseUrl}/api/qr");
            if ($response->successful()) {
                return $response->json();
            }
            return [
                'status' => 'ERROR',
                'qr' => null,
                'message' => 'Gagal memuat QR Code.',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'OFFLINE',
                'qr' => null,
                'message' => 'WPPConnect Gateway tidak aktif.',
            ];
        }
    }

    /**
     * Logout and destroy WhatsApp session
     */
    public function logout(): array
    {
        try {
            $response = Http::timeout(25)->post("{$this->baseUrl}/api/logout");
            if ($response->successful()) {
                return $response->json();
            }
            return [
                'success' => false,
                'message' => $response->json('message') ?? 'Gagal logout dari WhatsApp.',
            ];
        } catch (\Exception $e) {
            Log::error('WhatsAppGateway logout error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Koneksi ke gateway gagal: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Reconnect / restart client to get fresh QR code
     */
    public function reconnect(): array
    {
        try {
            $response = Http::timeout(25)->post("{$this->baseUrl}/api/reconnect");
            if ($response->successful()) {
                return $response->json();
            }
            return [
                'success' => false,
                'message' => $response->json('message') ?? 'Gagal inisialisasi ulang gateway.',
            ];
        } catch (\Exception $e) {
            Log::error('WhatsAppGateway reconnect error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Koneksi ke gateway gagal: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send a single message
     */
    public function sendMessage(string $phone, string $message): array
    {
        try {
            $response = Http::timeout(15)->post("{$this->baseUrl}/api/send-message", [
                'phone' => $phone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'message' => $response->json('message') ?? 'Gagal mengirim pesan via WPPConnect.',
            ];
        } catch (\Exception $e) {
            Log::error('WhatsAppGateway sendMessage error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Koneksi ke gateway gagal: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send bulk messages
     */
    public function sendBulk(array $recipients): array
    {
        try {
            $response = Http::timeout(60)->post("{$this->baseUrl}/api/send-bulk", [
                'recipients' => $recipients,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'message' => $response->json('message') ?? 'Gagal mengirim pesan massal.',
            ];
        } catch (\Exception $e) {
            Log::error('WhatsAppGateway sendBulk error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Koneksi ke gateway gagal: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Find all H-1 patients and send automatic WhatsApp reminder
     */
    public function sendH1ControlReminders(?string $customTemplate = null): array
    {
        $tomorrow = now()->addDay()->toDateString();
        $tomorrowFormatted = now()->addDay()->translatedFormat('d F Y');

        // Find patients with nextControlDate = tomorrow
        $encounters = Encounter::whereNotNull('follow_up_plan')
            ->where('follow_up_plan->nextControlDate', $tomorrow)
            ->get();

        $appointments = Appointment::whereDate('appointment_date', $tomorrow)->get();

        $patientIds = array_unique(array_merge(
            $encounters->pluck('patient_id')->toArray(),
            $appointments->pluck('patient_id')->toArray()
        ));

        if (empty($patientIds)) {
            return [
                'success' => true,
                'total' => 0,
                'sent' => 0,
                'failed' => 0,
                'message' => "Tidak ada pasien dengan jadwal kontrol H-1 besok ({$tomorrowFormatted}).",
                'results' => [],
            ];
        }

        $patients = Patient::whereIn('id', $patientIds)->get();
        $recipients = [];

        foreach ($patients as $p) {
            if (empty($p->phone)) continue;

            $enc = $encounters->firstWhere('patient_id', $p->id);
            $apt = $appointments->firstWhere('patient_id', $p->id);

            $doctorName = $enc->doctor_name ?? $apt->doctor_name ?? 'drg. DPJP';

            $defaultTemplate = "Halo Kak *{nama}*,\n\nMengingatkan jadwal kontrol kesehatan gigi Anda di *Dental Care Clinic*:\n\n🗓 *Tanggal:* {tanggal} (Besok)\n⏰ *Pukul:* 09:00 WIB\n👨‍⚕️ *Dokter DPJP:* {dokter}\n🏥 *Klinik:* Dental Care Clinic\n📋 *No. RM:* {no_rm}\n\nMohon konfirmasi kehadiran dengan membalas pesan ini ya Kak (Ketik *YA* jika hadir). Terima kasih! 🙏🦷";

            $template = $customTemplate ?: $defaultTemplate;
            $msg = str_replace(
                ['{nama}', '{tanggal}', '{dokter}', '{no_rm}'],
                [$p->name, $tomorrowFormatted, $doctorName, $p->medical_record_number],
                $template
            );

            $recipients[] = [
                'id' => $p->id,
                'name' => $p->name,
                'phone' => $p->phone,
                'message' => $msg,
            ];
        }

        if (empty($recipients)) {
            return [
                'success' => true,
                'total' => 0,
                'sent' => 0,
                'failed' => 0,
                'message' => "Seluruh pasien H-1 tidak memiliki nomor telepon yang valid.",
                'results' => [],
            ];
        }

        return $this->sendBulk($recipients);
    }
}
