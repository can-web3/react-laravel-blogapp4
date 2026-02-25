<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\CacheKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\URL;

class AuthorController extends Controller
{
    /**
     * Show a single author by slug. Public. Returns id, username, slug, name, avatar, bio, posts_count.
     */
    public function show(User $user): JsonResponse
    {
        $key = CacheKey::author($user->slug);
        $data = Cache::remember($key, CacheKey::TTL_AUTHORS, function () use ($user) {
            $user->loadCount(['blogs' => fn ($q) => $q->where('status', 'published')]);

            return [
                'id' => $user->id,
                'username' => $user->username,
                'slug' => $user->slug,
                'name' => $user->username,
                'avatar' => $this->authorImageUrl($user),
                'bio' => $user->bio ?? '',
                'posts' => (int) $user->blogs_count,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * List popular authors (users with published blogs), sorted by published blog count.
     * Public. Returns id, username, slug, image, bio, posts_count.
     */
    public function index(Request $request): JsonResponse
    {
        $limit = max(1, min(20, (int) $request->get('limit', 10)));
        $key = CacheKey::authorsList($limit);
        $data = Cache::remember($key, CacheKey::TTL_AUTHORS, function () use ($limit) {
            $authors = User::query()
                ->whereHas('blogs', fn ($q) => $q->where('status', 'published'))
                ->withCount(['blogs' => fn ($q) => $q->where('status', 'published')])
                ->orderByDesc('blogs_count')
                ->limit($limit)
                ->get(['id', 'username', 'slug', 'image', 'bio']);

            return $authors->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'slug' => $user->slug,
                    'name' => $user->username,
                    'avatar' => $this->authorImageUrl($user),
                    'bio' => $user->bio ?? '',
                    'posts' => (int) $user->blogs_count,
                    'followers' => 0,
                ];
            });
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    private function authorImageUrl(User $user): string
    {
        $path = $user->getRawOriginal('image') ?? $user->image ?? 'images/profile.png';
        if (empty($path) || ! is_string($path)) {
            $path = 'images/profile.png';
        }
        if (str_starts_with($path, 'http')) {
            return $path;
        }

        return URL::asset($path);
    }
}
