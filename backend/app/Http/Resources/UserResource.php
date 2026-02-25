<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'username' => $this->username,
            'slug' => $this->slug,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'avatar' => $this->avatar,
            'image' => $this->getImageUrl(),
            'bio' => $this->bio,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Profile image full URL: avatar when set, otherwise default profile.png.
     */
    private function getImageUrl(): string
    {
        $path = filled($this->avatar) ? $this->avatar : 'images/profile.png';

        return str_starts_with($path, 'http')
            ? $path
            : URL::asset($path);
    }
}
