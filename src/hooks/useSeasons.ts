import { useState, useCallback } from "react";
import { supabaseServer } from "@lib/supabase";
import { Season } from "../types";

interface WeekFormData {
  description: string;
  startDate: Date;
  endDate: Date;
  userId: string | null;
  isActive: boolean;
}

export function useSeasons() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasSeasons, setHasSeasons] = useState(false);

  const fetchSeasons = useCallback(async () => {
    try {
      const { data, error } = await supabaseServer
        .from("seasons")
        .select(
          `
          *,
          winner:user_achievements(
            user:users(id, name, avatar_url)
          ),
          weeks:weeks(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transformer les données pour avoir une structure plus simple
      const transformedData = (data || []).map((season) => ({
        ...season,
        winner: season.winner?.[0]?.user,
      }));

      setSeasons(transformedData);
      setHasSeasons(!!data && data.length > 0);
    } catch (err) {
      console.error("Erreur lors du chargement des saisons:", err);
      setError("Erreur lors du chargement des saisons");
      setHasSeasons(false);
      throw err;
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchSeasons();
    } catch (err) {
      if (err instanceof Error && err.message.includes("no rows")) {
        setSeasons([]);
        setHasSeasons(false);
      } else {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données");
        setHasSeasons(false);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchSeasons]);

  const saveSeason = async (
    seasonData: Omit<Season, "id">,
    seasonId?: string,
    weeks?: WeekFormData[]
  ) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      let response;
      if (seasonId) {
        response = await supabaseServer
          .from("seasons")
          .update(seasonData)
          .eq("id", seasonId);
      } else {
        // Créer la saison
        console.log(seasonData);
        const { data: season, error: seasonError } = await supabaseServer
          .from("seasons")
          .insert([seasonData])
          .select()
          .single();

        if (seasonError) throw seasonError;
        if (!season) throw new Error("La création de la saison a échoué");

        // Créer les semaines
        const weeksToCreate =
          weeks?.map((week, index) => ({
            season_id: season.id,
            description: week.description,
            start_date: week.startDate.toISOString(),
            end_date: week.endDate.toISOString(),
            is_active: index === 0, // Première semaine active, les autres inactives
            show_scores: false,
            user_id: week.userId || null,
          })) ||
          Array.from({ length: seasonData.participant_count }, (_, index) => ({
            season_id: season.id,
            description: "",
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
            is_active: index === 0, // Première semaine active, les autres inactives
            show_scores: false,
            user_id: null,
          }));

        const { data: createdWeeks, error: weeksError } = await supabaseServer
          .from("weeks")
          .insert(weeksToCreate)
          .select();

        if (weeksError) throw weeksError;
        if (!createdWeeks || createdWeeks.length === 0) {
          throw new Error("La création des semaines a échoué");
        }

        response = { data: season, error: null };
      }

      if (response.error) throw response.error;
      if (!response.data) throw new Error("La réponse est invalide");

      setSuccess(
        seasonId
          ? "Saison mise à jour avec succès"
          : "Saison et semaines créées avec succès"
      );
      await fetchSeasons();
      return true;
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de la saison:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement de la saison"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSeason = async (seasonId: string) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const { error } = await supabaseServer
        .from("seasons")
        .delete()
        .eq("id", seasonId);

      if (error) throw error;

      setSuccess("Saison supprimée avec succès");
      await fetchSeasons();
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression de la saison:", err);
      setError("Erreur lors de la suppression de la saison");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    seasons,
    loading,
    error,
    success,
    hasSeasons,
    loadData,
    saveSeason,
    deleteSeason,
  };
}
