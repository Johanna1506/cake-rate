import { useState } from "react";
import { CakeUpload } from "@components/CakeUpload";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Chip,
  Typography,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  Avatar,
} from "@mui/material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentSeason } from '../hooks/useWeekQuery';
import { useSession, useUserDetails } from "@hooks/useAuthQuery";
import { ActiveWeekCard } from "@components/ActiveWeekCard";
import emptySeasonImage from '../../public/images/empty-season.svg';
import preparingSeasonImage from '../../public/images/preparing-season.svg';

export function Home() {
  const queryClient = useQueryClient();
  const { data: season, isLoading: isLoadingSeason } = useCurrentSeason();
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { data: session } = useSession();
  const { data: currentUser } = useUserDetails(session?.session?.user?.id);

  if (isLoadingSeason) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!season) {
    return (
      <Container maxWidth="md">
        <Alert
          severity="info"
          sx={{
            mt: 4,
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            '& .MuiAlert-icon': {
              display: 'none'
            },
            '& .MuiAlert-message': {
              fontSize: '1.1rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }
          }}
        >
          <img
            src={emptySeasonImage}
            alt="Aucune saison active"
            style={{ width: '48px', height: '48px' }}
          />
          Aucune saison n'est active pour le moment. Revenez plus tard pour participer à la prochaine saison !
        </Alert>
      </Container>
    );
  }

  if (!season.weeks || season.weeks.length === 0) {
    return (
      <Container maxWidth="md">
        <Alert
          severity="info"
          sx={{
            mt: 4,
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            '& .MuiAlert-icon': {
              display: 'none'
            },
            '& .MuiAlert-message': {
              fontSize: '1.1rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }
          }}
        >
          <img
            src={preparingSeasonImage}
            alt="Saison en préparation"
            style={{ width: '48px', height: '48px' }}
          />
          La saison "{season.theme}" est en cours de préparation. Les semaines seront bientôt disponibles.
        </Alert>
      </Container>
    );
  }

  // Trier les semaines : active d'abord, puis par date de création
  const sortedWeeks = [...season.weeks].sort((a, b) => {
    if (a.is_active && !b.is_active) return -1;
    if (!a.is_active && b.is_active) return 1;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            {season.theme}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip
              label={`${season.participant_count} participants`}
              size="small"
            />
            <Chip
              label={`${season.weeks.length} semaines`}
              size="small"
            />
          </Stack>

          <Typography variant="body1" color="text.secondary">
            Participez à cette saison de pâtisserie en réalisant des gâteaux sur le thème "{season.theme}".
            Chaque semaine, un participant différent sera sélectionné pour présenter sa création.
          </Typography>
        </CardContent>
      </Card>

      {/* Section Semaine en cours */}
      {sortedWeeks.some(week => week.is_active) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Semaine en cours
          </Typography>
          <Stack spacing={2}>
            {sortedWeeks
              .filter(week => week.is_active)
              .map((week) => (
                <ActiveWeekCard
                  key={week.id}
                  week={week}
                  currentUser={currentUser}
                  onAddCake={(weekId) => {
                    setSelectedWeek(weekId);
                    setShowUploadModal(true);
                  }}
                />
              ))}
          </Stack>
        </Box>
      )}

      {/* Section Semaines à venir */}
      {sortedWeeks.some(week => !week.is_active) && (
        <Box>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Semaines à venir
          </Typography>
          <Stack spacing={2}>
            {sortedWeeks
              .filter(week => !week.is_active)
              .map((week) => (
                <Card
                  key={week.id}
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                        {week.user && (
                          <Avatar
                            src={week.user.avatar_url}
                            alt={week.user.name}
                            sx={{
                              width: 56,
                              height: 56,
                              border: '2px solid',
                              borderColor: 'primary.main'
                            }}
                          >
                            {week.user.name?.[0] || "U"}
                          </Avatar>
                        )}
                        <Box>
                          <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                              mb: 1,
                              fontWeight: 600,
                              color: 'text.primary'
                            }}
                          >
                            {format(new Date(week.start_date), "dd MMMM", { locale: fr })} - {format(new Date(week.end_date), "dd MMMM yyyy", { locale: fr })}
                          </Typography>

                          {week.user ? (
                            <Typography
                              variant="subtitle1"
                              sx={{
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              Participant : {week.user.name}
                            </Typography>
                          ) : (
                            <Typography
                              variant="subtitle1"
                              color="text.secondary"
                              sx={{ fontStyle: 'italic' }}
                            >
                              Aucun participant assigné
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Stack>
        </Box>
      )}

      <Dialog
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedWeek && (
            <CakeUpload
              weekId={selectedWeek}
              onClose={() => {
                setShowUploadModal(false);
                setSelectedWeek(null);
                queryClient.invalidateQueries({ queryKey: ['weekCake'] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
