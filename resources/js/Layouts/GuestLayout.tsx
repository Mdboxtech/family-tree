import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { app_name, settings } = usePage().props as any;
    const themeColor = settings?.theme_color || '#d4a843';

    // Helper to get rgba string from hex
    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) || 212;
        const g = parseInt(hex.slice(3, 5), 16) || 168;
        const b = parseInt(hex.slice(5, 7), 16) || 67;
        return `${r}, ${g}, ${b}`;
    };
    const rgbStr = hexToRgb(themeColor);

    return (
        <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0" style={{ background: '#0f1117' }}>
            <div className="absolute inset-0 opacity-30 pointer-events-none"
                 style={{ backgroundImage: `radial-gradient(circle at 20% 50%, rgba(30, 58, 95, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 34, 82, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(${rgbStr}, 0.05) 0%, transparent 50%)` }}
            />

            <div className="z-10 flex flex-col items-center">
                <Link href="/" className="flex items-center gap-3 mb-8 transition-transform hover:scale-105">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                         style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, boxShadow: `0 4px 20px rgba(${rgbStr}, 0.2)` }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f1117" strokeWidth="2.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <span className="text-3xl font-semibold tracking-tight"
                          style={{ fontFamily: "'Cormorant Garamond', serif", color: themeColor }}>
                        {app_name || 'Family Tree'}
                    </span>
                </Link>

                <div className="w-full sm:max-w-md px-8 py-8 glass rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)' }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
