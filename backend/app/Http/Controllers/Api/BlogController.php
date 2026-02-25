<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogResource;
use App\Http\Resources\CommentResource;
use App\Models\Blog;
use App\Models\User;
use App\Notifications\NewBlogNotification;
use App\Notifications\NewCommentNotification;
use App\Notifications\NewLikeNotification;
use App\Support\CacheKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;

class BlogController extends Controller
{
    /**
     * List blogs (paginated). Public: only published, sort=latest|trending. With Bearer token: optional status, category_id.
     */
    public function index(Request $request): JsonResponse
    {
        $this->resolveOptionalUser($request);

        $query = Blog::withCount(['likers', 'bookmarkers', 'comments'])
            ->with(['user:id,username', 'category:id,name,slug', 'tags:id,name,slug']);

        if (! $request->user()) {
            $query->where('status', 'published');
            $sort = $request->get('sort', 'latest');
            if ($sort === 'trending') {
                $query->orderByDesc('view_count')->orderByDesc('published_at');
            } elseif ($sort === 'discussed') {
                $query->orderByDesc('comments_count')->orderByDesc('published_at');
            } else {
                $query->orderByDesc('published_at');
            }
        } else {
            $query->orderByDesc('updated_at');
            if ($request->filled('status')) {
                $query->where('status', $request->string('status'));
            }
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('category_slug')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->string('category_slug')));
        }

        if ($request->filled('tag_slug')) {
            $query->whereHas('tags', fn ($q) => $q->where('slug', $request->string('tag_slug')));
        }

        if ($request->filled('author_slug')) {
            $query->whereHas('user', fn ($q) => $q->where('slug', $request->string('author_slug')));
        }

        if ($request->filled('search')) {
            $term = (string) $request->input('search');
            $query->where('title', 'like', '%'.addcslashes($term, '%_\\').'%');
        }

        $perPage = max(1, min(50, (int) $request->get('per_page', 15)));
        $blogs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => BlogResource::collection($blogs->items()),
            'meta' => [
                'current_page' => $blogs->currentPage(),
                'last_page' => $blogs->lastPage(),
                'per_page' => $blogs->perPage(),
                'total' => $blogs->total(),
            ],
        ]);
    }

    private function resolveOptionalUser(Request $request): void
    {
        if ($request->user()) {
            return;
        }
        $token = $request->bearerToken();
        if (! $token) {
            return;
        }
        $accessToken = PersonalAccessToken::findToken($token);
        if ($accessToken && $accessToken->tokenable) {
            $request->setUserResolver(fn () => $accessToken->tokenable);
        }
    }

    /**
     * Show a single blog by slug. Guests see only published; auth can see any.
     * Cache used only for guests viewing published blogs.
     */
    public function show(Request $request, Blog $blog): JsonResponse
    {
        $this->resolveOptionalUser($request);

        if (! $request->user() && $blog->status !== 'published') {
            abort(404);
        }

        if (! $request->user() && $blog->status === 'published') {
            $key = CacheKey::blog($blog->slug);
            $payload = Cache::remember($key, CacheKey::TTL_BLOG, function () use ($blog) {
                $blog->loadCount(['likers', 'bookmarkers']);
                $blog->load(['user:id,username', 'category:id,name,slug', 'tags:id,name,slug']);
                $blog->setAttribute('user_has_liked', false);
                $blog->setAttribute('user_has_bookmarked', false);

                return ['success' => true, 'data' => new BlogResource($blog)];
            });

            return response()->json($payload);
        }

        $blog->loadCount(['likers', 'bookmarkers']);
        $blog->load(['user:id,username', 'category:id,name,slug', 'tags:id,name,slug']);

        if ($request->user()) {
            $blog->setAttribute('user_has_liked', $blog->likers()->where('user_id', $request->user()->id)->exists());
            $blog->setAttribute('user_has_bookmarked', $blog->bookmarkers()->where('user_id', $request->user()->id)->exists());
        } else {
            $blog->setAttribute('user_has_liked', false);
            $blog->setAttribute('user_has_bookmarked', false);
        }

        return response()->json([
            'success' => true,
            'data' => new BlogResource($blog),
        ]);
    }

    /**
     * Toggle like on a blog (auth required). Returns liked state and like count.
     */
    public function toggleLike(Request $request, Blog $blog): JsonResponse
    {
        if ($blog->status !== 'published') {
            abort(404);
        }

        $user = $request->user();
        $liked = $blog->likers()->where('user_id', $user->id)->exists();

        if ($liked) {
            $blog->likers()->detach($user->id);
            $liked = false;
        } else {
            $blog->likers()->attach($user->id);
            $liked = true;
            if ($blog->user_id !== $user->id) {
                $blog->load('user');
                $blog->user->notify(new NewLikeNotification($blog, $user));
            }
        }

        $likeCount = $blog->likers()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'liked' => $liked,
                'like_count' => $likeCount,
            ],
        ]);
    }

    /**
     * Toggle bookmark on a blog (auth required). Returns bookmarked state and bookmark count.
     */
    public function toggleBookmark(Request $request, Blog $blog): JsonResponse
    {
        if ($blog->status !== 'published') {
            abort(404);
        }

        $user = $request->user();
        $bookmarked = $blog->bookmarkers()->where('user_id', $user->id)->exists();

        if ($bookmarked) {
            $blog->bookmarkers()->detach($user->id);
            $bookmarked = false;
        } else {
            $blog->bookmarkers()->attach($user->id);
            $bookmarked = true;
        }

        $bookmarkCount = $blog->bookmarkers()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'bookmarked' => $bookmarked,
                'bookmark_count' => $bookmarkCount,
            ],
        ]);
    }

    /**
     * List comments for a blog (public). Only for published blogs when guest.
     */
    public function comments(Request $request, Blog $blog): JsonResponse
    {
        $this->resolveOptionalUser($request);

        if (! $request->user() && $blog->status !== 'published') {
            abort(404);
        }

        $comments = $blog->comments()->with('user:id,username')->orderBy('created_at')->get();

        return response()->json([
            'success' => true,
            'data' => CommentResource::collection($comments),
        ]);
    }

    /**
     * Store a comment on a blog (auth required). Only on published blogs.
     */
    public function storeComment(Request $request, Blog $blog): JsonResponse
    {
        if ($blog->status !== 'published') {
            abort(404);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $comment = $blog->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        $comment->load('user:id,username');

        if ($blog->user_id !== $request->user()->id) {
            $blog->user->notify(new NewCommentNotification($blog, $comment));
        }

        return response()->json([
            'success' => true,
            'data' => new CommentResource($comment),
            'message' => 'Comment added.',
        ], 201);
    }

    /**
     * Store a new blog. Accepts JSON or multipart with optional featured_image file.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'body' => ['required', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
            'featured_image' => ['nullable', 'image', 'mimes:jpeg,png,gif,webp', 'max:2048'],
            'status' => ['required', 'string', 'in:draft,published,scheduled,archived'],
            'published_at' => ['nullable', 'date'],
        ]);

        $blog = new Blog();
        $blog->user_id = $request->user()->id;
        $blog->title = $validated['title'];
        $blog->excerpt = $validated['excerpt'] ?? null;
        $blog->body = $validated['body'];
        $blog->category_id = $validated['category_id'] ?? null;
        $blog->status = $validated['status'];
        $blog->published_at = $validated['published_at'] ?? ($validated['status'] === 'published' ? now() : null);

        if ($request->hasFile('featured_image')) {
            $blog->featured_image = $request->file('featured_image')->store('blog-images', 'public');
        }

        $blog->save();

        $tagIds = $request->input('tag_ids', []);
        $blog->tags()->sync(is_array($tagIds) ? $tagIds : []);

        $blog->load(['user:id,username', 'category:id,name,slug', 'tags:id,name,slug']);

        $this->invalidateBlogCache($blog);

        foreach (User::role('admin')->get() as $admin) {
            $admin->notify(new NewBlogNotification($blog));
        }

        return response()->json([
            'success' => true,
            'data' => new BlogResource($blog),
            'message' => 'Blog created.',
        ], 201);
    }

    /**
     * Update a blog. Accepts JSON or multipart with optional featured_image file. Only the blog owner can update.
     */
    public function update(Request $request, Blog $blog): JsonResponse
    {
        if ($request->user()->id !== $blog->user_id) {
            abort(403, 'You can only edit your own posts.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'body' => ['required', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
            'featured_image' => ['nullable', 'image', 'mimes:jpeg,png,gif,webp', 'max:2048'],
            'status' => ['required', 'string', 'in:draft,published,scheduled,archived'],
            'published_at' => ['nullable', 'date'],
        ]);

        $blog->title = $validated['title'];
        $blog->excerpt = $validated['excerpt'] ?? null;
        $blog->body = $validated['body'];
        $blog->category_id = $validated['category_id'] ?? null;
        $blog->status = $validated['status'];
        $blog->published_at = $validated['published_at'] ?? ($validated['status'] === 'published' && ! $blog->published_at ? now() : $blog->published_at);

        if ($request->hasFile('featured_image')) {
            if ($blog->featured_image) {
                Storage::disk('public')->delete($blog->featured_image);
            }
            $blog->featured_image = $request->file('featured_image')->store('blog-images', 'public');
        }

        $blog->save();

        $tagIds = $request->input('tag_ids', []);
        $blog->tags()->sync(is_array($tagIds) ? $tagIds : []);

        $blog->load(['user:id,username', 'category:id,name,slug', 'tags:id,name,slug']);

        $this->invalidateBlogCache($blog);

        return response()->json([
            'success' => true,
            'data' => new BlogResource($blog),
            'message' => 'Blog updated.',
        ]);
    }

    /**
     * Delete a blog (soft delete). Only the blog owner can delete.
     */
    public function destroy(Request $request, Blog $blog): JsonResponse
    {
        if ($request->user()->id !== $blog->user_id) {
            abort(403, 'You can only delete your own posts.');
        }

        $slug = $blog->slug;
        $user = $blog->user;
        $blog->delete();

        Cache::forget(CacheKey::blog($slug));
        $this->invalidateAuthorCache($user);

        return response()->json([
            'success' => true,
            'message' => 'Blog deleted.',
        ]);
    }

    private function invalidateBlogCache(Blog $blog): void
    {
        Cache::forget(CacheKey::blog($blog->slug));
        $this->invalidateTagsPopular();
        if ($blog->user) {
            $this->invalidateAuthorCache($blog->user);
        }
    }

    private function invalidateTagsPopular(): void
    {
        foreach ([9, 10, 20] as $limit) {
            Cache::forget(CacheKey::tagsPopular($limit));
        }
    }

    private function invalidateAuthorCache(\App\Models\User $user): void
    {
        Cache::forget(CacheKey::author($user->slug));
        foreach ([10, 20] as $limit) {
            Cache::forget(CacheKey::authorsList($limit));
        }
    }
}
