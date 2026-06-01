import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface DashboardProps {
    stats: {
        members_count: number;
        relationships_count: number;
        root_member: string | null;
    };
}

export default function Dashboard({ stats }: DashboardProps) {
    const cards = [
        {
            title: 'Family Members',
            value: stats.members_count,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            color: '#1e3a5f',
        },
        {
            title: 'Relationships',
            value: stats.relationships_count,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            ),
            color: '#8b2252',
        },
        {
            title: 'Root Member',
            value: stats.root_member || 'Not set',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ),
            color: '#d4a843',
        },
    ];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold" style={{ color: '#1e3a5f', fontFamily: "'DM Sans', sans-serif" }}>
                    Dashboard
                </h1>
                <p className="text-gray-500 mt-1">Manage your family tree</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="card-lift bg-white rounded-2xl p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: `${card.color}15`, color: card.color }}
                            >
                                {card.icon}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                        <p className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#1e3a5f' }}>Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <a
                        href="/admin/members/create"
                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 transition-all duration-200 hover:border-amber-200 hover:bg-amber-50"
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212, 168, 67, 0.1)', color: '#d4a843' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: '#1e3a5f' }}>Add Member</p>
                            <p className="text-xs text-gray-400">Create a new family member</p>
                        </div>
                    </a>
                    <a
                        href="/admin/members"
                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50"
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(30, 58, 95, 0.1)', color: '#1e3a5f' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="8" y1="6" x2="21" y2="6" />
                                <line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" />
                                <line x1="3" y1="12" x2="3.01" y2="12" />
                                <line x1="3" y1="18" x2="3.01" y2="18" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: '#1e3a5f' }}>View Members</p>
                            <p className="text-xs text-gray-400">Browse all family members</p>
                        </div>
                    </a>
                    <a
                        href="/"
                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50"
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139, 34, 82, 0.1)', color: '#8b2252' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="5" r="3" />
                                <line x1="12" y1="8" x2="12" y2="14" />
                                <line x1="6" y1="20" x2="12" y2="14" />
                                <line x1="18" y1="20" x2="12" y2="14" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: '#1e3a5f' }}>View Tree</p>
                            <p className="text-xs text-gray-400">See the interactive family tree</p>
                        </div>
                    </a>
                </div>
            </div>
        </AdminLayout>
    );
}
