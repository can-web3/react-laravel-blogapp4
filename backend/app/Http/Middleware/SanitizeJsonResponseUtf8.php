<?php

namespace App\Http\Middleware;

use App\Support\Utf8Sanitizer;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeJsonResponseUtf8
{
    /**
     * Ensure JSON response payload contains only valid UTF-8 to avoid
     * "Malformed UTF-8 characters, possibly incorrectly encoded" errors.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response instanceof JsonResponse) {
            $data = $response->getData();
            if ($data !== null && $data !== false) {
                $response->setData(Utf8Sanitizer::sanitize($data));
            }
        }

        return $response;
    }
}
