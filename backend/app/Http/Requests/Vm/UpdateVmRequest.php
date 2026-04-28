<?php

namespace App\Http\Requests\Vm;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateVmRequest extends FormRequest
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
            'name'   => 'sometimes|string|max:255',
            'cores'  => 'sometimes|integer|min:1',
            'ram'    => 'sometimes|integer|min:1',
            'disk'   => 'sometimes|integer|min:1',
            'os'     => 'sometimes|string|max:255',
            'status' => 'sometimes|in:running,stopped',
        ];
    }
}
