import { useQuery } from "@tanstack/react-query";
import { supabaseServer } from "@lib/supabase";
import { Week, Season } from "../types";

export function useCurrentSeason() {
  return useQuery({
    queryKey: ["currentSeason"],
    queryFn: async () => {
      const { data, error } = await supabaseServer
        .from("seasons")
        .select(
          `
                    *,
                    weeks:weeks(*, user:users(id,name,email, avatar_url))
                `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      console.log(data);
      if (error) throw error;
      return data as Season & { weeks: Week[] };
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
