import { useQuery } from '@tanstack/react-query';
import { auth } from '@services/auth';
import { Week, Cake } from '../types';

export const useCurrentWeek = () => {
    return useQuery({
        queryKey: ['currentWeek'],
        queryFn: async () => {
            const { data, error } = await auth.supabase
                .from('weeks')
                .select('*')
                .eq('is_active', true)
                .single();

            if (error) throw error;
            return data as Week;
        },
    });
};

export const useWeekCake = (weekId?: string) => {
    return useQuery({
        queryKey: ['weekCake', weekId],
        queryFn: async () => {
            if (!weekId) return null;
            
            const { data, error } = await auth.supabase
                .from('cakes')
                .select('*')
                .eq('week_id', weekId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data as Cake | null;
        },
        enabled: !!weekId,
    });
}; 