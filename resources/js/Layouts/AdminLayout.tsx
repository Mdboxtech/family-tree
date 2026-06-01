import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState, ReactNode } from 'react';

interface FlashMessages {
    success?: string;
    error?: string;
}

export default function AdminLayout({ children, header }: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, flash, app_name, settings } = usePage<any>().props;
    const themeColor = settings?.theme_color || '#d4a843';
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
            ),
        },
        {
            name: 'Family Members',
            href: '/admin/members',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            name: 'Add Member',
            href: '/admin/members/create',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
            ),
        },
        {
            name: 'Settings',
            href: '/admin/settings',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            ),
        },
        {
            name: 'View Tree',
            href: '/',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="3" />
                    <line x1="12" y1="8" x2="12" y2="14" />
                    <line x1="6" y1="20" x2="12" y2="14" />
                    <line x1="18" y1="20" x2="12" y2="14" />
                </svg>
            ),
        },
    ];

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="min-h-screen flex" style={{ background: '#f8f9fa', fontFamily: "'DM Sans', sans-serif", '--theme-color': themeColor } as React.CSSProperties}>
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}
                style={{ background: '#1e3a5f' }}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                             style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2.5">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        {sidebarOpen && (
                            <span className="text-white text-lg font-semibold tracking-tight">
                                {app_name} Admin
                            </span>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-4 px-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = currentPath.startsWith(item.href) && item.href !== '/'
                                || item.href === '/' && currentPath === '/';
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'text-white'
                                            : 'text-blue-200/60 hover:text-white hover:bg-white/10'
                                    }`}
                                    style={isActive ? { background: `rgba(${parseInt(themeColor.slice(1,3),16)}, ${parseInt(themeColor.slice(3,5),16)}, ${parseInt(themeColor.slice(5,7),16)}, 0.2)`, color: themeColor } : {}}
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Toggle & User */}
                    <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-blue-200/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                 className={`transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}>
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            {sidebarOpen && <span className="text-sm">Collapse</span>}
                        </button>
                        {sidebarOpen && (
                            <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <p className="text-white text-sm font-medium">{auth?.user?.name || 'Admin'}</p>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="text-xs mt-1 hover:underline"
                                    style={{ color: themeColor }}
                                >
                                    Sign out
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-pulse"
                         style={{ background: '#059669', color: 'white' }}>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg"
                         style={{ background: '#dc2626', color: 'white' }}>
                        {flash.error}
                    </div>
                )}

                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
