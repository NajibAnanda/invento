<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Seeder;

class StockMovementSeeder extends Seeder
{
    public function run(): void
    {
        $gudang = User::where('email', 'gudang@gmail.com')->firstOrFail();
        $products = Product::pluck('id', 'sku');

        StockMovement::insert([
            ['product_id' => $products['BRS-005'], 'user_id' => $gudang->id, 'type' => 'in', 'qty' => 25, 'stock_before' => 0, 'stock_after' => 25, 'note' => 'Stok awal', 'created_at' => now()->subDays(2), 'updated_at' => now()->subDays(2)],
            ['product_id' => $products['MYK-001'], 'user_id' => $gudang->id, 'type' => 'in', 'qty' => 8, 'stock_before' => 0, 'stock_after' => 8, 'note' => 'Penerimaan dari supplier', 'created_at' => now()->subDay(), 'updated_at' => now()->subDay()],
            ['product_id' => $products['AMN-600'], 'user_id' => $gudang->id, 'type' => 'in', 'qty' => 24, 'stock_before' => 18, 'stock_after' => 42, 'note' => 'Penerimaan dari supplier', 'created_at' => now()->subHours(3), 'updated_at' => now()->subHours(3)],
            ['product_id' => $products['SBN-090'], 'user_id' => $gudang->id, 'type' => 'adjustment', 'qty' => -2, 'stock_before' => 4, 'stock_after' => 2, 'note' => 'Penyesuaian stok opname', 'created_at' => now()->subDay(), 'updated_at' => now()->subDay()],
        ]);
    }
}
