<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::insert([
            ['name' => 'Sembako', 'slug' => 'sembako', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Minuman', 'slug' => 'minuman', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Makanan', 'slug' => 'makanan', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Kebutuhan Rumah', 'slug' => 'kebutuhan-rumah', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
