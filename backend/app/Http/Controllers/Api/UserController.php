<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * List users (admin). Optional search by username/email.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->orderBy('username');

        if ($request->filled('search')) {
            $term = $request->string('search')->trim();
            $query->where(function ($q) use ($term) {
                $q->where('username', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            });
        }

        $perPage = max(1, min(50, (int) $request->get('per_page', 15)));
        $users = $query->paginate($perPage);

        $data = $users->getCollection()->map(function (User $user) {
            return array_merge(
                (new UserResource($user))->toArray(request()),
                ['roles' => $user->getRoleNames()]
            );
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }
}
