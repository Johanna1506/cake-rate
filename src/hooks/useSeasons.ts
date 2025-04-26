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
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSeasons(data || []);
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

      // Si on active une nouvelle saison, désactiver la saison active existante
      if (seasonData.is_active) {
        const { error: deactivateError } = await supabaseServer
          .from("seasons")
          .update({ is_active: false })
          .eq("is_active", true)
          .neq("id", seasonId || ""); // Ne pas désactiver la saison qu'on est en train de modifier

        if (deactivateError) throw deactivateError;
      }

      let response;
      if (seasonId) {
        response = await supabaseServer
          .from("seasons")
          .update(seasonData)
          .eq("id", seasonId);
      } else {
        // Créer la saison
        const { data: season, error: seasonError } = await supabaseServer
          .from("seasons")
          .insert([seasonData])
          .select()
          .single();

        if (seasonError) throw seasonError;

        // Créer les semaines
        const weeksToCreate =
          weeks?.map((week) => ({
            season_id: season.id,
            description: week.description,
            start_date: week.startDate.toISOString(),
            end_date: week.endDate.toISOString(),
            is_active: false,
            show_scores: false,
            user_id: week.userId,
          })) ||
          Array.from({ length: seasonData.participant_count }, () => ({
            season_id: season.id,
            description: "",
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
            is_active: false,
            show_scores: false,
          }));

        console.log("Creating weeks:", weeksToCreate); // Debug log

        const { data: createdWeeks, error: weeksError } = await supabaseServer
          .from("weeks")
          .insert(weeksToCreate)
          .select();

        if (weeksError) {
          console.error("Error creating weeks:", weeksError);
          throw weeksError;
        }

        console.log("Created weeks:", createdWeeks); // Debug log

        response = season;
      }

      if (response.error) throw response.error;

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
