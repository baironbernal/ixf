<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Any authenticated user can subscribe to VM events.
// The frontend filters what to show based on role.
Broadcast::channel('vms', function ($user) {
    return $user !== null;
});
