<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Her kategoriye tam 3 tag; sadece o kategoriye atanmış. 9 x 3 = 27 tag.
     */
    public function run(): void
    {
        // Kategoriye atanmamış (eski) tagları kaldır; sadece kategoriye ait 27 tag kalsın
        Tag::whereNull('category_id')->delete();

        $categoryTags = [
            'Technology' => [
                ['name' => 'Laravel', 'description' => 'Laravel framework and PHP.'],
                ['name' => 'React', 'description' => 'React and frontend.'],
                ['name' => 'JavaScript', 'description' => 'JavaScript and TypeScript.'],
            ],
            'Economics' => [
                ['name' => 'Inflation', 'description' => 'Inflation and monetary policy.'],
                ['name' => 'Markets', 'description' => 'Financial markets.'],
                ['name' => 'Trading', 'description' => 'Trading and investment.'],
            ],
            'Health' => [
                ['name' => 'Nutrition', 'description' => 'Diet and nutrition.'],
                ['name' => 'Fitness', 'description' => 'Exercise and fitness.'],
                ['name' => 'Mental Health', 'description' => 'Wellness and mental health.'],
            ],
            'Lifestyle' => [
                ['name' => 'Minimalism', 'description' => 'Minimalist living.'],
                ['name' => 'Productivity', 'description' => 'Productivity tips.'],
                ['name' => 'Habits', 'description' => 'Building better habits.'],
            ],
            'Travel' => [
                ['name' => 'Backpacking', 'description' => 'Budget and backpacking travel.'],
                ['name' => 'Destinations', 'description' => 'Travel destinations.'],
                ['name' => 'Travel Tips', 'description' => 'Practical travel tips.'],
            ],
            'Food' => [
                ['name' => 'Recipes', 'description' => 'Cooking recipes.'],
                ['name' => 'Baking', 'description' => 'Baking and desserts.'],
                ['name' => 'Healthy Eating', 'description' => 'Healthy food choices.'],
            ],
            'Science' => [
                ['name' => 'Physics', 'description' => 'Physics and nature.'],
                ['name' => 'Biology', 'description' => 'Biology and life sciences.'],
                ['name' => 'Research', 'description' => 'Science research.'],
            ],
            'Sports' => [
                ['name' => 'Football', 'description' => 'Football and soccer.'],
                ['name' => 'Running', 'description' => 'Running and marathons.'],
                ['name' => 'Gym', 'description' => 'Gym and strength training.'],
            ],
            'Education' => [
                ['name' => 'Online Learning', 'description' => 'E-learning and courses.'],
                ['name' => 'Study Tips', 'description' => 'Study techniques.'],
                ['name' => 'Languages', 'description' => 'Language learning.'],
            ],
        ];

        foreach ($categoryTags as $categoryName => $tags) {
            $category = Category::where('name', $categoryName)->first();
            if (!$category) {
                continue;
            }

            foreach ($tags as $item) {
                $slug = Str::slug($item['name']);
                Tag::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'category_id' => $category->id,
                        'name' => $item['name'],
                        'description' => $item['description'],
                        'view_count' => 0,
                    ]
                );
            }
        }
    }
}
