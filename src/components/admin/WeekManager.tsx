import { useState, useEffect, useCallback } from "react";
import { useHasRole } from "@hooks/useAuthQuery";
import { supabase } from "@lib/supabaseClient";
import { Week, User } from "../../types";
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
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { Navigate } from "react-router-dom";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

export function WeekManager() {
  const isAdmin = useHasRole("ADMIN");
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // État pour le formulaire d'ajout/édition
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isActive, setIsActive] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // État pour la confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState<Week | null>(null);

  const fetchWeeks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("weeks")
        .select(
          `
                    *,
                    user:users(id, name, email)
                `
        )
        .order("start_date", { ascending: false });

      if (error) throw error;
      setWeeks(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des semaines:", err);
      setError("Erreur lors du chargement des semaines");
      throw err;
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("name");

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      throw err;
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchWeeks(), fetchUsers()]);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, fetchWeeks, fetchUsers]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (week?: Week) => {
    if (week) {
      // Mode édition
      setIsEditing(true);
      setCurrentWeek(week);
      setTheme(week.theme);
      setDescription(week.description || "");
      setStartDate(parseISO(week.start_date));
      setEndDate(parseISO(week.end_date));
      setIsActive(week.is_active);
      setShowScores(week.show_scores);
      setSelectedUserId(week.user_id || null);
    } else {
      // Mode ajout
      setIsEditing(false);
      setCurrentWeek(null);
      setTheme("");
      setDescription("");
      setStartDate(new Date());
      setEndDate(new Date());
      setIsActive(false);
      setShowScores(false);
      setSelectedUserId(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
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
    if (!theme.trim()) {
      setError("Le thème est obligatoire");
      return false;
    }
    if (!startDate || !endDate) {
      setError("Les dates de début et de fin sont obligatoires");
      return false;
    }
    if (startDate > endDate) {
      setError("La date de début doit être antérieure à la date de fin");
      return false;
    }
    return true;
  };

  const handleSaveWeek = async () => {
    if (!validateForm()) return;

    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const weekData = {
        theme,
        description,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
        is_active: isActive,
        show_scores: showScores,
        user_id: selectedUserId,
      };

      let response;
      if (isEditing && currentWeek) {
        response = await supabase
          .from("weeks")
          .update(weekData)
          .eq("id", currentWeek.id);
      } else {
        response = await supabase.from("weeks").insert([weekData]);
      }

      if (response.error) throw response.error;

      setSuccess(
        isEditing
          ? "Semaine mise à jour avec succès"
          : "Semaine ajoutée avec succès"
      );
      handleCloseDialog();
      fetchWeeks();
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement de la semaine:", err);
      setError(err.message || "Erreur lors de l'enregistrement de la semaine");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeek = async () => {
    if (!weekToDelete) return;

    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const { error } = await supabase
        .from("weeks")
        .delete()
        .eq("id", weekToDelete.id);

      if (error) throw error;

      setSuccess("Semaine supprimée avec succès");
      handleCloseDeleteDialog();
      fetchWeeks();
    } catch (err) {
      console.error("Erreur lors de la suppression de la semaine:", err);
      setError("Erreur lors de la suppression de la semaine");
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter une semaine
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
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
                    <TableCell>Thème</TableCell>
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
                      <TableCell colSpan={6} align="center">
                        Aucune semaine n'a été créée. Cliquez sur "Ajouter une
                        semaine" pour commencer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    weeks.map((week) => (
                      <TableRow key={week.id}>
                        <TableCell>{week.theme}</TableCell>
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

      {/* Dialogue d'ajout/édition */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Modifier la semaine" : "Ajouter une semaine"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Thème"
              fullWidth
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              helperText="Thème de la semaine de pâtisserie"
              required
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="Description détaillée du thème et des contraintes"
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
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer la semaine "{weekToDelete?.theme}
            " ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Annuler
          </Button>
          <Button
            onClick={handleDeleteWeek}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
