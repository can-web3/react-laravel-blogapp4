<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admins = [
            [
                'username' => 'admin',
                'email' => 'admin@gmail.com',
                'password' => 'admin1',
            ]
        ];

        foreach ($admins as $admin) {
            $user = User::firstOrCreate(
                ['email' => $admin['email']],
                $admin
            );
            if (!$user->hasRole('admin')) {
                $user->assignRole('admin');
            }
        }

        $existing = User::query()->count();
        $target = 60;

        if ($existing >= $target) {
            return;
        }

        User::factory($target - $existing)->create();
    }
}
