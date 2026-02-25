<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Support\CacheKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TagController extends Controller
{
    /**
     * List popular tags (public). Sorted by published blog count, limit 9. Returns id, name, slug, count.
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = max(1, min(20, (int) $request->get('limit', 9)));
        $key = CacheKey::tagsPopular($limit);
        $tags = Cache::remember($key, CacheKey::TTL_TAGS_POPULAR, function () use ($limit) {
            return Tag::query()
                ->withCount(['blogs' => fn ($q) => $q->where('status', 'published')])
                ->orderByDesc('blogs_count')
                ->limit($limit)
                ->get(['id', 'name', 'slug'])
                ->map(fn (Tag $tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'count' => (int) $tag->blogs_count,
                ]);
        });

        return response()->json([
            'success' => true,
            'data' => $tags,
        ]);
    }

    /**
     * Show a single tag by slug (public). Returns id, name, slug.
     */
    public function show(Tag $tag): JsonResponse
    {
        $key = CacheKey::tag($tag->slug);
        $data = Cache::remember($key, CacheKey::TTL_TAGS_POPULAR, function () use ($tag) {
            return [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * List tags.
     */
    public function index(): JsonResponse
    {
        $tags = Tag::with('category:id,name,slug')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $tags,
        ]);
    }

    /**
     * Store a new tag.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $tag = Tag::create($validated);
        $this->invalidateTagsPopular();

        return response()->json([
            'success' => true,
            'data' => $tag,
            'message' => 'Tag created.',
        ], 201);
    }

    /**
     * Update a tag.
     */
    public function update(Request $request, Tag $tag): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $tag->update($validated);
        $this->invalidateTagsPopular();
        Cache::forget(CacheKey::tag($tag->slug));
        Cache::forget(CacheKey::adminStats());

        return response()->json([
            'success' => true,
            'data' => $tag->fresh(),
            'message' => 'Tag updated.',
        ]);
    }

    /**
     * Delete a tag.
     */
    public function destroy(Tag $tag): JsonResponse
    {
        $slug = $tag->slug;
        $tag->delete();
        $this->invalidateTagsPopular();
        Cache::forget(CacheKey::tag($slug));

        return response()->json([
            'success' => true,
            'message' => 'Tag deleted.',
        ]);
    }

    private function invalidateTagsPopular(): void
    {
        foreach ([9, 10, 20] as $limit) {
            Cache::forget(CacheKey::tagsPopular($limit));
        }
    }
}
