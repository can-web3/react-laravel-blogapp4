<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CategorySlug;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Her kategoriye tam 3 slug atanır: ana slug + 2 alternatif.
     */
    public function run(): void
    {
        $categories = [
            'Technology' => ['technology', 'tech', 'technology-news'],
            'Economics'   => ['economics', 'economy', 'economics-news'],
            'Health'      => ['health', 'wellness', 'health-tips'],
            'Lifestyle'   => ['lifestyle', 'life', 'lifestyle-tips'],
            'Travel'      => ['travel', 'travel-tips', 'travel-guide'],
            'Food'        => ['food', 'cooking', 'food-recipes'],
            'Science'     => ['science', 'science-news', 'research'],
            'Sports'      => ['sports', 'sports-news', 'fitness'],
            'Education'   => ['education', 'learning', 'education-tips'],
        ];

        foreach ($categories as $name => $slugs) {
            $mainSlug = $slugs[0];
            $category = Category::firstOrCreate(
                ['slug' => $mainSlug],
                [
                    'name' => $name,
                    'description' => null,
                ]
            );

            // Eski seed'de slug farklı olabilir; ana slug'ı güncelle
            if ($category->slug !== $mainSlug) {
                $category->update(['slug' => $mainSlug]);
            }

            // Her kategoriye tam 3 slug (category_slugs tablosunda)
            foreach ($slugs as $index => $slug) {
                CategorySlug::firstOrCreate(
                    ['slug' => $slug],
                    [
                        'category_id' => $category->id,
                        'order' => $index + 1,
                    ]
                );
            }
        }
    }
}
