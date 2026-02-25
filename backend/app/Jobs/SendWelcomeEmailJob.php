<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Mail\Message;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public User $user
    ) {}

    public function handle(): void
    {
        $user = $this->user;
        $appName = config('app.name');

        Mail::raw(
            "Welcome to {$appName}, {$user->username}! Your account has been created successfully.",
            function (Message $message) use ($user) {
                $message->to($user->email)
                    ->subject('Welcome to ' . config('app.name'));
            }
        );
    }
}
