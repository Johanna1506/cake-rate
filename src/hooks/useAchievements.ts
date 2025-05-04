import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "@services/auth";
import { UserAchievement } from "../types";

export const useUserAchievements = (userId?: string) => {
  return useQuery({
    queryKey: ["achievements", userId],
    queryFn: async () => {
      const query = auth.supabase
        .from("user_achievements")
        .select(
          `
                    *,
                    user:users(*),
                    season:seasons(*)
                `
        )
        .order("achieved_at", { ascending: false });

      if (userId) {
        query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!userId,
  });
};

export const useAddAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (achievement: {
      user_id: string;
      achievement_type: string;
      season_id: string;
    }) => {
      const { data, error } = await auth.supabase
        .from("user_achievements")
        .insert([achievement])
        .select()
        .single();

      if (error) throw error;
      return data as UserAchievement;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["achievements", data.user_id],
      });
    },
  });
};
