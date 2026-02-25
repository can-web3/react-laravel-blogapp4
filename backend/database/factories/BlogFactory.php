<?php

namespace Database\Factories;

use App\Models\Blog;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Blog>
 */
class BlogFactory extends Factory
{
    protected $model = Blog::class;

    /**
     * Define the model's default state.
     * Her blog 1 category; 3 tag afterCreating ile bağlanır.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['draft', 'published', 'published', 'published', 'archived']);
        $publishedAt = $status === 'published' ? fake()->dateTimeBetween('-1 year') : null;
        $imageSeed = fake()->unique()->numberBetween(1, 1000);

        return [
            'user_id' => User::query()->inRandomOrder()->first()?->id ?? User::query()->first()?->id,
            'category_id' => Category::query()->inRandomOrder()->first()?->id,
            'title' => fake()->unique()->sentence(4),
            'excerpt' => fake()->paragraph(),
            'body' => fake()->paragraphs(4, true),
            'featured_image' => "https://picsum.photos/seed/{$imageSeed}/800/450",
            'status' => $status,
            'published_at' => $publishedAt,
            'view_count' => $status === 'published' ? fake()->numberBetween(0, 5000) : 0,
            'reading_time_minutes' => fake()->numberBetween(3, 12),
            'meta_title' => null,
            'meta_description' => null,
        ];
    }

    /**
     * Oluşturulduktan sonra bu kategoriye ait 3 tag ata.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Blog $blog) {
            if (! $blog->category_id) {
                return;
            }
            $tagIds = $blog->category->tags()->inRandomOrder()->limit(3)->pluck('id')->toArray();
            if (count($tagIds) > 0) {
                $blog->tags()->sync($tagIds);
            }
        });
    }
}
