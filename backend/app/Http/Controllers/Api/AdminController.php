<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogResource;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\User;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function stats(): JsonResponse
    {
        $totalBlogs = Blog::count();
        $publishedBlogs = Blog::where('status', 'published')->count();
        $draftBlogs = Blog::where('status', 'draft')->count();
        $totalUsers = User::count();
        $totalComments = Comment::count();
        $totalCategories = Category::count();
        $totalTags = Tag::count();

        // Blogs created this week
        $blogsThisWeek = Blog::where('created_at', '>=', now()->startOfWeek())->count();
        // Users registered this week
        $usersThisWeek = User::where('created_at', '>=', now()->startOfWeek())->count();
        // Comments this week
        $commentsThisWeek = Comment::where('created_at', '>=', now()->startOfWeek())->count();

        // Recent blogs (last 5)
        $recentBlogs = Blog::with(['user:id,username', 'category:id,name,slug'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_blogs' => $totalBlogs,
                    'published_blogs' => $publishedBlogs,
                    'draft_blogs' => $draftBlogs,
                    'blogs_this_week' => $blogsThisWeek,
                    'total_users' => $totalUsers,
                    'users_this_week' => $usersThisWeek,
                    'total_comments' => $totalComments,
                    'comments_this_week' => $commentsThisWeek,
                    'total_categories' => $totalCategories,
                    'total_tags' => $totalTags,
                ],
                'recent_blogs' => BlogResource::collection($recentBlogs),
            ],
        ]);
    }
}
