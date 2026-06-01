import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import FamilyTree from '@/Components/tree/FamilyTree';

export default function Home() {
    return (
        <PublicLayout>
            <Head title="Family Tree" />
            <FamilyTree className="w-full" />
        </PublicLayout>
    );
}
