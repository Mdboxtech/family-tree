import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { FamilyMember } from '@/types/family';

interface MemberFormProps {
    member?: FamilyMember & { photo_path?: string };
    mode: 'create' | 'edit';
}

export default function MemberForm({ member, mode }: MemberFormProps) {
    const [values, setValues] = useState({
        first_name: member?.first_name || '',
        last_name: member?.last_name || '',
        maiden_name: member?.maiden_name || '',
        gender: member?.gender || 'male',
        date_of_birth: member?.date_of_birth?.split('T')[0] || '',
        date_of_death: member?.date_of_death?.split('T')[0] || '',
        birth_place: member?.birth_place || '',
        biography: member?.biography || '',
        is_root: member?.is_root || false,
        email: member?.email || '',
        phone: member?.phone || '',
        address: member?.address || '',
        occupation: member?.occupation || '',
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(member?.photo_url || null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setValues((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setValues((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
            }
        });
        if (photo) {
            formData.append('photo', photo);
        }

        const url = mode === 'create' ? '/admin/members' : `/admin/members/${member?.id}`;

        if (mode === 'edit') {
            formData.append('_method', 'PUT');
        }

        router.post(url, formData, {
            forceFormData: true,
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const inputStyle = {
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '10px 14px',
        fontSize: '14px',
        width: '100%',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
    };

    const labelStyle = {
        fontSize: '13px',
        fontWeight: '600' as const,
        color: '#374151',
        marginBottom: '6px',
        display: 'block',
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex items-center gap-6">
                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{
                        background: photoPreview ? 'transparent' : '#f3f4f6',
                        border: '2px dashed #d1d5db',
                    }}
                >
                    {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    )}
                </div>
                <div>
                    <label
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                        style={{ background: '#f3f4f6', color: '#374151' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Photo
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP. Max 2MB.</p>
                    {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
                </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label style={labelStyle}>First Name *</label>
                    <input name="first_name" value={values.first_name} onChange={handleChange} required style={inputStyle}
                           onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                           onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                </div>
                <div>
                    <label style={labelStyle}>Last Name *</label>
                    <input name="last_name" value={values.last_name} onChange={handleChange} required style={inputStyle}
                           onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                           onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label style={labelStyle}>Maiden Name</label>
                    <input name="maiden_name" value={values.maiden_name} onChange={handleChange} style={inputStyle}
                           onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                           onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Gender *</label>
                    <select name="gender" value={values.gender} onChange={handleChange} required style={inputStyle}
                            onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input type="date" name="date_of_birth" value={values.date_of_birth} onChange={handleChange} style={inputStyle}
                           onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                           onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    {errors.date_of_birth && <p className="text-xs text-red-500 mt-1">{errors.date_of_birth}</p>}
                </div>
                <div>
                    <label style={labelStyle}>Date of Death</label>
                    <input type="date" name="date_of_death" value={values.date_of_death} onChange={handleChange} style={inputStyle}
                           onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                           onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    {errors.date_of_death && <p className="text-xs text-red-500 mt-1">{errors.date_of_death}</p>}
                </div>
            </div>

            {/* Birth Place & Occupation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label style={labelStyle}>Birth Place</label>
                    <input name="birth_place" value={values.birth_place} onChange={handleChange} style={inputStyle}
                           placeholder="e.g. Lagos, Nigeria"
                           onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                           onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Occupation / Profession</label>
                    <input name="occupation" value={values.occupation} onChange={handleChange} style={inputStyle}
                           placeholder="e.g. Software Engineer"
                           onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                           onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    {errors.occupation && <p className="text-xs text-red-500 mt-1">{errors.occupation}</p>}
                </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" name="email" value={values.email} onChange={handleChange} style={inputStyle}
                           placeholder="email@example.com"
                           onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                           onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="tel" name="phone" value={values.phone} onChange={handleChange} style={inputStyle}
                           placeholder="+1 234 567 8900"
                           onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                           onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
            </div>

            {/* Address */}
            <div>
                <label style={labelStyle}>Current Address</label>
                <textarea
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Full residential address..."
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>

            {/* Biography */}
            <div>
                <label style={labelStyle}>Biography</label>
                <textarea
                    name="biography"
                    value={values.biography}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about this person..."
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,67,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {errors.biography && <p className="text-xs text-red-500 mt-1">{errors.biography}</p>}
            </div>

            {/* Is Root */}
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                <input
                    type="checkbox"
                    name="is_root"
                    checked={values.is_root}
                    onChange={handleChange}
                    id="is_root"
                    className="w-5 h-5 rounded"
                    style={{ accentColor: '#d4a843' }}
                />
                <label htmlFor="is_root" className="text-sm">
                    <span className="font-semibold" style={{ color: '#92400e' }}>Set as Root Member</span>
                    <span className="block text-xs" style={{ color: '#a16207' }}>
                        The root member is the starting point of the family tree. Only one member can be root at a time.
                    </span>
                </label>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #d4a843, #c49a3a)' }}
                    onMouseEnter={(e) => { if (!processing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    {processing ? 'Saving...' : mode === 'create' ? 'Create Member' : 'Update Member'}
                </button>
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                    style={{ border: '1px solid #e5e7eb' }}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
