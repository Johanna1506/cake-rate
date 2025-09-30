import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Avatar,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import type { SeasonListProps } from "./types";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}));

export function SeasonList({
  seasons,
  loading,
  error,
  onAddSeason,
  onEditSeason,
  onDeleteSeason,
  onCloseSeason,
}: SeasonListProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          [theme.breakpoints.up("sm")]: {
            mb: 4,
          },
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ [theme.breakpoints.up("sm")]: { variant: "h4" } }}
        >
          Gestion des saisons
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddSeason}
          size="small"
          sx={{
            [theme.breakpoints.up("sm")]: {
              size: "medium",
            },
          }}
        >
          Ajouter une saison
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, [theme.breakpoints.up("sm")]: { mb: 3 } }}
        >
          {error}
        </Alert>
      )}

      <StyledPaper>
        {!seasons.length ? (
          <Box
            sx={{
              textAlign: "center",
              py: 2,
              [theme.breakpoints.up("sm")]: { py: 4 },
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune saison n'a été créée
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Commencez par créer votre première saison de pâtisserie
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddSeason}
              size="small"
              sx={{
                [theme.breakpoints.up("sm")]: {
                  size: "medium",
                },
              }}
            >
              Créer une saison
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table
              size="small"
              sx={{ [theme.breakpoints.up("sm")]: { size: "medium" } }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Thème</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Vainqueur</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {seasons.map((season) => (
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
                      {season.winner ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {season.winner.avatar_url && (
                            <Avatar
                              src={season.winner.avatar_url}
                              alt={season.winner.name}
                              sx={{ width: 24, height: 24, backgroundColor: "primary.main" }}
                            />
                          )}
                          <Typography variant="body2">
                            {season.winner.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Non déterminé
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEditSeason(season)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {season.is_active &&
                          season.weeks &&
                          season.weeks.length > 0 &&
                          (() => {
                            const lastWeek =
                              season.weeks[season.weeks.length - 1];
                            const isLastWeekEnded =
                              new Date(lastWeek.end_date) < new Date();
                            return (
                              isLastWeekEnded && (
                                <Tooltip title="Clôturer la saison">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => onCloseSeason(season)}
                                  >
                                    <CheckIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )
                            );
                          })()}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteSeason(season)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StyledPaper>
    </Box>
  );
}
