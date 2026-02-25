<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\CacheKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Show a single category by slug. Public. Returns id, name, slug, description.
     */
    public function show(Category $category): JsonResponse
    {
        $key = CacheKey::category($category->slug);
        $data = Cache::remember($key, CacheKey::TTL_CATEGORIES, function () use ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description ?? '',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * List categories.
     */
    public function index(): JsonResponse
    {
        $key = CacheKey::categoriesList();
        $categories = Cache::remember($key, CacheKey::TTL_CATEGORIES, function () {
            return Category::orderBy('name')->get();
        });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Store a new category.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $category = Category::create($validated);
        Cache::forget(CacheKey::categoriesList());

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category created.',
        ], 201);
    }

    /**
     * Update a category.
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $category->update($validated);
        Cache::forget(CacheKey::categoriesList());
        Cache::forget(CacheKey::category($category->slug));

        return response()->json([
            'success' => true,
            'data' => $category->fresh(),
            'message' => 'Category updated.',
        ]);
    }

    /**
     * Delete a category.
     */
    public function destroy(Category $category): JsonResponse
    {
        $slug = $category->slug;
        $category->delete();
        Cache::forget(CacheKey::categoriesList());
        Cache::forget(CacheKey::category($slug));

        return response()->json([
            'success' => true,
            'message' => 'Category deleted.',
        ]);
    }
}
