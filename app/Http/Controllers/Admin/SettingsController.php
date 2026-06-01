<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(): Response
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name' => ['nullable', 'string', 'max:255'],
            'theme_color' => ['nullable', 'string', 'max:50'],
            'privacy_mode' => ['nullable', 'boolean'],
            'background_image' => ['nullable', 'image', 'max:5120'], // max 5MB
        ]);

        // Handle File Upload
        if ($request->hasFile('background_image')) {
            $oldImage = Setting::where('key', 'background_image')->value('value');
            if ($oldImage) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldImage);
            }
            
            $path = $request->file('background_image')->store('settings', 'public');
            Setting::updateOrCreate(['key' => 'background_image'], ['value' => $path]);
            unset($validated['background_image']);
        }

        // Handle other settings
        foreach ($validated as $key => $value) {
            // Booleans are sent as 1/0 or true/false
            if ($key === 'privacy_mode') {
                $value = $value ? '1' : '0';
            }

            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        // Clear the cached settings
        Cache::forget('global_settings');

        return back()->with('success', 'Settings updated successfully.');
    }
}
