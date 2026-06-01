<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $globalSettings = \Illuminate\Support\Facades\Cache::rememberForever('global_settings', function () {
            return \App\Models\Setting::pluck('value', 'key')->toArray();
        });

        // Set defaults if not present
        $settings = [
            'app_name' => $globalSettings['app_name'] ?? 'Family Tree',
            'theme_color' => $globalSettings['theme_color'] ?? '#d4a843',
            'privacy_mode' => isset($globalSettings['privacy_mode']) ? $globalSettings['privacy_mode'] === '1' : false,
            'background_image' => isset($globalSettings['background_image']) ? \Illuminate\Support\Facades\Storage::url($globalSettings['background_image']) : null,
        ];

        return [
            ...parent::share($request),
            'app_name' => $settings['app_name'], // keep for backward compatibility
            'settings' => $settings,
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
