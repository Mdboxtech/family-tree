import { useState } from 'react';
import { router } from '@inertiajs/react';
import { RelationshipDisplay } from '@/types/family';

interface RelationshipManagerProps {
    memberId: number;
    relationships: RelationshipDisplay[];
    allMembers: Array<{ id: number; full_name: string; gender: string; photo_url?: string | null }>;
}

export default function RelationshipManager({ memberId, relationships, allMembers }: RelationshipManagerProps) {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState<number | null>(null);
    const [relType, setRelType] = useState<string>('parent');
    const [marriageDate, setMarriageDate] = useState('');
    const [divorceDate, setDivorceDate] = useState('');
    const [isBiological, setIsBiological] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const filteredMembers = allMembers.filter((m) =>
        m.full_name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        if (!selectedMember) return;
        setProcessing(true);

        router.post('/admin/relationships', {
            person_id: memberId,
            relative_id: selectedMember,
            type: relType,
            marriage_date: relType === 'spouse' ? marriageDate : null,
            divorce_date: relType === 'spouse' ? divorceDate : null,
            is_biological: isBiological,
        }, {
            onSuccess: () => {
                setShowModal(false);
                resetForm();
            },
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = (relId: number) => {
        router.delete(`/admin/relationships/${relId}`, {
            onFinish: () => setDeleteConfirm(null),
        });
    };

    const resetForm = () => {
        setSearch('');
        setSelectedMember(null);
        setRelType('parent');
        setMarriageDate('');
        setDivorceDate('');
        setIsBiological(true);
    };

    const typeColors: Record<string, { bg: string; text: string; border: string }> = {
        parent: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
        child: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
        spouse: { bg: '#fdf4ff', text: '#86198f', border: '#f0abfc' },
        sibling: { bg: '#fefce8', text: '#854d0e', border: '#fde68a' },
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#1e3a5f' }}>Relationships</h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #d4a843, #c49a3a)' }}
                >
                    + Add Relationship
                </button>
            </div>

            {/* Current Relationships */}
            {relationships.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No relationships yet. Click "Add Relationship" to connect family members.</p>
            ) : (
                <div className="space-y-2">
                    {relationships.map((rel) => {
                        const colors = typeColors[rel.type] || typeColors.parent;
                        return (
                            <div
                                key={rel.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 transition-all hover:shadow-sm"
                            >
                                {/* Avatar */}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                    style={{
                                        background: rel.relative_gender === 'male' ? 'rgba(30,58,95,0.1)' : 'rgba(139,34,82,0.1)',
                                        color: rel.relative_gender === 'male' ? '#1e3a5f' : '#8b2252',
                                    }}
                                >
                                    {rel.relative_photo_url ? (
                                        <img src={rel.relative_photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        rel.relative_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{rel.relative_name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                                            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                                        >
                                            {rel.type}
                                        </span>
                                        {rel.marriage_date && (
                                            <span className="text-xs text-gray-400">
                                                Married {new Date(rel.marriage_date).getFullYear()}
                                            </span>
                                        )}
                                        {!rel.is_biological && (
                                            <span className="text-xs text-gray-400 italic">Non-biological</span>
                                        )}
                                    </div>
                                </div>

                                {/* Delete */}
                                {deleteConfirm === rel.id ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(rel.id)}
                                            className="px-3 py-1 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="px-3 py-1 rounded-lg text-xs font-medium text-gray-500 bg-gray-100"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirm(rel.id)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Relationship Modal */}
            {showModal && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setShowModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-lg font-semibold" style={{ color: '#1e3a5f' }}>Add Relationship</h4>
                                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Relationship Type */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-1">Relationship Type</label>
                                    <select
                                        value={relType}
                                        onChange={(e) => setRelType(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                                    >
                                        <option value="parent">Parent</option>
                                        <option value="child">Child</option>
                                        <option value="spouse">Spouse</option>
                                        <option value="sibling">Sibling</option>
                                    </select>
                                </div>

                                {/* Member Search */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-1">Select Member</label>
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none mb-2"
                                    />
                                    <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-gray-100 p-1">
                                        {filteredMembers.map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => setSelectedMember(m.id)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                                                    selectedMember === m.id ? 'bg-amber-50 text-amber-800 font-medium' : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                            >
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{
                                                        background: m.gender === 'male' ? 'rgba(30,58,95,0.1)' : 'rgba(139,34,82,0.1)',
                                                        color: m.gender === 'male' ? '#1e3a5f' : '#8b2252',
                                                    }}
                                                >
                                                    {m.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                {m.full_name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Spouse-specific fields */}
                                {relType === 'spouse' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-1">Marriage Date</label>
                                            <input
                                                type="date"
                                                value={marriageDate}
                                                onChange={(e) => setMarriageDate(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-1">Divorce Date</label>
                                            <input
                                                type="date"
                                                value={divorceDate}
                                                onChange={(e) => setDivorceDate(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Biological toggle */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={isBiological}
                                        onChange={(e) => setIsBiological(e.target.checked)}
                                        className="rounded"
                                        style={{ accentColor: '#d4a843' }}
                                        id="bio_check"
                                    />
                                    <label htmlFor="bio_check" className="text-sm text-gray-600">Biological relationship</label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleAdd}
                                    disabled={!selectedMember || processing}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #d4a843, #c49a3a)' }}
                                >
                                    {processing ? 'Adding...' : 'Add Relationship'}
                                </button>
                                <button
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
