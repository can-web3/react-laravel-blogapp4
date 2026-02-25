<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json([
        'user' => new UserResource($request->user()),
        'roles' => $request->user()->getRoleNames(),
        'permissions' => $request->user()->getPermissionNames(),
    ]);
});

Route::middleware('auth:sanctum')->get('/notifications', function (Request $request) {
    $notifications = $request->user()
        ->notifications()
        ->orderByDesc('created_at')
        ->limit(50)
        ->get()
        ->map(fn ($n) => [
            'id' => $n->id,
            'type' => $n->type,
            'data' => $n->data,
            'read_at' => $n->read_at?->toIso8601String(),
            'created_at' => $n->created_at->toIso8601String(),
        ]);

    return response()->json([
        'success' => true,
        'data' => $notifications,
    ]);
});

Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('register', 'register')->middleware('throttle:auth');
    Route::post('login', 'login')->middleware('throttle:auth');
    Route::post('forgot-password', 'forgotPassword')->middleware('throttle:auth');
    Route::post('reset-password', 'resetPassword');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', 'logout');
        Route::post('refresh', 'refresh');
        Route::post('me', 'me');
    });
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{user}', [AuthorController::class, 'show']);
Route::get('/tags/popular', [TagController::class, 'popular']);
Route::get('/tags/{tag}', [TagController::class, 'show']);

Route::get('/blogs', [BlogController::class, 'index']);

Route::get('/blogs/{blog}/comments', [BlogController::class, 'comments']);
Route::get('/blogs/{blog}', [BlogController::class, 'show']);

Route::middleware('auth:sanctum')->post('/blogs/{blog}/comments', [BlogController::class, 'storeComment']);
Route::middleware('auth:sanctum')->post('/blogs/{blog}/like', [BlogController::class, 'toggleLike']);
Route::middleware('auth:sanctum')->post('/blogs/{blog}/bookmark', [BlogController::class, 'toggleBookmark']);

Route::middleware('auth:sanctum')->prefix('blogs')->controller(BlogController::class)->group(function () {
    Route::post('/', 'store');
    Route::match(['put', 'post'], '/{blog}', 'update');
    Route::delete('/{blog}', 'destroy');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('categories')->controller(CategoryController::class)->group(function () {
    Route::post('/', 'store');
    Route::put('/{category}', 'update');
    Route::delete('/{category}', 'destroy');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('tags')->controller(TagController::class)->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::match(['put', 'patch'], '/{tag}', 'update');
    Route::delete('/{tag}', 'destroy');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('users')->controller(UserController::class)->group(function () {
    Route::get('/', 'index');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
});
