<?php

namespace App\Notifications;

use App\Models\Blog;
use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCommentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Blog $blog,
        public Comment $comment
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $commenter = $this->comment->user?->username ?? 'Someone';
        $title = $this->blog->title;
        $excerpt = \Illuminate\Support\Str::limit($this->comment->body, 80);

        return (new MailMessage)
            ->subject("New comment on your post: {$title}")
            ->line("{$commenter} commented on your post \"{$title}\":")
            ->line("\"{$excerpt}\"")
            ->action('View comment', url('/'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_comment',
            'blog_id' => $this->blog->id,
            'blog_slug' => $this->blog->slug,
            'blog_title' => $this->blog->title,
            'comment_id' => $this->comment->id,
            'commenter_username' => $this->comment->user?->username,
            'comment_excerpt' => \Illuminate\Support\Str::limit($this->comment->body, 100),
        ];
    }
}
