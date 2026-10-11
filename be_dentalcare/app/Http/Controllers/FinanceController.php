<?php

namespace App\Http\Controllers;

use App\Models\FinanceTransaction;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FinanceController extends Controller
{
    /**
     * Otomatis sinkronisasi seluruh pembayaran kasir pasien ke buku kas kas masuk (FinanceTransaction)
     */
    public static function syncPatientPaymentsToFinance(): void
    {
        $invoices = Invoice::where('patient_paid_amount', '>', 0)
            ->orWhereNotNull('paid_at')
            ->get();

        foreach ($invoices as $inv) {
            $payments = is_array($inv->payments) ? $inv->payments : [];

            if (!empty($payments)) {
                foreach ($payments as $pay) {
                    $payId = $pay['id'] ?? null;
                    $payAmount = (float) ($pay['amount'] ?? 0);
                    if ($payAmount <= 0) continue;

                    $exists = FinanceTransaction::where('reference_id', $inv->id)
                        ->where(function ($q) use ($payId, $payAmount) {
                            if ($payId) {
                                $q->where('notes', 'like', "%{$payId}%");
                            } else {
                                $q->where('amount', $payAmount)->where('type', 'income');
                            }
                        })
                        ->exists();

                    if (!$exists) {
                        $method = $pay['paymentMethod'] ?? 'cash';
                        $cashier = $pay['cashierName'] ?? 'Kasir Dental Care';
                        $payDate = isset($pay['paidAt']) ? substr($pay['paidAt'], 0, 10) : date('Y-m-d');

                        FinanceTransaction::create([
                            'id' => 'FIN-' . strtoupper(Str::random(6)),
                            'transaction_number' => 'TRX-IN-' . date('Ymd-His') . '-' . rand(10, 99),
                            'type' => 'income',
                            'category' => 'patient_payment',
                            'amount' => $payAmount,
                            'payment_method' => $method,
                            'description' => "Pembayaran Kasir Pasien: {$inv->patient_name} ({$inv->invoice_number})",
                            'reference_id' => $inv->id,
                            'reference_type' => 'invoice',
                            'date' => $payDate,
                            'operator_name' => $cashier,
                            'notes' => "ID Pembayaran: " . ($payId ?: 'PAY-DIRECT') . " | Metode: {$method}",
                        ]);
                    }
                }
            } else {
                $paidAmt = (float) $inv->patient_paid_amount;
                if ($paidAmt > 0) {
                    $exists = FinanceTransaction::where('reference_id', $inv->id)
                        ->where('type', 'income')
                        ->exists();

                    if (!$exists) {
                        $payDate = $inv->paid_at ? $inv->paid_at->format('Y-m-d') : ($inv->created_at ? $inv->created_at->format('Y-m-d') : date('Y-m-d'));
                        FinanceTransaction::create([
                            'id' => 'FIN-' . strtoupper(Str::random(6)),
                            'transaction_number' => 'TRX-IN-' . date('Ymd-His') . '-' . rand(10, 99),
                            'type' => 'income',
                            'category' => 'patient_payment',
                            'amount' => $paidAmt,
                            'payment_method' => 'cash',
                            'description' => "Pembayaran Kasir Pasien: {$inv->patient_name} ({$inv->invoice_number})",
                            'reference_id' => $inv->id,
                            'reference_type' => 'invoice',
                            'date' => $payDate,
                            'operator_name' => 'Kasir Dental Care',
                            'notes' => "Pembayaran tindakan klinik gigi ({$inv->invoice_number})",
                        ]);
                    }
                }
            }
        }
    }

    public function summary()
    {
        self::syncPatientPaymentsToFinance();

        $today = date('Y-m-d');
        $startOfMonth = date('Y-m-01');

        $totalIncome = (float) FinanceTransaction::where('type', 'income')->sum('amount');
        $totalExpense = (float) FinanceTransaction::where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        $todayIncome = (float) FinanceTransaction::where('type', 'income')->where('date', $today)->sum('amount');
        $todayExpense = (float) FinanceTransaction::where('type', 'expense')->where('date', $today)->sum('amount');

        $monthIncome = (float) FinanceTransaction::where('type', 'income')->where('date', '>=', $startOfMonth)->sum('amount');
        $monthExpense = (float) FinanceTransaction::where('type', 'expense')->where('date', '>=', $startOfMonth)->sum('amount');

        $unpaidInvoices = Invoice::where('status', '!=', 'paid')->count();
        $unpaidAmount = (float) Invoice::where('status', '!=', 'paid')->sum('outstanding_amount');

        $recentTransactions = FinanceTransaction::orderByDesc('date')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'netBalance' => $netBalance,
            'todayIncome' => $todayIncome,
            'todayExpense' => $todayExpense,
            'monthIncome' => $monthIncome,
            'monthExpense' => $monthExpense,
            'todayRevenue' => $todayIncome,
            'monthRevenue' => $monthIncome,
            'netCashflow' => $netBalance,
            'unpaidInvoices' => $unpaidInvoices,
            'unpaidAmount' => $unpaidAmount,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    public function transactions(Request $request)
    {
        self::syncPatientPaymentsToFinance();
        $query = FinanceTransaction::query();

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('startDate')) {
            $query->where('date', '>=', $request->input('startDate'));
        }

        if ($request->filled('endDate')) {
            $query->where('date', '<=', $request->input('endDate'));
        }

        $transactions = $query->orderByDesc('date')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'paymentMethod' => 'nullable|string',
            'description' => 'required|string',
            'date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $transaction = FinanceTransaction::create([
            'id' => 'FIN-' . strtoupper(Str::random(6)),
            'transaction_number' => 'TRX-' . ($validated['type'] === 'income' ? 'IN-' : 'OUT-') . date('Ymd-His'),
            'type' => $validated['type'],
            'category' => $validated['category'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['paymentMethod'] ?? 'cash',
            'description' => $validated['description'],
            'reference_type' => 'operational',
            'date' => $validated['date'] ?? date('Y-m-d'),
            'operator_name' => 'Petugas Klinik',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($transaction, 201);
    }
}
