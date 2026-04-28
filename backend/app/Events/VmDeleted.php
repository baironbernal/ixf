<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VmDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $vmId) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('vms'),
        ];
    }

    public function broadcastWith(): array
    {
        return ['id' => $this->vmId];
    }
}
