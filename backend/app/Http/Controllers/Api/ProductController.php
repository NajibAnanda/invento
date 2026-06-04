<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithJson;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    use RespondsWithJson;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:200'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'stock_status' => ['nullable', Rule::in(['in_stock', 'low_stock', 'out_of_stock'])],
            'active_only' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $products = Product::query()
            ->with(['category', 'supplier'])
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($validated['category_id'] ?? null, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($validated['active_only'] ?? false, fn ($query) => $query->where('is_active', true))
            ->when($validated['stock_status'] ?? null, function ($query, $stockStatus) {
                match ($stockStatus) {
                    'in_stock' => $query->whereColumn('stock', '>', 'min_stock'),
                    'low_stock' => $query->where('stock', '>', 0)->whereColumn('stock', '<=', 'min_stock'),
                    'out_of_stock' => $query->where('stock', '<=', 0),
                };
            })
            ->latest()
            ->paginate($validated['per_page'] ?? 15)
            ->withQueryString();

        return $this->success('Daftar produk berhasil diambil.', $products);
    }

    public function store(Request $request): JsonResponse
    {
        $product = Product::create($this->validatedData($request));

        return $this->success('Produk berhasil ditambahkan.', $product->load(['category', 'supplier']), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return $this->success('Detail produk berhasil diambil.', $product->load(['category', 'supplier']));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $product->update($this->validatedData($request, $product));

        return $this->success('Produk berhasil diperbarui.', $product->load(['category', 'supplier']));
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->transactionItems()->exists()) {
            return $this->success('Produk memiliki riwayat transaksi dan tidak dapat dihapus.', null, 422);
        }

        $product->delete();

        return $this->success('Produk berhasil dihapus.');
    }

    private function validatedData(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'name' => ['required', 'string', 'max:200'],
            'sku' => ['required', 'string', 'max:50', Rule::unique('products')->ignore($product)],
            'buy_price' => ['required', 'numeric', 'min:0'],
            'sell_price' => ['required', 'numeric', 'min:0'],
            'stock' => [$product ? 'sometimes' : 'nullable', 'integer', 'min:0'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);
    }
}
