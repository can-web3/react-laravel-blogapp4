<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => 'bail|required|string|min:3|max:255|',
            'email' => 'bail|required|string|email:rfc,dns|max:255|unique:users',
            'password' => 'bail|required|string|min:4|max:255',
            'confirm_password' => 'bail|required|string|min:4|max:255|same:password',
        ];
    }
}
