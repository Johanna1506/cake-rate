import { useState, useEffect, useCallback } from "react";
import { useHasRole } from "@hooks/useAuthQuery";
import { supabaseServer } from "@lib/supabase";
import { Week, User, Season } from "../../types";
import { useErrorHandler } from "@hooks/useErrorHandler";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  FormControlLabel,
  Switch,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { Navigate } from "react-router-dom";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

interface WeekManagerProps {
  isTabActive: boolean;
}

interface WeekFormErrors {
  description?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  seasonId?: string;
}

export function WeekManager({ isTabActive }: WeekManagerProps) {
  const isAdmin = useHasRole("ADMIN");
  const { handleError, handleSuccess } = useErrorHandler();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<WeekFormErrors>({});

  // État pour le formulaire d'édition
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isActive, setIsActive] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // État pour la confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState<Week | null>(null);

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const fetchWeeks = useCallback(async () => {
    try {
      const { data, error } = await supabaseServer
        .from("weeks")
        .select(
          `
                    *,
                    user:users(id, name, email),
                    season:seasons(id, theme)
                `
        )
        .order("start_date", { ascending: false });

      if (error) throw error;
      setWeeks(data || []);
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabaseServer
        .from("users")
        .select("*")
        .order("name");

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  const fetchSeasons = useCallback(async () => {
    try {
      const { data, error } = await supabaseServer
        .from("seasons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSeasons(data || []);
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  const loadData = useCallback(async () => {
    if (!isAdmin || !isTabActive) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      await Promise.all([fetchWeeks(), fetchUsers(), fetchSeasons()]);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, fetchWeeks, fetchUsers, fetchSeasons, isTabActive, handleError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (week: Week) => {
    setCurrentWeek(week);
    setDescription(week.description || "");
    setStartDate(parseISO(week.start_date));
    setEndDate(parseISO(week.end_date));
    setIsActive(week.is_active);
    setShowScores(week.show_scores);
    setSelectedUserId(week.user_id || null);
    setSelectedSeasonId(week.season_id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormErrors({});
  };

  const handleOpenDeleteDialog = (week: Week) => {
    setWeekToDelete(week);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setWeekToDelete(null);
  };

  const validateForm = () => {
    const errors: WeekFormErrors = {};
    let isValid = true;

    if (!description.trim()) {
      errors.description = "La description est requise";
      isValid = false;
    }

    if (!startDate) {
      errors.startDate = "La date de début est requise";
      isValid = false;
    }

    if (!endDate) {
      errors.endDate = "La date de fin est requise";
      isValid = false;
    }

    if (startDate && endDate && startDate > endDate) {
      errors.endDate = "La date de fin doit être postérieure à la date de début";
      isValid = false;
    }

    if (isActive && !selectedUserId) {
      errors.userId = "Un participant doit être sélectionné pour une semaine active";
      isValid = false;
    }

    if (!selectedSeasonId) {
      errors.seasonId = "Une saison doit être sélectionnée";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSaveWeek = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const weekData = {
        description,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
        is_active: isActive,
        show_scores: showScores,
        user_id: selectedUserId,
        season_id: selectedSeasonId,
      };

      if (currentWeek) {
        const { error } = await supabaseServer
          .from("weeks")
          .update(weekData)
          .eq("id", currentWeek.id);

        if (error) throw error;
        handleSuccess("Semaine mise à jour avec succès");
      } else {
        const { error } = await supabaseServer
          .from("weeks")
          .insert(weekData);

        if (error) throw error;
        handleSuccess("Semaine créée avec succès");
      }

      handleCloseDialog();
      await fetchWeeks();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeek = async () => {
    if (!weekToDelete) return;

    try {
      setLoading(true);

      const { error } = await supabaseServer
        .from("weeks")
        .delete()
        .eq("id", weekToDelete.id);

      if (error) throw error;
      handleSuccess("Semaine supprimée avec succès");
      handleCloseDeleteDialog();
      await fetchWeeks();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1">
            Gestion des semaines
          </Typography>
        </Box>

        {formErrors.description && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formErrors.description}
          </Alert>
        )}

        {formErrors.startDate && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formErrors.startDate}
          </Alert>
        )}

        {formErrors.endDate && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formErrors.endDate}
          </Alert>
        )}

        {formErrors.userId && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formErrors.userId}
          </Alert>
        )}

        {formErrors.seasonId && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formErrors.seasonId}
          </Alert>
        )}

        <StyledPaper>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Saison</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Participant</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weeks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Aucune semaine n'a été créée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    weeks.map((week) => (
                      <TableRow key={week.id}>
                        <TableCell>
                          {week.season ? (
                            week.season.theme
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontStyle="italic"
                            >
                              Pas de saison
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {format(parseISO(week.start_date), "dd/MM/yyyy", {
                            locale: fr,
                          })}
                          {" au "}
                          {format(parseISO(week.end_date), "dd/MM/yyyy", {
                            locale: fr,
                          })}
                        </TableCell>
                        <TableCell>
                          {week.description ? (
                            week.description.length > 50 ? (
                              `${week.description.substring(0, 50)}...`
                            ) : (
                              week.description
                            )
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontStyle="italic"
                            >
                              Pas de description
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {week.user ? (
                            week.user.name
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontStyle="italic"
                            >
                              Non assigné
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={week.is_active ? "Active" : "Inactive"}
                            color={week.is_active ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(week)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(week)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </StyledPaper>
      </Box>

      {/* Dialogue d'édition */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Modifier la semaine</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="season-select-label">Saison</InputLabel>
              <Select
                labelId="season-select-label"
                value={selectedSeasonId || ""}
                onChange={(e) => setSelectedSeasonId(e.target.value || null)}
                label="Saison"
                required
                disabled
              >
                {selectedSeasonId && (
                  <MenuItem value={selectedSeasonId}>
                    {seasons.find(s => s.id === selectedSeasonId)?.theme}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              label="Thème"
              fullWidth
              value={seasons.find(s => s.id === selectedSeasonId)?.theme || ""}
              disabled
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="Description détaillée de la semaine"
            />

            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={fr}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    label="Date de début"
                    value={startDate}
                    onChange={setStartDate}
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: { fullWidth: true },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    label="Date de fin"
                    value={endDate}
                    onChange={setEndDate}
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: { fullWidth: true },
                    }}
                  />
                </Box>
              </Box>
            </LocalizationProvider>

            <FormControl fullWidth>
              <InputLabel id="user-select-label">
                Participant assigné
              </InputLabel>
              <Select
                labelId="user-select-label"
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                label="Participant assigné"
              >
                <MenuItem value="">
                  <em>Aucun</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Semaine active"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showScores}
                  onChange={(e) => setShowScores(e.target.checked)}
                  color="primary"
                />
              }
              label="Afficher les scores"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CloseIcon />}>
            Annuler
          </Button>
          <Button
            onClick={handleSaveWeek}
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette semaine ? Cette action est
            irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} startIcon={<CloseIcon />}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteWeek}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={loading}
          >
            {loading ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
