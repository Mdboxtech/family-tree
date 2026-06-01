export interface FamilyMember {
    id: number;
    first_name: string;
    last_name: string;
    maiden_name?: string | null;
    gender: 'male' | 'female' | 'other';
    date_of_birth?: string | null;
    date_of_death?: string | null;
    birth_place?: string | null;
    biography?: string | null;
    photo_url?: string | null;
    full_name: string;
    age?: number | null;
    is_root: boolean;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    occupation?: string | null;
}

export interface Relationship {
    id: number;
    person_id: number;
    relative_id: number;
    type: 'parent' | 'child' | 'spouse' | 'sibling';
    marriage_date?: string | null;
    divorce_date?: string | null;
    is_biological: boolean;
}

export interface TreeNode {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    gender: 'male' | 'female' | 'other';
    birth_year?: number | null;
    death_year?: number | null;
    photo_url?: string | null;
    is_root: boolean;
    children?: TreeNode[];
    spouses?: SpouseNode[];
}

export interface SpouseNode {
    id: number;
    name: string;
    gender: 'male' | 'female' | 'other';
    photo_url?: string | null;
    birth_year?: number | null;
    death_year?: number | null;
    marriage_date?: string | null;
}

export interface TreeLink {
    source: number;
    target: number;
    type: 'parent' | 'child' | 'spouse' | 'sibling';
}

export interface TreeData {
    nodes: TreeNode[];
    links: TreeLink[];
}

export interface MemberWithRelatives {
    member: FamilyMember;
    parents: FamilyMember[];
    spouses: Array<FamilyMember & { marriage_date?: string; divorce_date?: string }>;
    children: FamilyMember[];
    siblings: FamilyMember[];
}

export interface RelationshipDisplay {
    id: number;
    relative_id: number;
    relative_name: string;
    relative_gender: string;
    relative_photo_url?: string | null;
    type: string;
    marriage_date?: string | null;
    divorce_date?: string | null;
    is_biological: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}
