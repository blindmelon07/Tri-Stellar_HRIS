<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\EmployeeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee->load(['department', 'branch', 'shift']);

        return response()->json([
            'data' => [
                'name' => $user->name,
                'email' => $user->email,
                'employee' => EmployeeResource::make($employee),
                'can' => [
                    'endorse_filings' => $user->can('endorse-filings'),
                ],
            ],
        ]);
    }
}
