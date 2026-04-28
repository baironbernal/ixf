<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Auth;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create($request->validated());

        Auth::login($user);

        return new UserResource($user);

    }

    public function login(LoginRequest $request)
    {
        if(!Auth::attempt($request->only('email', 'password'))){
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $request->session()->regenerate();

        $user = Auth::user();
        return new UserResource($user);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function user()
    {
        return new UserResource(Auth::user());
    }
}
