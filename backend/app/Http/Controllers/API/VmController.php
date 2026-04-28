<?php

namespace App\Http\Controllers\API;

use App\Events\VmCreated;
use App\Events\VmDeleted;
use App\Events\VmUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vm\StoreVmRequest;
use App\Http\Requests\Vm\UpdateVmRequest;
use App\Http\Resources\VmResource;
use App\Models\Vm;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;

class VmController extends Controller
{
    use AuthorizesRequests;


    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Vm::class);

        return VmResource::collection(Vm::all());
    }

    public function store(StoreVmRequest $request): VmResource
    {
        $this->authorize('create', Vm::class);

        $vm = Vm::create([
            ...$request->validated(),
            'user_id' => Auth::id(),
        ]);

        VmCreated::dispatch($vm);

        return new VmResource($vm);
    }

    public function show(Vm $vm): VmResource
    {
        $this->authorize('view', $vm);

        return new VmResource($vm);
    }

    public function update(UpdateVmRequest $request, Vm $vm): VmResource
    {
        $this->authorize('update', $vm);

        $vm->update($request->validated());

        VmUpdated::dispatch($vm);

        return new VmResource($vm);
    }

    public function destroy(Vm $vm): JsonResponse
    {
        $this->authorize('delete', $vm);

        $vmId = $vm->id;
        $vm->delete();

        VmDeleted::dispatch($vmId);

        return response()->json(['message' => 'VM deleted successfully']);
    }
}
