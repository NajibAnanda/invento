<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        Supplier::insert([
            ['name' => 'PT Pangan Jaya', 'phone' => '0215550182', 'address' => 'Jakarta Barat', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'CV Sumber Makmur', 'phone' => '0215550239', 'address' => 'Tangerang', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'CV Segar Abadi', 'phone' => '0251441870', 'address' => 'Bogor', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'PT Berkah Niaga', 'phone' => '0215554021', 'address' => 'Jakarta Selatan', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
