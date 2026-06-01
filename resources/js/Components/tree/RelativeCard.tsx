import { FamilyMember } from '@/types/family';
import { GENDER_COLORS, getInitials } from '@/lib/tree-utils';

interface RelativeCardProps {
    member: FamilyMember & { marriage_date?: string; divorce_date?: string };
    relationship?: string;
    onClick?: (id: number) => void;
}

export default function RelativeCard({ member, relationship, onClick }: RelativeCardProps) {
    const colors = GENDER_COLORS[member.gender] || GENDER_COLORS.other;
    const isDeceased = !!member.date_of_death;

    return (
        <button
            onClick={() => onClick?.(member.id)}
            className="flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group text-left"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = colors.border;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            }}
        >
            {/* Avatar */}
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${isDeceased ? 'grayscale' : ''}`}
                style={{
                    background: colors.bg,
                    border: `2px solid ${colors.border}`,
                    color: colors.text,
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

            {/* Info */}
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate group-hover:text-gold-light">
                    {member.full_name}
                </p>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {member.age !== null && member.age !== undefined && (
                        <span>{isDeceased ? `Died at ${member.age}` : `Age ${member.age}`}</span>
                    )}
                    {member.marriage_date && (
                        <span>• Married {new Date(member.marriage_date).getFullYear()}</span>
                    )}
                </div>
            </div>

            {/* Arrow indicator */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"
                 className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </button>
    );
}
