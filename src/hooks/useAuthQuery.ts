import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '@services/auth';
import { User } from '../types';

// Hook pour récupérer la session
export const useSession = () => {
    return useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data, error } = await auth.supabase.auth.getSession();
            if (error) throw error;
            return { session: data.session };
        },
    });
};

// Hook pour récupérer les détails de l'utilisateur
export const useUserDetails = (userId?: string) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            if (!userId) return null;
            
            const { data, error } = await auth.supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;
            return data as User | null;
        },
        enabled: !!userId,
    });
};

// Hook pour la connexion
export function useSignIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            const { data, error } = await auth.supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return { session: data.session };
        },
        onSuccess: async (data) => {
            // Mettre à jour la session
            queryClient.setQueryData(['session'], data);
            
            // Vérifier si l'utilisateur existe dans la table users
            if (data.session?.user?.id) {
                const { data: userData, error: userError } = await auth.supabase
                    .from('users')
                    .select('*')
                    .eq('id', data.session.user.id)
                    .maybeSingle();

                if (userError) throw userError;

                // Si l'utilisateur n'existe pas, le créer
                if (!userData) {
                    const { data: newUser, error: createError } = await auth.supabase
                        .from('users')
                        .insert([{
                            id: data.session.user.id,
                            email: data.session.user.email,
                            name: data.session.user.user_metadata.name || '',
                            role: 'USER'
                        }])
                        .select()
                        .single();

                    if (createError) throw createError;
                    queryClient.setQueryData(['user', data.session.user.id], newUser);
                } else {
                    queryClient.setQueryData(['user', data.session.user.id], userData);
                }
            }
        },
    });
}

// Hook pour la déconnexion
export function useSignOut() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { error } = await auth.supabase.auth.signOut();
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['session'] });
            queryClient.removeQueries({ queryKey: ['user'] });
        },
    });
}

// Hook pour l'inscription
export function useSignUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
            const { data, error } = await auth.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                    },
                },
            });
            if (error) throw error;
            return { session: data.session };
        },
        onSuccess: async (data) => {
            if (data.session) {
                queryClient.setQueryData(['session'], data);
                
                if (data.session.user?.id) {
                    // Attendre un court instant pour laisser le trigger créer l'utilisateur
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const { data: userData, error: userError } = await auth.supabase
                        .from('users')
                        .select('*')
                        .eq('id', data.session.user.id)
                        .single();

                    if (userError) throw userError;
                    queryClient.setQueryData(['user', data.session.user.id], userData);
                }
            }
        },
    });
}

// Hook pour mettre à jour les informations de l'utilisateur
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, name, avatar_url }: { id: string; name: string; avatar_url?: string | null }) => {
            const { error } = await auth.supabase
                .from('users')
                .update({ name, avatar_url })
                .eq('id', id);

            if (error) throw error;

            return { id, name, avatar_url };
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['user', data.id], (oldData: any) => ({
                ...oldData,
                name: data.name,
                avatar_url: data.avatar_url
            }));
        },
    });
}

// Hook utilitaire pour vérifier le rôle de l'utilisateur
export const useHasRole = (role: string) => {
    const { data: session } = useSession();
    const { data: userDetails } = useUserDetails(session?.session?.user?.id);

    return userDetails?.role === role;
};

// Hook utilitaire pour vérifier si l'utilisateur est admin
export function useIsAdmin() {
    return useHasRole('ADMIN');
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            if (!session?.session?.user?.id) {
                throw new Error('Vous devez être connecté pour mettre à jour votre profil');
            }

            const { data, error } = await auth.supabase
                .from('users')
                .update({
                    name: formData.get('name'),
                    avatar_url: formData.get('avatar_url'),
                })
                .eq('id', session.session.user.id)
                .select()
                .single();

            if (error) throw error;
            return data as User;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['user', data.id] });
        },
    });
}; 