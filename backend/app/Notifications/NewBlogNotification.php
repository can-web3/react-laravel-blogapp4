<?php

namespace App\Notifications;

use App\Models\Blog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewBlogNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Blog $blog
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $title = $this->blog->title;
        $author = $this->blog->user?->username ?? 'Someone';

        return (new MailMessage)
            ->subject('New blog post: ' . $title)
            ->line("A new blog post has been published: \"{$title}\" by {$author}.")
            ->action('View in admin', url('/'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_blog',
            'blog_id' => $this->blog->id,
            'blog_slug' => $this->blog->slug,
            'blog_title' => $this->blog->title,
            'author_username' => $this->blog->user?->username,
        ];
    }
}
