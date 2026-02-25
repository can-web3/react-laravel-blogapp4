<?php

namespace App\Support;

/**
 * Namespaced, versioned cache keys for Redis.
 * Format: app:{env}:{domain}:{resource}:{id}:v{version}
 */
final class CacheKey
{
    private const DOMAIN = 'api';

    private const VERSION = 1;

    public static function prefix(): string
    {
        return 'app:' . (config('app.env') ?: 'local') . ':' . self::DOMAIN;
    }

    public static function categoriesList(): string
    {
        return self::prefix() . ':categories:list:v' . self::VERSION;
    }

    public static function category(string $slug): string
    {
        return self::prefix() . ':category:' . $slug . ':v' . self::VERSION;
    }

    public static function tagsPopular(int $limit = 9): string
    {
        return self::prefix() . ':tags:popular:' . $limit . ':v' . self::VERSION;
    }

    public static function tag(string $slug): string
    {
        return self::prefix() . ':tag:' . $slug . ':v' . self::VERSION;
    }

    public static function blog(string $slug): string
    {
        return self::prefix() . ':blog:' . $slug . ':v' . self::VERSION;
    }

    public static function authorsList(int $limit = 10): string
    {
        return self::prefix() . ':authors:list:' . $limit . ':v' . self::VERSION;
    }

    public static function author(string $slug): string
    {
        return self::prefix() . ':author:' . $slug . ':v' . self::VERSION;
    }

    public static function adminStats(): string
    {
        return self::prefix() . ':admin:stats:v' . self::VERSION;
    }

    /** TTL in seconds. */
    public const TTL_CATEGORIES = 600;       // 10 min

    public const TTL_TAGS_POPULAR = 300;    // 5 min

    public const TTL_BLOG = 300;            // 5 min

    public const TTL_AUTHORS = 600;         // 10 min

    public const TTL_ADMIN_STATS = 90;      // 1.5 min (dashboard)
}
