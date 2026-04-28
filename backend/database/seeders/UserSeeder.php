<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );
        $admin->syncRoles('admin');

        $clientOne = User::firstOrCreate(
            ['email' => 'client1@example.com'],
            [
                'name'     => 'Client One',
                'password' => Hash::make('password'),
            ]
        );
        $clientOne->syncRoles('client');

        $clientTwo = User::firstOrCreate(
            ['email' => 'client2@example.com'],
            [
                'name'     => 'Client Two',
                'password' => Hash::make('password'),
            ]
        );
        $clientTwo->syncRoles('client');
    }
}
