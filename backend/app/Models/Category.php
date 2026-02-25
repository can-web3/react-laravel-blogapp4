<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Cviebrock\EloquentSluggable\Sluggable;

class Category extends Model
{
    use HasFactory, Sluggable;

    protected $fillable = ['name', 'slug', 'description'];

    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'name',
            ],
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Her kategoriye ait 3 slug (order 1=ana, 2-3=alternatif).
     */
    public function categorySlugs(): HasMany
    {
        return $this->hasMany(CategorySlug::class)->orderBy('order');
    }

    /**
     * Bu kategoriye ait taglar (kategori başına 3 tag).
     */
    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    public function blogs(): HasMany
    {
        return $this->hasMany(Blog::class);
    }
}
