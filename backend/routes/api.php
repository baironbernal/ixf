<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\VmController;
use Illuminate\Support\Facades\Route;


Route::middleware(['web'])->group(function (){
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware(['auth:sanctum', 'web'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('vms', VmController::class);
});