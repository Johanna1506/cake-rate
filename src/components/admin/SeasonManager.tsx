import { useState, useEffect } from "react";
import { useIsAdmin } from "@hooks/useAuthQuery";
import { useSeasons } from "@hooks/useSeasons";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { Box, Typography } from "@mui/material";
import { supabaseServer } from "@lib/supabase";
import { SeasonList } from "./seasons/SeasonList";
import { SeasonForm } from "./seasons/SeasonForm";
import { DeleteSeasonDialog } from "./seasons/DeleteSeasonDialog";
import type { Season, Week, WeekFormData, User } from "@/types";

interface SeasonManagerProps {
  isTabActive: boolean;
}

export function SeasonManager({ isTabActive }: SeasonManagerProps) {
  const {
    seasons,
    loading: seasonsLoading,
    error: seasonsError,
    loadData,
    saveSeason,
    deleteSeason,
  } = useSeasons();
  const isAdmin = useIsAdmin();
  const { handleError, handleSuccess } = useErrorHandler();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [seasonTheme, setTheme] = useState("");
  const [participantCount, setParticipantCount] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState<Season | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [formErrors, setFormErrors] = useState<{
    theme?: string;
    participantCount?: string;
    weeks?: WeekFormData[];
  }>({});

  const [weeks, setWeeks] = useState<WeekFormData[]>([
    {
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      userId: null,
      isActive: true,
    },
  ]);

  useEffect(() => {
    if (isAdmin && isTabActive) {
      loadData();
      fetchUsers();
    }
  }, [isAdmin, loadData, isTabActive]);

  useEffect(() => {
    if (users.length > 0 && weeks.length > 0 && weeks[0].userId === null) {
      setWeeks((prevWeeks) =>
        prevWeeks.map((week) => ({
          ...week,
          userId: users[0].id,
        }))
      );
    }
  }, [users]);

  const handleOpenDialog = (season?: Season & { weeks?: Week[] }) => {
    if (season) {
      setIsEditing(true);
      setCurrentSeason(season);
      setTheme(season.theme);
      setParticipantCount(season.participant_count);
      setIsActive(season.is_active);
      if (season.weeks) {
        setWeeks(
          season.weeks.map((week) => ({
            description: week.description,
            startDate: new Date(week.start_date),
            endDate: new Date(week.end_date),
            userId: week.user_id || null,
            isActive: week.is_active,
          }))
        );
      }
    } else {
      setIsEditing(false);
      setCurrentSeason(null);
      setTheme("");
      setParticipantCount(1);
      setIsActive(false);
      setWeeks([
        {
          description: "",
          startDate: new Date(),
          endDate: new Date(),
          userId: null,
          isActive: true,
        },
      ]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormErrors({});
  };

  const handleOpenDeleteDialog = (season: Season) => {
    setSeasonToDelete(season);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSeasonToDelete(null);
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabaseServer
        .from("users")
        .select("*")
        .order("name");

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      handleError(err);
    }
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(e.target.value);
    setFormErrors((prev) => ({ ...prev, theme: undefined }));
  };

  const handleParticipantCountChange = (value: number) => {
    setParticipantCount(value);
    setFormErrors((prev) => ({ ...prev, participantCount: undefined }));
    const currentWeeks = weeks.length;
    if (value > currentWeeks) {
      const newWeeks = Array(value - currentWeeks)
        .fill(null)
        .map((_, index) => ({
          description: "",
          startDate: new Date(),
          endDate: new Date(),
          userId: null,
          isActive: currentWeeks === 0 && index === 0,
        }));
      setWeeks([...weeks, ...newWeeks]);
    } else if (value < currentWeeks) {
      setWeeks(weeks.slice(0, value));
    }
  };

  const handleAddWeek = () => {
    if (weeks.length < participantCount) {
      setWeeks([
        ...weeks,
        {
          description: "",
          startDate: new Date(),
          endDate: new Date(),
          userId: users.length > 0 ? users[0].id : null,
          isActive: weeks.length === 0,
        },
      ]);
    }
  };

  const handleRemoveWeek = (index: number) => {
    setWeeks(weeks.filter((_, i) => i !== index));
  };

  const handleWeekChange = (
    index: number,
    field: keyof WeekFormData,
    value: string | Date | boolean | null
  ) => {
    const newWeeks = [...weeks];
    newWeeks[index] = { ...newWeeks[index], [field]: value };
    setWeeks(newWeeks);

    setFormErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors.weeks?.[index]) {
        newErrors.weeks[index] = {
          ...newErrors.weeks[index],
          errors: {
            ...newErrors.weeks[index].errors,
            [field]: undefined,
          },
        };
      }
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const errors: typeof formErrors = {};

    if (!seasonTheme.trim()) {
      errors.theme = "Le thème est requis";
      isValid = false;
    } else if (seasonTheme.length < 3) {
      errors.theme = "Le thème doit contenir au moins 3 caractères";
      isValid = false;
    }

    if (participantCount < 1) {
      errors.participantCount =
        "Le nombre de participants doit être au moins 1";
      isValid = false;
    }

    if (!isEditing) {
      const weekErrors = weeks.map((week) => {
        const weekError: WeekFormData["errors"] = {};

        if (!week.startDate) {
          weekError.startDate = "La date de début est requise";
          isValid = false;
        }

        if (!week.endDate) {
          weekError.endDate = "La date de fin est requise";
          isValid = false;
        }

        if (week.startDate && week.endDate && week.startDate > week.endDate) {
          weekError.endDate =
            "La date de fin doit être postérieure à la date de début";
          isValid = false;
        }

        if (!week.userId) {
          weekError.userId = "Un participant doit être sélectionné";
          isValid = false;
        }

        return { ...week, errors: weekError };
      });

      if (
        weekErrors.some((week) => Object.keys(week.errors || {}).length > 0)
      ) {
        errors.weeks = weekErrors;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const seasonData: Omit<Season, "id"> = {
        theme: seasonTheme,
        participant_count: participantCount,
        is_active: isActive,
      };

      if (isEditing && currentSeason) {
        await saveSeason(seasonData, currentSeason.id);
        handleSuccess("Saison mise à jour avec succès");
      } else {
        await saveSeason(seasonData, undefined, weeks);
        handleSuccess("Saison créée avec succès");
      }

      handleCloseDialog();
      loadData();
    } catch (err) {
      handleError(err);
    }
  };

  const handleDelete = async () => {
    if (!seasonToDelete) return;

    try {
      await deleteSeason(seasonToDelete.id);
      handleSuccess("Saison supprimée avec succès");
      handleCloseDeleteDialog();
      loadData();
    } catch (err) {
      handleError(err);
    }
  };

  const handleCloseSeason = async (season: Season) => {
    try {
      const { error } = await supabaseServer
        .from("seasons")
        .update({ is_active: false })
        .eq("id", season.id);

      if (error) throw error;
      handleSuccess(
        "Saison clôturée avec succès. Le vainqueur sera calculé automatiquement."
      );
      loadData();
    } catch (err) {
      handleError(err);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Accès non autorisé
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <SeasonList
        seasons={seasons}
        loading={seasonsLoading}
        error={seasonsError}
        onAddSeason={() => handleOpenDialog()}
        onEditSeason={handleOpenDialog}
        onDeleteSeason={handleOpenDeleteDialog}
        onCloseSeason={handleCloseSeason}
      />

      <SeasonForm
        open={dialogOpen}
        isEditing={isEditing}
        season={currentSeason}
        seasonTheme={seasonTheme}
        participantCount={participantCount}
        isActive={isActive}
        weeks={weeks}
        users={users}
        formErrors={formErrors}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        onThemeChange={handleThemeChange}
        onParticipantCountChange={handleParticipantCountChange}
        onActiveChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setIsActive(e.target.checked)
        }
        onWeekChange={handleWeekChange}
        onAddWeek={handleAddWeek}
        onRemoveWeek={handleRemoveWeek}
      />

      <DeleteSeasonDialog
        open={deleteDialogOpen}
        season={seasonToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
}
