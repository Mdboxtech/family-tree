import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FormEventHandler, useRef, useState } from 'react';

export default function Settings() {
    const { settings } = usePage().props as any;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(settings.background_image);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        app_name: settings.app_name || 'Family Tree',
        theme_color: settings.theme_color || '#d4a843',
        privacy_mode: settings.privacy_mode || false,
        background_image: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('background_image', file);
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('background_image', null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        // Note: Actual deletion from server would require an explicit delete route if removing previously saved image.
        // For simplicity, we just won't send a new image. If user wants to delete, a separate action is usually better.
    };

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Application Settings
                </h2>
            }
        >
            <Head title="Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* GENERAL SETTINGS CARD */}
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-100">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">General Details</h3>
                                <p className="text-sm text-gray-500 mb-6">Basic information and access control for your family tree.</p>
                                
                                <div className="space-y-6 max-w-xl">
                                    <div>
                                        <label htmlFor="app_name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Website Name
                                        </label>
                                        <input
                                            id="app_name"
                                            className="px-4 py-2.5 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#d4a843] focus:ring-[#d4a843] sm:text-sm transition-colors"
                                            value={data.app_name}
                                            onChange={(e) => setData('app_name', e.target.value)}
                                            required
                                        />
                                        {errors.app_name && <p className="mt-2 text-sm text-red-500">{errors.app_name}</p>}
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Privacy Mode</h4>
                                            <p className="text-xs text-gray-500 mt-1">Require authentication to view the family tree. Guests will be redirected to login.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={data.privacy_mode} onChange={(e) => setData('privacy_mode', e.target.checked)} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#d4a843]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a843]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* APPEARANCE CARD */}
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-100">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Appearance & Theming</h3>
                                <p className="text-sm text-gray-500 mb-6">Customize the look and feel of the interactive tree canvas.</p>
                                
                                <div className="space-y-6 max-w-xl">
                                    <div>
                                        <label htmlFor="theme_color" className="block text-sm font-medium text-gray-700 mb-1">
                                            Primary Accent Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                id="theme_color"
                                                className="h-10 w-14 rounded border border-gray-300 cursor-pointer p-0.5 bg-white"
                                                value={data.theme_color}
                                                onChange={(e) => setData('theme_color', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="block w-32 rounded-lg border-gray-300 shadow-sm focus:border-[#d4a843] focus:ring-[#d4a843] sm:text-sm transition-colors uppercase font-mono"
                                                value={data.theme_color}
                                                onChange={(e) => setData('theme_color', e.target.value)}
                                                maxLength={7}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tree Background Image
                                        </label>
                                        
                                        {preview ? (
                                            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={preview} alt="Background Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={removeImage} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600">
                                                        Change Image
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div 
                                                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className="space-y-1 text-center">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <div className="flex text-sm text-gray-600 justify-center">
                                                        <span className="relative rounded-md font-medium text-[#d4a843] hover:text-[#e4c06a] focus-within:outline-none">
                                                            <span>Upload a file</span>
                                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                                </div>
                                            </div>
                                        )}
                                        {errors.background_image && <p className="mt-2 text-sm text-red-500">{errors.background_image}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SAVE ACTION */}
                        <div className="flex items-center justify-end gap-4">
                            {recentlySuccessful && (
                                <p className="text-sm font-medium text-green-600">Settings saved successfully.</p>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-lg border border-transparent bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d4a843] focus:ring-offset-2 disabled:opacity-50"
                                style={data.theme_color !== '#d4a843' ? { backgroundColor: data.theme_color, color: '#fff' } : {}}
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
