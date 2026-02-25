<?php

namespace App\Support;

/**
 * Recursively sanitizes mixed data so all string values are valid UTF-8.
 * Prevents "Malformed UTF-8 characters, possibly incorrectly encoded" when encoding to JSON.
 */
final class Utf8Sanitizer
{
    /**
     * Recursively ensure all strings in the value are valid UTF-8.
     *
     * @param  mixed  $value  Array, object, or scalar (string/int/float/bool/null).
     * @return mixed Same structure with strings sanitized.
     */
    public static function sanitize(mixed $value): mixed
    {
        if (is_string($value)) {
            return self::sanitizeString($value);
        }

        if (is_array($value)) {
            return array_map([self::class, 'sanitize'], $value);
        }

        if (is_object($value)) {
            $out = [];
            foreach ((array) $value as $k => $v) {
                $out[self::sanitizeString((string) $k)] = self::sanitize($v);
            }
            return (object) $out;
        }

        return $value;
    }

    /**
     * Convert string to valid UTF-8, replacing or dropping invalid sequences.
     */
    public static function sanitizeString(string $value): string
    {
        if ($value === '') {
            return '';
        }

        if (mb_check_encoding($value, 'UTF-8')) {
            return $value;
        }

        // Try to fix common single-byte encodings (e.g. Windows-1254, ISO-8859-1)
        $encodings = ['Windows-1254', 'ISO-8859-9', 'ISO-8859-1'];
        foreach ($encodings as $encoding) {
            $converted = @mb_convert_encoding($value, 'UTF-8', $encoding);
            if ($converted !== false && mb_check_encoding($converted, 'UTF-8')) {
                return $converted;
            }
        }

        // Fallback: strip invalid UTF-8 bytes (PHP 7.2+ style)
        return (string) mb_convert_encoding($value, 'UTF-8', 'UTF-8');
    }
}
