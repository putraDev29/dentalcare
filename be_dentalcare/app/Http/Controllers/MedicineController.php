<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineMutation;
use App\Models\FinanceTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $query = Medicine::query();

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('generic_name', 'like', "%{$s}%")
                  ->orWhere('brand_name', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%")
                  ->orWhere('category', 'like', "%{$s}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        return response()->json($query->orderBy('brand_name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brandName' => 'required|string',
            'genericName' => 'required|string',
            'dosageForm' => 'required|string',
            'category' => 'required|string',
            'unit' => 'required|string',
            'currentStock' => 'nullable|integer',
            'minimumStock' => 'nullable|integer',
            'purchasePrice' => 'nullable|numeric',
            'sellingPrice' => 'nullable|numeric',
            'expiryDate' => 'nullable|date',
            'manufacturer' => 'nullable|string',
            'strength' => 'nullable|string',
            'requiresPrescription' => 'nullable|boolean',
        ]);

        $id = 'MED-' . strtoupper(Str::random(5));
        $code = $request->input('code') ?: ('OBT-' . rand(100, 999));

        $initialStock = $validated['currentStock'] ?? 0;
        $purchasePrice = $validated['purchasePrice'] ?? 0;

        $medicine = Medicine::create([
            'id' => $id,
            'code' => $code,
            'generic_name' => $validated['genericName'],
            'brand_name' => $validated['brandName'],
            'dosage_form' => $validated['dosageForm'],
            'strength' => $validated['strength'] ?? null,
            'unit' => $validated['unit'],
            'manufacturer' => $validated['manufacturer'] ?? null,
            'category' => $validated['category'],
            'current_stock' => $initialStock,
            'minimum_stock' => $validated['minimumStock'] ?? 10,
            'purchase_price' => $purchasePrice,
            'selling_price' => $validated['sellingPrice'] ?? ($purchasePrice * 1.3),
            'expiry_date' => $validated['expiryDate'] ?? null,
            'stock_status' => $initialStock > ($validated['minimumStock'] ?? 10) ? 'in_stock' : ($initialStock > 0 ? 'low_stock' : 'out_of_stock'),
            'requires_prescription' => $validated['requiresPrescription'] ?? true,
        ]);

        if ($initialStock > 0) {
            MedicineMutation::create([
                'id' => 'MUT-' . strtoupper(Str::random(6)),
                'medicine_id' => $medicine->id,
                'medicine_name' => $medicine->brand_name,
                'type' => 'in',
                'quantity' => $initialStock,
                'stock_before' => 0,
                'stock_after' => $initialStock,
                'unit_price' => $purchasePrice,
                'total_price' => $initialStock * $purchasePrice,
                'reason' => 'purchase',
                'reference_no' => 'INIT-STOCK',
                'expiry_date' => $medicine->expiry_date,
                'notes' => 'Input stok awal obat',
                'operator_name' => 'Petugas Farmasi',
            ]);
        }

        return response()->json($medicine, 201);
    }

    public function show($id)
    {
        $medicine = Medicine::findOrFail($id);
        return response()->json($medicine);
    }

    public function update(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);

        $validated = $request->validate([
            'brandName' => 'nullable|string',
            'genericName' => 'nullable|string',
            'dosageForm' => 'nullable|string',
            'category' => 'nullable|string',
            'unit' => 'nullable|string',
            'currentStock' => 'nullable|integer',
            'minimumStock' => 'nullable|integer',
            'purchasePrice' => 'nullable|numeric',
            'sellingPrice' => 'nullable|numeric',
            'expiryDate' => 'nullable|date',
            'manufacturer' => 'nullable|string',
            'strength' => 'nullable|string',
            'requiresPrescription' => 'nullable|boolean',
        ]);

        $updateData = [];
        if ($request->filled('code')) $updateData['code'] = $request->input('code');
        if (isset($validated['brandName'])) $updateData['brand_name'] = $validated['brandName'];
        if (isset($validated['genericName'])) $updateData['generic_name'] = $validated['genericName'];
        if (isset($validated['dosageForm'])) $updateData['dosage_form'] = $validated['dosageForm'];
        if (isset($validated['category'])) $updateData['category'] = $validated['category'];
        if (isset($validated['unit'])) $updateData['unit'] = $validated['unit'];
        if (isset($validated['currentStock'])) $updateData['current_stock'] = $validated['currentStock'];
        if (isset($validated['minimumStock'])) $updateData['minimum_stock'] = $validated['minimumStock'];
        if (isset($validated['purchasePrice'])) $updateData['purchase_price'] = $validated['purchasePrice'];
        if (isset($validated['sellingPrice'])) $updateData['selling_price'] = $validated['sellingPrice'];
        if (isset($validated['expiryDate'])) $updateData['expiry_date'] = $validated['expiryDate'];
        if (isset($validated['manufacturer'])) $updateData['manufacturer'] = $validated['manufacturer'];
        if (isset($validated['strength'])) $updateData['strength'] = $validated['strength'];
        if (isset($validated['requiresPrescription'])) $updateData['requires_prescription'] = $validated['requiresPrescription'];

        $stock = $updateData['current_stock'] ?? $medicine->current_stock;
        $minStock = $updateData['minimum_stock'] ?? $medicine->minimum_stock;
        $updateData['stock_status'] = $stock > $minStock ? 'in_stock' : ($stock > 0 ? 'low_stock' : 'out_of_stock');

        $medicine->update($updateData);

        return response()->json($medicine);
    }

    public function destroy($id)
    {
        $medicine = Medicine::findOrFail($id);
        $medicine->delete();
        return response()->json(['success' => true]);
    }

    public function stockIn(Request $request)
    {
        $validated = $request->validate([
            'medicineId' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'unitPrice' => 'nullable|numeric',
            'supplier' => 'nullable|string',
            'referenceNo' => 'nullable|string',
            'batchNumber' => 'nullable|string',
            'expiryDate' => 'nullable|date',
            'notes' => 'nullable|string',
            'syncFinance' => 'nullable|boolean',
        ]);

        $medicine = Medicine::findOrFail($validated['medicineId']);
        $stockBefore = $medicine->current_stock;
        $quantity = $validated['quantity'];
        $stockAfter = $stockBefore + $quantity;
        $unitPrice = $validated['unitPrice'] ?? $request->input('unitCost') ?? $medicine->purchase_price;
        $totalPrice = $quantity * $unitPrice;

        $medicine->update([
            'current_stock' => $stockAfter,
            'purchase_price' => $unitPrice,
            'expiry_date' => $validated['expiryDate'] ?? $medicine->expiry_date,
            'stock_status' => $stockAfter > $medicine->minimum_stock ? 'in_stock' : 'low_stock',
        ]);

        $mutation = MedicineMutation::create([
            'id' => 'MUT-' . strtoupper(Str::random(6)),
            'medicine_id' => $medicine->id,
            'medicine_name' => $medicine->brand_name,
            'type' => 'in',
            'quantity' => $quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
            'reason' => 'purchase',
            'reference_no' => $validated['referenceNo'] ?? ('RESTOCK-' . date('Ymd-His')),
            'batch_number' => $validated['batchNumber'] ?? null,
            'expiry_date' => $validated['expiryDate'] ?? $medicine->expiry_date,
            'notes' => $validated['notes'] ?? ($validated['supplier'] ? 'Suplier: ' . $validated['supplier'] : 'Restock barang masuk'),
            'operator_name' => 'Petugas Farmasi',
        ]);

        $syncFinance = $validated['syncFinance'] ?? true;
        if ($syncFinance && $totalPrice > 0) {
            FinanceTransaction::create([
                'id' => 'FIN-' . strtoupper(Str::random(6)),
                'transaction_number' => 'TRX-OUT-' . date('Ymd-His'),
                'type' => 'expense',
                'category' => 'medicine_purchase',
                'amount' => $totalPrice,
                'payment_method' => 'cash',
                'description' => "Restock Obat Masuk: {$medicine->brand_name} ({$quantity} {$medicine->unit})",
                'reference_id' => $mutation->id,
                'reference_type' => 'stock_in',
                'date' => date('Y-m-d'),
                'operator_name' => 'Petugas Farmasi',
                'notes' => $mutation->notes,
            ]);
        }

        return response()->json([
            'success' => true,
            'medicine' => $medicine,
            'mutation' => $mutation,
        ]);
    }

    public function stockOut(Request $request)
    {
        $validated = $request->validate([
            'medicineId' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string', // treatment, prescription, damaged, expired, adjustment
            'referenceNo' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $medicine = Medicine::findOrFail($validated['medicineId']);
        $stockBefore = $medicine->current_stock;
        $quantity = $validated['quantity'];
        $stockAfter = max(0, $stockBefore - $quantity);

        $medicine->update([
            'current_stock' => $stockAfter,
            'stock_status' => $stockAfter > $medicine->minimum_stock ? 'in_stock' : ($stockAfter > 0 ? 'low_stock' : 'out_of_stock'),
        ]);

        $mutation = MedicineMutation::create([
            'id' => 'MUT-' . strtoupper(Str::random(6)),
            'medicine_id' => $medicine->id,
            'medicine_name' => $medicine->brand_name,
            'type' => 'out',
            'quantity' => $quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'unit_price' => $medicine->purchase_price,
            'total_price' => $quantity * $medicine->purchase_price,
            'reason' => $validated['reason'],
            'reference_no' => $validated['referenceNo'] ?? ('OUT-' . date('Ymd-His')),
            'notes' => $validated['notes'] ?? 'Barang keluar / pemakaian',
            'operator_name' => 'Petugas Farmasi',
        ]);

        return response()->json([
            'success' => true,
            'medicine' => $medicine,
            'mutation' => $mutation,
        ]);
    }

    public function mutations(Request $request)
    {
        $query = MedicineMutation::query();

        if ($request->filled('medicineId')) {
            $query->where('medicine_id', $request->input('medicineId'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }
}
