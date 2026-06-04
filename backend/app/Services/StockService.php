<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StockService
{
    public function stockIn(array $data, User $user): StockMovement
    {
        return DB::transaction(function () use ($data, $user) {
            $product = Product::query()->lockForUpdate()->findOrFail($data['product_id']);
            $stockBefore = $product->stock;

            $product->increment('stock', $data['qty']);

            $product->fill([
                'supplier_id' => $data['supplier_id'] ?? $product->supplier_id,
                'buy_price' => $data['buy_price'] ?? $product->buy_price,
            ])->save();

            return StockMovement::create([
                'product_id' => $product->id,
                'user_id' => $user->id,
                'type' => 'in',
                'qty' => $data['qty'],
                'stock_before' => $stockBefore,
                'stock_after' => $stockBefore + $data['qty'],
                'note' => $data['note'] ?? 'Barang masuk',
            ])->load(['product', 'user']);
        });
    }
}
