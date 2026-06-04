<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::pluck('id', 'slug');
        $suppliers = Supplier::pluck('id', 'name');

        Product::insert([
            ['category_id' => $categories['sembako'], 'supplier_id' => $suppliers['PT Pangan Jaya'], 'name' => 'Beras Premium 5 kg', 'sku' => 'BRS-005', 'buy_price' => 68000, 'sell_price' => 75000, 'stock' => 24, 'min_stock' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $categories['sembako'], 'supplier_id' => $suppliers['CV Sumber Makmur'], 'name' => 'Minyak Goreng 1 L', 'sku' => 'MYK-001', 'buy_price' => 15500, 'sell_price' => 18000, 'stock' => 6, 'min_stock' => 12, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $categories['minuman'], 'supplier_id' => $suppliers['PT Pangan Jaya'], 'name' => 'Kopi Susu Sachet', 'sku' => 'KOP-012', 'buy_price' => 1800, 'sell_price' => 2500, 'stock' => 86, 'min_stock' => 24, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $categories['minuman'], 'supplier_id' => $suppliers['CV Segar Abadi'], 'name' => 'Air Mineral 600 ml', 'sku' => 'AMN-600', 'buy_price' => 2800, 'sell_price' => 4000, 'stock' => 42, 'min_stock' => 20, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $categories['kebutuhan-rumah'], 'supplier_id' => $suppliers['PT Berkah Niaga'], 'name' => 'Sabun Mandi 90 g', 'sku' => 'SBN-090', 'buy_price' => 3900, 'sell_price' => 5500, 'stock' => 2, 'min_stock' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $categories['makanan'], 'supplier_id' => $suppliers['CV Sumber Makmur'], 'name' => 'Mi Instan Goreng', 'sku' => 'MIG-001', 'buy_price' => 2600, 'sell_price' => 3500, 'stock' => 0, 'min_stock' => 24, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
