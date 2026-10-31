<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\FinanceTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::query();

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('patient_name', 'like', "%{$s}%")
                  ->orWhere('invoice_number', 'like', "%{$s}%")
                  ->orWhere('patient_mrn', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('patientId')) {
            $query->where('patient_id', $request->input('patientId'));
        }

        return response()->json($query->with('patient')->orderByDesc('created_at')->get());
    }

    public function show($id)
    {
        $invoice = Invoice::with('patient')->where('id', $id)->orWhere('invoice_number', $id)->firstOrFail();
        return response()->json($invoice);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|string',
            'patientName' => 'required|string',
            'patientMrn' => 'nullable|string',
            'patientPhone' => 'nullable|string',
            'insuranceType' => 'nullable|string',
            'encounterId' => 'nullable|string',
            'items' => 'required|array',
            'subtotal' => 'required|numeric',
            'discount' => 'nullable|numeric',
            'tax' => 'nullable|numeric',
            'totalAmount' => 'required|numeric',
            'coveredByInsurance' => 'nullable|numeric',
            'patientPaidAmount' => 'nullable|numeric',
            'status' => 'nullable|string',
        ]);

        $id = 'INV-' . strtoupper(Str::random(6));
        $invoiceNumber = 'INV-' . date('Ym') . '-' . str_pad((string) rand(100, 9999), 4, '0', STR_PAD_LEFT);

        $covered = $validated['coveredByInsurance'] ?? 0;
        $paid = $validated['patientPaidAmount'] ?? 0;
        $total = $validated['totalAmount'];
        $outstanding = max(0, $total - $covered - $paid);
        $status = $outstanding <= 0 ? 'paid' : ($paid > 0 ? 'partially_paid' : 'pending');

        $payments = [];
        if ($paid > 0) {
            $isDp = ($outstanding > 0);
            $paymentType = $request->input('paymentType', $isDp ? 'dp' : 'full');
            $paymentId = 'PAY-' . strtoupper(Str::random(6));
            $paymentMethod = $request->input('paymentMethod', 'cash');
            $cashier = $request->input('cashierName', 'Kasir Dental Care');
            $customNotes = $request->input('notes', $isDp ? 'Pembayaran Uang Muka (DP)' : null);
            $tendered = (float) $request->input('tenderedAmount', $paid);
            $change = max(0, (float) $request->input('changeAmount', $tendered - $paid));

            $payments[] = [
                'id' => $paymentId,
                'transactionNumber' => 'TRX-' . strtoupper(Str::random(8)),
                'amount' => $paid,
                'tenderedAmount' => $tendered,
                'changeAmount' => $change,
                'paymentMethod' => $paymentMethod,
                'cashierName' => $cashier,
                'type' => $paymentType,
                'notes' => $customNotes,
                'paidAt' => now()->toIso8601String(),
            ];

            $descType = ($paymentType === 'dp') ? 'Pembayaran Uang Muka (DP)' : 'Pembayaran Kasir';
            // Automatically create Finance Transaction as Income
            FinanceTransaction::create([
                'id' => 'FIN-' . strtoupper(Str::random(6)),
                'transaction_number' => 'TRX-IN-' . date('Ymd-His') . '-' . rand(10, 99),
                'type' => 'income',
                'category' => 'patient_payment',
                'amount' => $paid,
                'payment_method' => $paymentMethod,
                'description' => "{$descType} Pasien: {$validated['patientName']} ({$invoiceNumber})",
                'reference_id' => $id,
                'reference_type' => 'invoice',
                'date' => date('Y-m-d'),
                'operator_name' => $cashier,
                'notes' => "ID Pembayaran: {$paymentId} | Tipe: {$paymentType} | Metode: {$paymentMethod} | Diterima: Rp " . number_format($tendered, 0, ',', '.') . " | Kembalian: Rp " . number_format($change, 0, ',', '.') . ($customNotes ? " | Catatan: {$customNotes}" : ""),
            ]);
        }

        $invoice = Invoice::create([
            'id' => $id,
            'facility_id' => 'FAC-001',
            'invoice_number' => $invoiceNumber,
            'encounter_id' => $validated['encounterId'] ?? null,
            'patient_id' => $validated['patientId'],
            'patient_name' => $validated['patientName'],
            'patient_mrn' => $validated['patientMrn'] ?? null,
            'patient_phone' => $validated['patientPhone'] ?? null,
            'insurance_type' => $validated['insuranceType'] ?? 'umum',
            'items' => $validated['items'],
            'subtotal' => $validated['subtotal'],
            'discount' => $validated['discount'] ?? 0,
            'tax' => $validated['tax'] ?? 0,
            'total_amount' => $total,
            'covered_by_insurance' => $covered,
            'patient_paid_amount' => $paid,
            'outstanding_amount' => $outstanding,
            'status' => $status,
            'payments' => $payments,
            'paid_at' => $status === 'paid' ? now() : null,
        ]);

        return response()->json($invoice, 201);
    }

    public function recordPayment(Request $request)
    {
        $validated = $request->validate([
            'invoiceId' => 'required|string',
            'paymentMethod' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'cashierName' => 'nullable|string',
            'paymentType' => 'nullable|string',
            'notes' => 'nullable|string',
            'tenderedAmount' => 'nullable|numeric|min:0',
            'changeAmount' => 'nullable|numeric|min:0',
        ]);

        $invoice = Invoice::where('id', $validated['invoiceId'])
            ->orWhere('invoice_number', $validated['invoiceId'])
            ->firstOrFail();
        $amount = (float) $validated['amount'];
        $method = $validated['paymentMethod'];
        $cashier = $validated['cashierName'] ?? 'Kasir Dental Care';

        $currentPaid = (float) $invoice->patient_paid_amount;
        $newPaid = $currentPaid + $amount;
        $covered = (float) $invoice->covered_by_insurance;
        $total = (float) $invoice->total_amount;
        $outstanding = max(0, $total - $covered - $newPaid);
        $newStatus = $outstanding <= 0 ? 'paid' : 'partially_paid';

        $paymentType = $request->input('paymentType');
        if (empty($paymentType)) {
            $paymentType = ($outstanding <= 0) ? ($currentPaid > 0 ? 'settlement' : 'full') : 'dp';
        }
        $customNotes = $request->input('notes');
        $tendered = (float) $request->input('tenderedAmount', $amount);
        $change = max(0, (float) $request->input('changeAmount', $tendered - $amount));

        $payments = $invoice->payments ?: [];
        $paymentRecord = [
            'id' => 'PAY-' . strtoupper(Str::random(6)),
            'transactionNumber' => 'TRX-' . strtoupper(Str::random(8)),
            'amount' => $amount,
            'tenderedAmount' => $tendered,
            'changeAmount' => $change,
            'paymentMethod' => $method,
            'cashierName' => $cashier,
            'type' => $paymentType,
            'notes' => $customNotes,
            'paidAt' => now()->toIso8601String(),
        ];
        $payments[] = $paymentRecord;

        $invoice->update([
            'patient_paid_amount' => $newPaid,
            'outstanding_amount' => $outstanding,
            'status' => $newStatus,
            'payments' => $payments,
            'paid_at' => $newStatus === 'paid' ? now() : $invoice->paid_at,
        ]);

        $descType = ($paymentType === 'dp')
            ? 'Pembayaran Uang Muka (DP)'
            : (($currentPaid > 0 && $outstanding <= 0) ? 'Pelunasan Tagihan (Sisa DP)' : 'Pembayaran Kasir');

        // Automatically sync to Finance Transactions as Income (Kas Masuk)
        FinanceTransaction::create([
            'id' => 'FIN-' . strtoupper(Str::random(6)),
            'transaction_number' => 'TRX-IN-' . date('Ymd-His') . '-' . rand(10, 99),
            'type' => 'income',
            'category' => 'patient_payment',
            'amount' => $amount,
            'payment_method' => $method,
            'description' => "{$descType} Pasien: {$invoice->patient_name} ({$invoice->invoice_number})",
            'reference_id' => $invoice->id,
            'reference_type' => 'invoice',
            'date' => date('Y-m-d'),
            'operator_name' => $cashier,
            'notes' => "ID Pembayaran: {$paymentRecord['id']} | Tipe: {$paymentType} | Metode: {$method} | Diterima: Rp " . number_format($tendered, 0, ',', '.') . " | Kembalian: Rp " . number_format($change, 0, ',', '.') . ($customNotes ? " | Catatan: {$customNotes}" : ""),
        ]);

        $invoice->load('patient');
        return response()->json($invoice);
    }
}
