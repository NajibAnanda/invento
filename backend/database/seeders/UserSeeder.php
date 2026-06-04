<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Super Admin', 'email' => 'superadmin@gmail.com', 'role' => 'super_admin'],
            ['name' => 'Admin', 'email' => 'admin@gmail.com', 'role' => 'admin'],
            ['name' => 'Kasir', 'email' => 'kasir@gmail.com', 'role' => 'kasir'],
            ['name' => 'Gudang', 'email' => 'gudang@gmail.com', 'role' => 'gudang'],
        ];

        foreach ($users as $user) {
            User::create([
                ...$user,
                'password' => '123',
                'is_active' => true,
            ]);
        }
    }
}
