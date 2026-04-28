<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $vmPermissions = [
            'vm.viewAny',
            'vm.view',
            'vm.create',
            'vm.update',
            'vm.delete',
        ];

        foreach ($vmPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        Role::findByName('admin')->syncPermissions($vmPermissions);

        Role::findByName('client')->syncPermissions([
            'vm.viewAny',
            'vm.view',
        ]);
    }
}
