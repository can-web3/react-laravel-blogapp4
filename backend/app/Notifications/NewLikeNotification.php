<?php

namespace App\Notifications;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewLikeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Blog $blog,
        public User $liker
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $likerName = $this->liker->username;
        $title = $this->blog->title;

        return (new MailMessage)
            ->subject("{$likerName} liked your post: {$title}")
            ->line("{$likerName} liked your post \"{$title}\".")
            ->action('View post', url('/'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_like',
            'blog_id' => $this->blog->id,
            'blog_slug' => $this->blog->slug,
            'blog_title' => $this->blog->title,
            'liker_username' => $this->liker->username,
        ];
    }
}
