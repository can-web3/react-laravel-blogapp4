<?php

namespace App\Exceptions;

use App\Support\Utf8Sanitizer;
use Throwable;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e)
    {
        // API routes always get JSON; web can use default (HTML)
        $wantsJson = $request->expectsJson() || $request->is('api/*');
        if (!$wantsJson) {
            return parent::render($request, $e);
        }

        // Validation error (422)
        if ($e instanceof ValidationException) {
            return response()->json(Utf8Sanitizer::sanitize([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ]), 422);
        }

        // Authentication error (401)
        if ($e instanceof AuthenticationException) {
            return response()->json(Utf8Sanitizer::sanitize([
                'success' => false,
                'message' => 'Unauthenticated',
            ]), 401);
        }

        // Authorization error (403)
        if ($e instanceof AuthorizationException) {
            return response()->json(Utf8Sanitizer::sanitize([
                'success' => false,
                'message' => 'Forbidden',
            ]), 403);
        }

        // HTTP exceptions (404, 405, etc.)
        if ($e instanceof HttpExceptionInterface) {
            return response()->json(Utf8Sanitizer::sanitize([
                'success' => false,
                'message' => $e->getMessage() ?: 'HTTP Error',
            ]), $e->getStatusCode());
        }

        // General error (500)
        return response()->json(Utf8Sanitizer::sanitize([
            'success' => false,
            'message' => config('app.debug')
                ? $e->getMessage()
                : 'Server Error',
        ]), 500);
    }

}
