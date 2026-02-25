<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class BlogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'category_id' => $this->category_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'body' => $this->body,
            'featured_image' => $this->featuredImageUrl(),
            'status' => $this->status,
            'published_at' => $this->published_at?->toIso8601String(),
            'view_count' => $this->view_count,
            'like_count' => $this->likers_count ?? 0,
            'user_has_liked' => (bool) ($this->user_has_liked ?? false),
            'bookmark_count' => $this->bookmarkers_count ?? 0,
            'user_has_bookmarked' => (bool) ($this->user_has_bookmarked ?? false),
            'comment_count' => $this->comments_count ?? 0,
            'reading_time_minutes' => $this->reading_time_minutes,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'username' => $this->user->username,
            ]),
            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ])),
        ];
    }

    /**
     * Harici URL ise olduğu gibi döner, path ise storage URL üretir.
     * İstek yapılan host:port kullanılır (frontend farklı portta olsa bile resim doğru yerde yüklenir).
     */
    private function featuredImageUrl(): ?string
    {
        if (! $this->featured_image) {
            return null;
        }
        if (str_starts_with($this->featured_image, 'http://') || str_starts_with($this->featured_image, 'https://')) {
            return $this->featured_image;
        }

        $path = '/storage/'.ltrim($this->featured_image, '/');
        $request = request();
        if ($request && $request->getSchemeAndHttpHost()) {
            return $request->getSchemeAndHttpHost().$path;
        }

        return Storage::disk('public')->url($this->featured_image);
    }
}
