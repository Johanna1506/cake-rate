import { useState, useEffect } from "react";
import { useIsAdmin } from "@hooks/useAuthQuery";
import { useSeasons } from "@hooks/useSeasons";
import type { Season, Week } from "../../types";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { fr } from "date-fns/locale";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { supabaseServer } from "@lib/supabase";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}));

interface WeekFormData {
  description: string;
  startDate: Date;
  endDate: Date;
  userId: string | null;
  isActive: boolean;
  errors?: {
    description?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
}

interface SeasonManagerProps {
  isTabActive: boolean;
}

export function SeasonManager({ isTabActive }: SeasonManagerProps) {
  const theme = useTheme();
  const { seasons, loading: seasonsLoading, error: seasonsError, loadData, saveSeason, deleteSeason } = useSeasons();
  const isAdmin = useIsAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [seasonTheme, setTheme] = useState("");
  const [participantCount, setParticipantCount] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState<Season | null>(null);
  const [weeks, setWeeks] = useState<WeekFormData[]>([
    {
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      userId: null,
      isActive: true,
    },
  ]);
  const [users, setUsers] = useState<User[]>([]);
  const [formErrors, setFormErrors] = useState<{
    theme?: string;
    participantCount?: string;
    weeks?: WeekFormData[];
  }>({});

  useEffect(() => {
    if (isAdmin && isTabActive) {
      loadData();
      fetchUsers();
    }
  }, [isAdmin, loadData, isTabActive]);

  const handleOpenDialog = (season?: Season & { weeks?: Week[] }) => {
    if (season) {
      setIsEditing(true);
      setCurrentSeason(season);
      setTheme(season.theme);
      setParticipantCount(season.participant_count);
      setIsActive(season.is_active);
      if (season.weeks) {
        setWeeks(season.weeks.map((week) => ({
          description: week.description,
          startDate: new Date(week.start_date),
          endDate: new Date(week.end_date),
          userId: week.user_id || null,
          isActive: week.is_active,
        })));
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
          isActive: false,
        },
      ]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setError(null);
    setSuccess(null);
    setFormErrors({});
  };

  const handleOpenDeleteDialog = (season: Season) => {
    setSeasonToDelete(season);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSeasonToDelete(null);
    setError(null);
    setSuccess(null);
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
      console.error("Erreur lors du chargement des utilisateurs:", err);
    }
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(e.target.value);
    setFormErrors(prev => ({ ...prev, theme: undefined }));
  };

