<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddCorsHeaders
{
    /** Allowed origins (production + local dev). */
    private const ALLOWED_ORIGINS = [
        'https://can-react-laravel-blogapp.netlify.app',
        'http://localhost:5173',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $requestOrigin = $request->header('Origin');
        $origin = $requestOrigin && in_array($requestOrigin, self::ALLOWED_ORIGINS, true)
            ? $requestOrigin
            : self::ALLOWED_ORIGINS[0];

        $headers = [
            'Access-Control-Allow-Origin' => $origin,
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
            'Access-Control-Max-Age' => '86400',
        ];

        if ($request->isMethod('OPTIONS')) {
            return response('', 204)->withHeaders($headers);
        }

        $response = $next($request);

        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }
}
