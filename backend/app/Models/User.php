<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Contracts\Auth\CanResetPassword;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements CanResetPassword
{
    use HasApiTokens, HasFactory, Notifiable, Sluggable, HasRoles;

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = [];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Attributes to append to model's array/JSON form.
     *
     * @var array<int, string>
     */
    protected $appends = ['image'];

    /**
     * Profile image: full URL. Uses avatar when set, otherwise default profile.png.
     */
    protected function image(): Attribute
    {
        return Attribute::make(
            get: function ($value) {

                if (blank($value)) {
                    return asset('images/profile.png');
                }

                if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
                    return $value;
                }

                return asset($value); 
                // Alternatif: storage ile kaydediyorsan:
                // return \Storage::url($value);
            }
        );
    }

    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'username',
            ],
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function blogs(): HasMany
    {
        return $this->hasMany(Blog::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likedBlogs(): BelongsToMany
    {
        return $this->belongsToMany(Blog::class, 'blog_likes')->withTimestamps();
    }

    public function bookmarkedBlogs(): BelongsToMany
    {
        return $this->belongsToMany(Blog::class, 'blog_bookmarks')->withTimestamps();
    }
}
