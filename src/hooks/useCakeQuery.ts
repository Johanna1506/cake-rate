import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '@services/auth';
import { Cake, CakeRating } from '../types';
import { useSession } from '@hooks/useAuthQuery';

export const useCakes = () => {
    return useQuery({
        queryKey: ['cakes'],
        queryFn: async () => {
            const { data, error } = await auth.supabase
                .from('cakes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Cake[];
        },
    });
};

export const useCake = (cakeId?: string) => {
    return useQuery({
        queryKey: ['cake', cakeId],
        queryFn: async () => {
            if (!cakeId) return null;

            const { data, error } = await auth.supabase
                .from('cakes')
                .select(`
                    *,
                    week:weeks(*),
                    user:users(name, avatar_url)
                `)
                .eq('id', cakeId)
                .maybeSingle();

            if (error) throw error;
            return data as Cake | null;
        },
        enabled: !!cakeId,
    });
};

export const useCakeRatings = (cakeId?: string) => {
    return useQuery({
        queryKey: ['ratings', cakeId],
        queryFn: async () => {
            if (!cakeId) return [];

            const { data, error } = await auth.supabase
                .from('ratings')
                .select('*')
                .eq('cake_id', cakeId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as CakeRating[];
        },
        enabled: !!cakeId,
    });
};

export const useUploadCake = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const { data, error } = await auth.supabase
                .from('cakes')
                .insert([{
                    name: formData.get('name'),
                    description: formData.get('description'),
                    image_url: formData.get('image_url'),
                }])
                .select()
                .single();

            if (error) throw error;
            return data as Cake;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cakes'] });
        },
    });
};

export const useRateCake = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: async ({ cakeId, rating }: { cakeId: string; rating: Omit<CakeRating, 'id' | 'created_at' | 'user_id'> }) => {
            if (!session?.session?.user?.id) {
                throw new Error('Vous devez être connecté pour noter un gâteau');
            }

            const { data, error } = await auth.supabase
                .from('ratings')
                .upsert([{
                    cake_id: cakeId,
                    user_id: session.session.user.id,
                    appearance: rating.appearance,
                    taste: rating.taste,
                    theme_adherence: rating.theme_adherence,
                    comment: rating.comment,
                }], {
                    onConflict: 'cake_id,user_id'
                })
                .select()
                .single();

            if (error) throw error;
            return data as CakeRating;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ratings', data.cake_id] });
            queryClient.invalidateQueries({ queryKey: ['cake', data.cake_id] });
        },
    });
};