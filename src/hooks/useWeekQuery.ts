import { useQuery } from "@tanstack/react-query";
import { supabaseServer } from "@lib/supabase";
import { Week, Season } from "../types";

interface SeasonsData {
  currentSeason: (Season & { weeks: Week[] }) | null;
  lastCompletedSeason: (Season & { weeks: Week[] }) | null;
}

interface DatabaseWeek extends Omit<Week, "winner"> {
  winner?: Array<{
    user: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  }>;
}

interface DatabaseSeason
  extends Omit<Season, "weeks" | "achievements" | "winner"> {
  weeks?: DatabaseWeek[];
  winner?: Array<{
    user: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  }>;
  achievements?: Array<{
    id: string;
    user_id: string;
    achievement_type: string;
    season_id: string;
    achieved_at: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  }>;
}

export function useCurrentSeason() {
  return useQuery({
    queryKey: ["seasons"],
    queryFn: async () => {
      // Récupérer la saison active
      const { data: currentSeason, error: currentError } = await supabaseServer
        .from("seasons")
        .select(
          `
            *,
            weeks:weeks(
              *,
              user:users(id,name,email, avatar_url)
            ),
            winner:user_achievements(
              user:users(id, name, avatar_url)
            ),
            achievements:user_achievements(
              *,
              user:users(id, name, avatar_url)
            )
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (currentError) throw currentError;

      // Récupérer la dernière saison terminée avec des gagnants
      const { data: lastCompletedSeason, error: lastError } =
        await supabaseServer
          .from("seasons")
          .select(
            `
            *,
            weeks:weeks(
              *,
              user:users(id,name,email, avatar_url)
            ),
            winner:user_achievements(
              user:users(id, name, avatar_url)
            ),
            achievements:user_achievements(
              *,
              user:users(id, name, avatar_url)
            )
        `
          )
          .eq("is_active", false)
          .not("winner", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (lastError) throw lastError;

      // Transformer les données pour avoir une structure plus simple
      const transformSeason = (season: DatabaseSeason | null) => {
        if (!season) return null;

        // Transformer les semaines
        const transformedWeeks = season.weeks?.map((week) => ({
          ...week,
        }));

        // Transformer le gagnant
        const winner = season.winner?.find((w) => w.user)?.user;

        // Transformer les achievements en excluant le gagnant de la saison
        const achievements = season.achievements
          ?.filter(
            (achievement) => achievement.achievement_type !== "season_winner"
          )
          .map((achievement) => ({
            ...achievement,
            user: achievement.user,
          }));

        const transformedSeason = {
          ...season,
          weeks: transformedWeeks,
          winner,
          achievements,
        };

        return transformedSeason;
      };

      const result = {
        currentSeason: transformSeason(currentSeason),
        lastCompletedSeason: transformSeason(lastCompletedSeason),
      } as SeasonsData;

      return result;
    },
  });
}

export function useCurrentWeek() {
  return useQuery({
    queryKey: ["currentWeek"],
    queryFn: async () => {
      const { data, error } = await supabaseServer
        .from("weeks")
        .select(
          `
                    *,
                    season:seasons(*),
                    user:users(id,name,email)
                `
        )
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Week;
    },
  });
}

export function useWeekCake(weekId?: string) {
  return useQuery({
    queryKey: ["weekCake", weekId],
    queryFn: async () => {
      if (!weekId) return null;

      const { data, error } = await supabaseServer
        .from("cakes")
        .select(
          `
                    *,
                    week:weeks(*, season:seasons(*))
                `
        )
        .eq("week_id", weekId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!weekId,
  });
}
