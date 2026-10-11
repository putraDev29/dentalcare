<?php

namespace App\Http\Controllers;

use App\Services\WhatsAppGatewayService;
use Illuminate\Http\Request;

class WhatsAppGatewayController extends Controller
{
    protected WhatsAppGatewayService $gateway;

    public function __construct(WhatsAppGatewayService $gateway)
    {
        $this->gateway = $gateway;
    }

    /**
     * Get WPPConnect gateway status
     */
    public function status()
    {
        $status = $this->gateway->getStatus();
        return response()->json($status);
    }

    /**
     * Get QR code for scanning
     */
    public function qr()
    {
        $qr = $this->gateway->getQrCode();
        return response()->json($qr);
    }

    /**
     * Send single WhatsApp message
     */
    public function send(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string',
        ]);

        $res = $this->gateway->sendMessage($request->input('phone'), $request->input('message'));
        return response()->json($res);
    }

    /**
     * Send bulk WhatsApp messages
     */
    public function sendBulk(Request $request)
    {
        $request->validate([
            'recipients' => 'required|array',
            'recipients.*.phone' => 'required|string',
            'recipients.*.message' => 'required|string',
        ]);

        $res = $this->gateway->sendBulk($request->input('recipients'));
        return response()->json($res);
    }

    /**
     * Send automated H-1 control reminders to all qualifying patients
     */
    public function sendH1(Request $request)
    {
        $template = $request->input('template');
        $res = $this->gateway->sendH1ControlReminders($template);
        return response()->json($res);
    }

    /**
     * Logout and destroy current WhatsApp session
     */
    public function logout()
    {
        $res = $this->gateway->logout();
        return response()->json($res);
    }

    /**
     * Reconnect / restart gateway client
     */
    public function reconnect()
    {
        $res = $this->gateway->reconnect();
        return response()->json($res);
    }
}
