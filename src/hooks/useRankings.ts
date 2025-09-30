import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export interface UserRanking {
  user: User;
  averageScore: number;
  totalCakes: number;
  totalRatings: number;
}

export function useSeasonRanking(seasonId?: string) {
  return useQuery({
    queryKey: ['seasonRanking', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];

      const { data, error } = await supabase
        .from('ratings')
        .select(`
          appearance,
          taste,
          theme_adherence,
          cake_id,
          cakes!inner(
            user_id,
            users!inner(
              id,
              name,
              email,
              avatar_url,
              role,
              created_at
            ),
            weeks!inner(
              season_id,
              show_scores
            )
          )
        `)
        .eq('cakes.weeks.season_id', seasonId)
        .eq('cakes.weeks.show_scores', true);

      if (error) throw error;

      const userStats = new Map<string, {
        user: User;
        scores: number[];
        cakeId: string;
      }>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.forEach((rating: any) => {
        const cake = rating.cakes;
        const user = cake.users;
        const normalizedAppearance = (rating.appearance / 2.5) * 5;
        const normalizedTaste = rating.taste;
        const normalizedTheme = (rating.theme_adherence / 2.5) * 5;
        const avgRating = (normalizedAppearance + normalizedTaste + normalizedTheme) / 3;

        if (!userStats.has(user.id)) {
          userStats.set(user.id, {
            user: user as User,
            scores: [],
            cakeId: rating.cake_id,
          });
        }

        const stats = userStats.get(user.id)!;
        stats.scores.push(avgRating);
      });

      const rankingData: UserRanking[] = Array.from(userStats.entries()).map(([, stats]) => ({
        user: stats.user,
        averageScore: stats.scores.length > 0 ? stats.scores.reduce((a, b) => a + b) / stats.scores.length : 0,
        totalCakes: 1,
        totalRatings: stats.scores.length,
      }));

      rankingData.sort((a, b) => {
        if (Math.abs(a.averageScore - b.averageScore) < 0.01) {
          return b.totalRatings - a.totalRatings;
        }
        return b.averageScore - a.averageScore;
      });

      return rankingData.slice(0, 3);
    },
    enabled: !!seasonId,
  });
}
