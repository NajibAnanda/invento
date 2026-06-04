<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $kasir = User::where('email', 'kasir@gmail.com')->firstOrFail();
        $products = Product::whereIn('sku', ['BRS-005', 'MYK-001'])->get()->keyBy('sku');

        $completed = Transaction::create([
            'user_id' => $kasir->id,
            'invoice_no' => 'INV-260602-0001',
            'total_amount' => 111000,
            'payment_amount' => 150000,
            'change_amount' => 39000,
            'status' => 'completed',
        ]);

        $completed->transactionItems()->createMany([
            ['product_id' => $products['BRS-005']->id, 'product_name' => $products['BRS-005']->name, 'qty' => 1, 'sell_price' => 75000, 'subtotal' => 75000],
            ['product_id' => $products['MYK-001']->id, 'product_name' => $products['MYK-001']->name, 'qty' => 2, 'sell_price' => 18000, 'subtotal' => 36000],
        ]);

        StockMovement::insert([
            ['product_id' => $products['BRS-005']->id, 'user_id' => $kasir->id, 'type' => 'out', 'qty' => -1, 'stock_before' => 25, 'stock_after' => 24, 'note' => 'Penjualan POS', 'reference_id' => $completed->id, 'created_at' => now(), 'updated_at' => now()],
            ['product_id' => $products['MYK-001']->id, 'user_id' => $kasir->id, 'type' => 'out', 'qty' => -2, 'stock_before' => 8, 'stock_after' => 6, 'note' => 'Penjualan POS', 'reference_id' => $completed->id, 'created_at' => now(), 'updated_at' => now()],
        ]);

        Transaction::create([
            'user_id' => $kasir->id,
            'invoice_no' => 'INV-260602-0002',
            'total_amount' => 18000,
            'payment_amount' => 0,
            'change_amount' => 0,
            'status' => 'cancelled',
        ]);
    }
}
