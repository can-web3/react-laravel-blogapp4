<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request. Allow only users with the "admin" role.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Admin role required.',
            ], 403);
        }

        return $next($request);
    }
}
