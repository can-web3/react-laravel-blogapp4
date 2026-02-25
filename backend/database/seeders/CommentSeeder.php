<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Her blog için 20–40 arası yorum; yorumlar Users tablosundaki kullanıcılara atanır.
 */
class CommentSeeder extends Seeder
{
    public function run(): void
    {
        Comment::query()->delete();

        $users = User::query()->get();
        if ($users->isEmpty()) {
            return;
        }

        $blogs = Blog::query()->get();
        if ($blogs->isEmpty()) {
            return;
        }

        foreach ($blogs as $blog) {
            $count = random_int(20, 40);
            for ($i = 0; $i < $count; $i++) {
                Comment::factory()
                    ->for($blog)
                    ->for($users->random())
                    ->create();
            }
        }
    }
}
