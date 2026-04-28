<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vm;

class VmPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('vm.viewAny');
    }

    public function view(User $user, Vm $vm): bool
    {
        return $user->hasPermissionTo('vm.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('vm.create');
    }

    public function update(User $user, Vm $vm): bool
    {
        return $user->hasPermissionTo('vm.update');
    }

    public function delete(User $user, Vm $vm): bool
    {
        return $user->hasPermissionTo('vm.delete');
    }
}
