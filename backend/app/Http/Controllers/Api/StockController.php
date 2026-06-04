<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithJson;
use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StockController extends Controller
{
    use RespondsWithJson;

    public function __construct(private readonly StockService $stockService)
    {
    }

    public function stockIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'qty' => ['required', 'integer', 'min:1'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'buy_price' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string'],
        ]);

        $movement = $this->stockService->stockIn($validated, $request->user());

        return $this->success('Barang masuk berhasil dicatat.', $movement, 201);
    }

    public function movements(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:200'],
            'type' => ['nullable', Rule::in(['in', 'out', 'adjustment'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $movements = StockMovement::query()
            ->with(['product', 'user'])
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->whereHas('product', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($validated['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->latest()
            ->paginate($validated['per_page'] ?? 15)
            ->withQueryString();

        return $this->success('Riwayat stok berhasil diambil.', $movements);
    }
}
