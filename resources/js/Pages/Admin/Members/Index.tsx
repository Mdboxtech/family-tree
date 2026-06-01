import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FamilyMember, PaginatedData } from '@/types/family';
import { useState } from 'react';

interface IndexProps {
    members: PaginatedData<FamilyMember & { relationships_count: number }>;
    filters: { search?: string };
}

export default function Index({ members, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/admin/members', { search: value || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/members/${id}`, {
            onFinish: () => setDeleteConfirm(null),
        });
    };

    return (
        <AdminLayout>
            <Head title="Family Members" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#1e3a5f' }}>Family Members</h1>
                    <p className="text-gray-500 mt-1">{members.total} member{members.total !== 1 ? 's' : ''} total</p>
                </div>
                <Link
                    href="/admin/members/create"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #d4a843, #c49a3a)' }}
                >
                    + Add Member
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none bg-white"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Member</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Gender</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Age</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Relations</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {members.data.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                                style={{
                                                    background: member.gender === 'male' ? 'rgba(30,58,95,0.1)' : member.gender === 'female' ? 'rgba(139,34,82,0.1)' : 'rgba(107,91,149,0.1)',
                                                    color: member.gender === 'male' ? '#1e3a5f' : member.gender === 'female' ? '#8b2252' : '#6b5b95',
                                                    border: member.is_root ? '2px solid #d4a843' : 'none',
                                                }}
                                            >
                                                {member.photo_url ? (
                                                    <img src={member.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    `${member.first_name[0]}${member.last_name[0]}`
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {member.full_name}
                                                    {member.is_root && <span className="ml-1.5 text-xs" style={{ color: '#d4a843' }}>★</span>}
                                                </p>
                                                {member.date_of_birth && (
                                                    <p className="text-xs text-gray-400">{member.date_of_birth}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm capitalize text-gray-600">{member.gender}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{member.age ?? '—'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{member.relationships_count}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.date_of_death ? (
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Deceased</span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">Living</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/members/${member.id}/edit`}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                style={{ background: 'rgba(30,58,95,0.08)', color: '#1e3a5f' }}
                                            >
                                                Edit
                                            </Link>
                                            {deleteConfirm === member.id ? (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleDelete(member.id)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-gray-100"
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(member.id)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {members.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Page {members.current_page} of {members.last_page}
                        </p>
                        <div className="flex gap-1">
                            {members.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        link.active ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                                    } disabled:opacity-30`}
                                    style={link.active ? { background: '#1e3a5f' } : {}}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
