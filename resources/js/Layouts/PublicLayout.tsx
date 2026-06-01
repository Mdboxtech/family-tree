import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth, app_name, settings } = usePage().props as any;
    const themeColor = settings?.theme_color || '#d4a843';

    return (
        <div className="min-h-screen" style={{ background: '#0f1117', '--theme-color': themeColor } as React.CSSProperties}>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                                 style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f1117" strokeWidth="2.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <span className="text-xl font-semibold tracking-tight"
                                  style={{ fontFamily: "'Cormorant Garamond', serif", color: themeColor }}>
                                {app_name || 'Family Tree'}
                            </span>
                        </Link>

                        {auth?.user ? (
                            <Link
                                href={route('admin.dashboard')}
                                className="text-sm px-4 py-2 rounded-lg transition-all duration-200"
                                style={{
                                    color: 'rgba(255,255,255,0.8)',
                                    background: `rgba(${parseInt(themeColor.slice(1, 3), 16)}, ${parseInt(themeColor.slice(3, 5), 16)}, ${parseInt(themeColor.slice(5, 7), 16)}, 0.1)`,
                                    border: `1px solid rgba(${parseInt(themeColor.slice(1, 3), 16)}, ${parseInt(themeColor.slice(3, 5), 16)}, ${parseInt(themeColor.slice(5, 7), 16)}, 0.3)`,
                                }}
                            >
                                Admin Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="text-sm px-4 py-2 rounded-lg transition-all duration-200"
                                style={{
                                    color: 'rgba(255,255,255,0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                Admin Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-16 h-screen">
                {children}
            </main>
        </div>
    );
}
