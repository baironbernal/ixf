<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;

use App\Http\Requests\Vm\StoreVmRequest;
use App\Http\Requests\Vm\UpdateVmRequest;
use App\Http\Resources\VmResource;
use App\Models\Vm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;

class VmController extends Controller
{
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

        return new VmResource($vm);
    }

    public function destroy(Vm $vm): JsonResponse
    {
        $this->authorize('delete', $vm);

        $vm->delete();

        return response()->json(['message' => 'VM deleted successfully']);
    }
}
