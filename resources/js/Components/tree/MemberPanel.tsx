import { useEffect, useState } from 'react';
import { MemberWithRelatives } from '@/types/family';
import { GENDER_COLORS, getInitials } from '@/lib/tree-utils';
import RelativeCard from './RelativeCard';

interface MemberPanelProps {
    memberId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (id: number) => void;
    onFocusTree?: (id: number) => void;
}

export default function MemberPanel({ memberId, isOpen, onClose, onNavigate, onFocusTree }: MemberPanelProps) {
    const [data, setData] = useState<MemberWithRelatives | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!memberId || !isOpen) return;

        setLoading(true);
        fetch(`/api/member/${memberId}/relatives`)
            .then((res) => res.json())
            .then((json: MemberWithRelatives) => {
                setData(json);
                setExpanded(false);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [memberId, isOpen]);

    if (!isOpen) return null;

    const member = data?.member;
    const colors = member ? GENDER_COLORS[member.gender] || GENDER_COLORS.other : GENDER_COLORS.other;
    const isDeceased = member?.date_of_death != null;

    const handleNavigate = (id: number) => {
        onNavigate(id);
    };

    const sections = [
        { title: 'Parents', items: data?.parents || [], icon: '👨‍👩' },
        { title: 'Spouse(s)', items: data?.spouses || [], icon: '💍' },
        { title: 'Children', items: data?.children || [], icon: '👶' },
        { title: 'Siblings', items: data?.siblings || [], icon: '👫' },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
                onClick={onClose}
                style={{ opacity: isOpen ? 1 : 0 }}
            />

            {/* Panel */}
            <div
                className="fixed top-0 right-0 h-full z-50 overflow-y-auto transition-transform duration-300 ease-out w-full md:w-[420px]"
                style={{
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    background: 'linear-gradient(180deg, rgba(15, 17, 23, 0.98), rgba(15, 17, 23, 0.95))',
                    backdropFilter: 'blur(20px)',
                    borderLeft: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#d4a843', borderTopColor: 'transparent' }} />
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</span>
                        </div>
                    </div>
                ) : member ? (
                    <div className="px-6 py-8">
                        {/* Profile Header */}
                        <div className="flex flex-col items-center text-center mb-8">
                            {/* Photo */}
                            <div
                                className={`w-28 h-28 rounded-full flex items-center justify-center mb-4 ${isDeceased ? 'grayscale' : ''}`}
                                style={{
                                    background: member.photo_url ? 'transparent' : colors.bg,
                                    border: `3px solid ${member.is_root ? '#d4a843' : colors.border}`,
                                    boxShadow: member.is_root
                                        ? '0 0 20px rgba(212, 168, 67, 0.3)'
                                        : `0 0 20px ${colors.border}40`,
                                    fontSize: '2rem',
                                    color: colors.text,
                                    fontWeight: 700,
                                }}
                            >
                                {member.photo_url ? (
                                    <img
                                        src={member.photo_url}
                                        alt={member.full_name}
                                        className={`w-full h-full rounded-full object-cover ${isDeceased ? 'grayscale' : ''}`}
                                    />
                                ) : (
                                    getInitials(member.first_name, member.last_name)
                                )}
                            </div>

                            {/* Root Badge / Focus Action */}
                            <div className="flex items-center gap-2 mb-2">
                                {member.is_root ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(212, 168, 67, 0.2)', color: '#d4a843' }}>
                                        ★ Root Member
                                    </span>
                                ) : (
                                    onFocusTree && (
                                        <button 
                                            onClick={() => onFocusTree(member.id)}
                                            className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors" 
                                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(212, 168, 67, 0.2)';
                                                e.currentTarget.style.color = '#d4a843';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <circle cx="12" cy="12" r="10" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            Focus Tree Here
                                        </button>
                                    )
                                )}
                            </div>

                            {/* Name */}
                            <h2 className="text-2xl font-semibold text-white mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                {member.full_name}
                            </h2>

                            {member.maiden_name && (
                                <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    née {member.maiden_name}
                                </p>
                            )}

                            {/* Life Info */}
                            <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                {member.date_of_birth && (
                                    <span>Born {new Date(member.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                )}
                                {member.age !== null && member.age !== undefined && (
                                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: isDeceased ? 'rgba(255,255,255,0.08)' : 'rgba(212, 168, 67, 0.15)', color: isDeceased ? 'rgba(255,255,255,0.5)' : '#d4a843' }}>
                                        {isDeceased ? `Died at ${member.age}` : `Age ${member.age}`}
                                    </span>
                                )}
                            </div>

                            {isDeceased && member.date_of_death && (
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    † {new Date(member.date_of_death).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                            )}

                            {member.birth_place && (
                                <p className="text-sm mt-2 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {member.birth_place}
                                </p>
                            )}
                        </div>

                        {/* Extended Info */}
                        {(member.occupation || member.email || member.phone || member.address) && (
                            <div className="mb-6 p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                {member.occupation && (
                                    <div className="flex items-start gap-3">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                        </svg>
                                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{member.occupation}</p>
                                    </div>
                                )}
                                {member.email && (
                                    <div className="flex items-start gap-3">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        <a href={`mailto:${member.email}`} className="text-sm hover:underline" style={{ color: 'rgba(255,255,255,0.8)' }}>{member.email}</a>
                                    </div>
                                )}
                                {member.phone && (
                                    <div className="flex items-start gap-3">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <a href={`tel:${member.phone}`} className="text-sm hover:underline" style={{ color: 'rgba(255,255,255,0.8)' }}>{member.phone}</a>
                                    </div>
                                )}
                                {member.address && (
                                    <div className="flex items-start gap-3">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{member.address}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Biography */}
                        {member.biography && (
                            <div className="mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    {expanded || member.biography.length <= 150
                                        ? member.biography
                                        : `${member.biography.substring(0, 150)}...`}
                                </p>
                                {member.biography.length > 150 && (
                                    <button
                                        onClick={() => setExpanded(!expanded)}
                                        className="text-xs mt-2 font-medium"
                                        style={{ color: '#d4a843' }}
                                    >
                                        {expanded ? 'Show less' : 'Read more'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Relationship Sections */}
                        {sections.map((section) => {
                            if (section.items.length === 0) return null;
                            return (
                                <div key={section.title} className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-base">{section.icon}</span>
                                        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                            {section.title}
                                        </h3>
                                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                                            {section.items.length}
                                        </span>
                                    </div>
                                    <div className={`space-y-2 ${section.items.length > 5 ? 'max-h-64 overflow-y-auto pr-1' : ''}`}>
                                        {section.items.map((item) => (
                                            <RelativeCard
                                                key={item.id}
                                                member={item}
                                                relationship={section.title}
                                                onClick={handleNavigate}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </>
    );
}
