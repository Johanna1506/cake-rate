export type UserRole = 'USER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: UserRole;
    created_at: string;
}

export interface Cake {
    id: string;
    name: string;
    description: string;
    image_url: string;
    created_at: string;
    user_id: string;
}

export interface CakeRating {
    id: string;
    cake_id: string;
    user_id: string;
    appearance: number;
    taste: number;
    theme_adherence: number;
    comment: string;
    created_at: string;
}

export interface Rating {
    id: string;
    cake_id: string;
    user_id: string;
    appearance: number;
    taste: number;
    theme_adherence: number;
    created_at: string;
}

export interface Week {
    id: string;
    theme: string;
    description: string;
    user_id?: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
} 