  const handleParticipantCountChange = (value: number) => {
    setParticipantCount(value);
    setFormErrors(prev => ({ ...prev, participantCount: undefined }));
    // Update weeks array based on participant count
    const currentWeeks = weeks.length;
    if (value > currentWeeks) {
      // Add new weeks
      const newWeeks = Array(value - currentWeeks).fill(null).map(() => ({
        description: "",
        startDate: new Date(),
        endDate: new Date(),
        userId: null,
        isActive: true,
      }));
      setWeeks([...weeks, ...newWeeks]);
    } else if (value < currentWeeks) {
      // Remove excess weeks
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
          userId: null,
          isActive: true,
        },
      ]);
    }
  };

  const handleRemoveWeek = (index: number) => {
    setWeeks(weeks.filter((_, i) => i !== index));
  };

  const handleWeekChange = (index: number, field: keyof WeekFormData, value: any) => {
    const newWeeks = [...weeks];
    newWeeks[index] = { ...newWeeks[index], [field]: value };
    setWeeks(newWeeks);

    setFormErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors.weeks?.[index]) {
        newErrors.weeks[index] = {
          ...newErrors.weeks[index],
          errors: {
            ...newErrors.weeks[index].errors,
            [field]: undefined
          }
        };
      }
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const errors: {
      theme?: string;
      participantCount?: string;
      weeks?: WeekFormData[];
    } = {};

    // Validation du thème
    if (!seasonTheme.trim()) {
      errors.theme = "Le thème de la saison est requis";
    }

    // Validation du nombre de participants
    if (participantCount < 1) {
      errors.participantCount = "Le nombre de participants doit être au moins de 1";
    }

    // Validation des semaines
    if (!isEditing) {
      const weekErrors: WeekFormData[] = weeks.map(week => ({
        ...week,
        errors: {}
      }));

      // Vérification des participants uniques
      const uniqueParticipants = new Set(weeks.map(week => week.userId));
      if (uniqueParticipants.size !== weeks.length) {
        weekErrors.forEach(week => {
          week.errors = { ...week.errors, userId: "Chaque participant ne peut être assigné qu'à une seule semaine" };
        });
      }

      // Validation de chaque semaine
      weeks.forEach((week, index) => {
        if (!week.startDate) {
          weekErrors[index].errors = { ...weekErrors[index].errors, startDate: "La date de début est requise" };
        }
        if (!week.endDate) {
          weekErrors[index].errors = { ...weekErrors[index].errors, endDate: "La date de fin est requise" };
        }
        if (week.startDate && week.endDate && week.startDate > week.endDate) {
          weekErrors[index].errors = { ...weekErrors[index].errors, endDate: "La date de fin doit être postérieure à la date de début" };
        }
        if (week.userId === null) {
          weekErrors[index].errors = { ...weekErrors[index].errors, userId: "Un participant doit être sélectionné" };
        }

        // Vérification des chevauchements
        for (let j = index + 1; j < weeks.length; j++) {
          const otherWeek = weeks[j];
          if (week.startDate && week.endDate && otherWeek.startDate && otherWeek.endDate &&
              week.startDate <= otherWeek.endDate && week.endDate >= otherWeek.startDate) {
            weekErrors[index].errors = { ...weekErrors[index].errors, startDate: "Les semaines ne peuvent pas se chevaucher" };
            weekErrors[j].errors = { ...weekErrors[j].errors, startDate: "Les semaines ne peuvent pas se chevaucher" };
          }
        }
      });

      if (weekErrors.some(week => Object.keys(week.errors || {}).length > 0)) {
        errors.weeks = weekErrors;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const seasonData: Omit<Season, "id"> = {
        theme: seasonTheme,
        participant_count: participantCount,
        is_active: isActive,
      };

      if (isEditing && currentSeason) {
        await saveSeason(seasonData, currentSeason.id, weeks.map(week => ({
          ...week,
          is_active: week.isActive,
        })));
        setSuccess("Saison mise à jour avec succès");
      } else {
        await saveSeason(seasonData, undefined, weeks.map(week => ({
          ...week,
          is_active: week.isActive,
        })));
        setSuccess("Saison et semaines créées avec succès");
      }
      await loadData();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'enregistrement");
      console.error("Erreur lors de l'enregistrement:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!seasonToDelete) return;

    try {
      setLoading(true);
      setError(null);
      await deleteSeason(seasonToDelete.id);
      await loadData();
      handleCloseDeleteDialog();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  if (seasonsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            [theme.breakpoints.up('sm')]: {
              mb: 4,
            },
          }}
        >
          <Typography variant="h5" component="h1" sx={{ [theme.breakpoints.up('sm')]: { variant: "h4" } }}>
            Gestion des saisons
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="small"
            sx={{
              [theme.breakpoints.up('sm')]: {
                size: "medium"
              }
            }}
          >
            Ajouter une saison
          </Button>
        </Box>

        {error || seasonsError && (
          <Alert severity="error" sx={{ mb: 2, [theme.breakpoints.up('sm')]: { mb: 3 } }}>
            {error || seasonsError}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, [theme.breakpoints.up('sm')]: { mb: 3 } }}>
            {success}
          </Alert>
        )}

        <StyledPaper>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : !seasons.length ? (
            <Box sx={{ textAlign: "center", py: 2, [theme.breakpoints.up('sm')]: { py: 4 } }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune saison n'a été créée
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Commencez par créer votre première saison de pâtisserie
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                size="small"
                sx={{
                  [theme.breakpoints.up('sm')]: {
                    size: "medium"
                  }
                }}
              >
                Créer une saison
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small" sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Thème</TableCell>
                    <TableCell>Participants</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seasons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Aucune saison n'a été créée. Cliquez sur "Ajouter une
                        saison" pour commencer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    seasons.map((season) => (
                      <TableRow key={season.id}>
                        <TableCell>{season.theme}</TableCell>
                        <TableCell>{season.participant_count}</TableCell>
                        <TableCell>
                          <Chip
                            label={season.is_active ? "Active" : "Inactive"}
                            color={season.is_active ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(season as Season & { weeks?: Week[] })}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(season)}
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
        fullScreen={window.innerWidth < 600}
      >
        <DialogTitle>
          {isEditing ? "Modifier la saison" : "Ajouter une saison"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, [theme.breakpoints.up('sm')]: { spacing: 3 } }}>
            <TextField
              label="Thème"
              fullWidth
              value={seasonTheme}
              onChange={handleThemeChange}
              helperText={formErrors.theme}
              error={!!formErrors.theme}
              required
              size="small"
              sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}
            />

            <TextField
              label="Nombre de participants"
              type="number"
              fullWidth
              value={participantCount}
              onChange={(e) => handleParticipantCountChange(parseInt(e.target.value))}
              inputProps={{ min: 1 }}
              helperText={formErrors.participantCount}
              error={!!formErrors.participantCount}
              required
              size="small"
              sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="primary"
                  size="small"
                  sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}
                />
              }
              label="Saison active"
            />

            {!isEditing && (
              <>
                <Typography variant="h6" sx={{ mt: 1, [theme.breakpoints.up('sm')]: { mt: 2 } }}>
                  Semaines
                </Typography>
                {weeks.map((week, index) => (
                  <Paper key={index} sx={{ p: 1, mb: 1, [theme.breakpoints.up('sm')]: { p: 2, mb: 2 } }}>
                    <Stack spacing={2} sx={{ [theme.breakpoints.up('sm')]: { spacing: 2 } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle1">
                          Semaine {index + 1}
                        </Typography>
                        {weeks.length > 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveWeek(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={week.description}
                        onChange={(e) => handleWeekChange(index, "description", e.target.value)}
                        error={!!formErrors.weeks?.[index]?.errors?.description}
                        helperText={formErrors.weeks?.[index]?.errors?.description}
                        size="small"
                        sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}
                      />

                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                        <Box sx={{ display: "flex", gap: 1, [theme.breakpoints.up('sm')]: { gap: 2 } }}>
                          <Box sx={{ flex: 1 }}>
                            <DatePicker
                              label="Date de début"
                              value={week.startDate}
                              onChange={(date) => handleWeekChange(index, "startDate", date)}
                              format="dd/MM/yyyy"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: "small",
                                  error: !!formErrors.weeks?.[index]?.errors?.startDate,
                                  helperText: formErrors.weeks?.[index]?.errors?.startDate
                                },
                              }}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <DatePicker
                              label="Date de fin"
                              value={week.endDate}
                              onChange={(date) => handleWeekChange(index, "endDate", date)}
                              format="dd/MM/yyyy"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: "small",
                                  error: !!formErrors.weeks?.[index]?.errors?.endDate,
                                  helperText: formErrors.weeks?.[index]?.errors?.endDate
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      </LocalizationProvider>

                      <FormControl
                        fullWidth
                        size="small"
                        error={!!formErrors.weeks?.[index]?.errors?.userId}
                        sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}
                      >
                        <InputLabel id={`user-select-label-${index}`}>
                          Participant
                        </InputLabel>
                        <Select
                          labelId={`user-select-label-${index}`}
                          value={week.userId || ""}
                          onChange={(e) => handleWeekChange(index, "userId", e.target.value)}
                          label="Participant"
                          size="small"
                          sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}
                        >
                          <MenuItem value="">
                            <em>Aucun</em>
                          </MenuItem>
                          {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.weeks?.[index]?.errors?.userId && (
                          <Typography color="error" variant="caption">
                            {formErrors.weeks[index].errors?.userId}
                          </Typography>
                        )}
                      </FormControl>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={week.isActive}
                            onChange={(e) => handleWeekChange(index, "isActive", e.target.checked)}
                            color="primary"
                            size="small"
                            sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}
                          />
                        }
                        label="Semaine active"
                      />
                    </Stack>
                  </Paper>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddWeek}
                  disabled={weeks.length >= participantCount}
                  size="small"
                  sx={{
                    mt: 1,
                    [theme.breakpoints.up('sm')]: {
                      mt: 2,
                      size: "medium"
                    }
                  }}
                >
                  Ajouter une semaine
                </Button>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CloseIcon />} size="small" sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
            disabled={loading}
            size="small"
            sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        fullScreen={window.innerWidth < 600}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette saison ? Cette action est
            irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} startIcon={<CloseIcon />} size="small" sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}>
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={loading}
            size="small"
            sx={{ [theme.breakpoints.up('sm')]: { size: "medium" } }}
          >
            {loading ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}