<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VmDeleted implements ShouldBroadcastNow
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
