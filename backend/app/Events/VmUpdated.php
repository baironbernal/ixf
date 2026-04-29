<?php

namespace App\Events;

use App\Http\Resources\VmResource;
use App\Models\Vm;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VmUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Vm $vm) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('vms'),
        ];
    }

    public function broadcastWith(): array
    {
        return (new VmResource($this->vm))->resolve();
    }
}
