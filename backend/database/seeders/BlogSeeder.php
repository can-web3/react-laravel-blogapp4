<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    /**
     * Her kullanıcıya (admin dahil) 3–6 arası blog atanır. Kategori ve tag'ler factory ile.
     * Mevcut bloglar silinir, sonra kullanıcı başına rastgele sayıda blog üretilir.
     */
    public function run(): void
    {
        Blog::query()->forceDelete();

        $users = User::query()->get();
        if ($users->isEmpty()) {
            return;
        }

        $categories = Category::has('tags')->get();
        if ($categories->isEmpty()) {
            return;
        }

        foreach ($users as $user) {
            $count = random_int(3, 6);
            for ($i = 0; $i < $count; $i++) {
                $category = $categories->random();
                Blog::factory()
                    ->for($user)
                    ->for($category)
                    ->create();
            }
        }
    }
}
