import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import MemberForm from '@/Components/admin/MemberForm';

export default function Create() {
    return (
        <AdminLayout>
            <Head title="Add Family Member" />

            <div className="max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: '#1e3a5f' }}>Add Family Member</h1>
                    <p className="text-gray-500 mt-1">Fill in the details to add a new member to the family tree.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
                    <MemberForm mode="create" />
                </div>
            </div>
        </AdminLayout>
    );
}
