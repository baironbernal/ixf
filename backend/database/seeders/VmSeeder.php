<?php

namespace Database\Seeders;

use App\Models\Vm;
use App\Models\User;
use Illuminate\Database\Seeder;

class VmSeeder extends Seeder
{
    public function run(): void
    {
        $clientOne = User::where('email', 'client1@example.com')->first();
        $clientTwo = User::where('email', 'client2@example.com')->first();

        $vms = [
            [
                'name' => 'web-server-01',
                'cores' => 4,
                'ram' => 8,
                'disk' => 100,
                'os' => 'Ubuntu 22.04',
                'status' => 'running',
                'user_id' => $clientOne->id,
            ],
            [
                'name' => 'web-server-02',
                'cores' => 4,
                'ram' => 8,
                'disk' => 100,
                'os' => 'Ubuntu 22.04',
                'status' => 'running',
                'user_id' => $clientOne->id,
            ],
            [
                'name' => 'db-server-01',
                'cores' => 8,
                'ram' => 16,
                'disk' => 500,
                'os' => 'Ubuntu 22.04',
                'status' => 'running',
                'user_id' => $clientOne->id,
            ],
            [
                'name' => 'db-server-02',
                'cores' => 8,
                'ram' => 16,
                'disk' => 500,
                'os' => 'Ubuntu 22.04',
                'status' => 'stopped',
                'user_id' => $clientOne->id,
            ],
            [
                'name' => 'dev-machine',
                'cores' => 2,
                'ram' => 4,
                'disk' => 50,
                'os' => 'Ubuntu 22.04',
                'status' => 'running',
                'user_id' => $clientOne->id,
            ],
            [
                'name' => 'test-server',
                'cores' => 2,
                'ram' => 4,
                'disk' => 50,
                'os' => 'Ubuntu 22.04',
                'status' => 'stopped',
                'user_id' => $clientTwo->id,
            ],
            [
                'name' => 'cache-server',
                'cores' => 2,
                'ram' => 4,
                'disk' => 20,
                'os' => 'Alpine Linux',
                'status' => 'running',
                'user_id' => $clientTwo->id,
            ],
            [
                'name' => 'monitoring-server',
                'cores' => 2,
                'ram' => 4,
                'disk' => 50,
                'os' => 'Ubuntu 22.04',
                'status' => 'running',
                'user_id' => $clientTwo->id,
            ],
            [
                'name' => 'backup-server',
                'cores' => 4,
                'ram' => 8,
                'disk' => 1000,
                'os' => 'Ubuntu 22.04',
                'status' => 'stopped',
                'user_id' => $clientTwo->id,
            ],
            [
                'name' => 'mail-server',
                'cores' => 4,
                'ram' => 8,
                'disk' => 100,
                'os' => 'Ubuntu 22.04',
                'status' => 'running',
                'user_id' => $clientTwo->id,
            ],
        ];

        foreach ($vms as $vmData) {
            Vm::firstOrCreate(
                ['name' => $vmData['name']],
                $vmData
            );
        }
    }
}