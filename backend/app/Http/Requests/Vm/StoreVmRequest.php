<?php

namespace App\Http\Requests\Vm;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVmRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'   => 'required|string|max:255',
            'cores'  => 'required|integer|min:1',
            'ram'    => 'required|integer|min:1',
            'disk'   => 'required|integer|min:1',
            'os'     => 'required|string|max:255',
            'status' => 'sometimes|in:running,stopped',
        ];
    }
}
