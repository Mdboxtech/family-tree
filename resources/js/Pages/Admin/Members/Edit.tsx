import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import MemberForm from '@/Components/admin/MemberForm';
import RelationshipManager from '@/Components/admin/RelationshipManager';
import { FamilyMember, RelationshipDisplay } from '@/types/family';

interface EditProps {
    member: FamilyMember;
    allMembers: Array<{ id: number; full_name: string; gender: string; photo_url?: string | null }>;
    relationships: RelationshipDisplay[];
}

export default function Edit({ member, allMembers, relationships }: EditProps) {
    return (
        <AdminLayout>
            <Head title={`Edit ${member.full_name}`} />

            <div className="max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: '#1e3a5f' }}>
                        Edit Member
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Editing <strong>{member.full_name}</strong>
                    </p>
                </div>

                {/* Member Form */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 mb-6">
                    <MemberForm member={member} mode="edit" />
                </div>

                {/* Relationship Manager */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
                    <RelationshipManager
                        memberId={member.id}
                        relationships={relationships}
                        allMembers={allMembers}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
