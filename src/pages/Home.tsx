import { useMemo, useState } from "react";
import { CakeUpload } from "@components/CakeUpload";
import { Box, Container, CircularProgress, Alert, Typography, Stack, Dialog, DialogContent } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentSeason } from "../hooks/useWeekQuery";
import { useSession, useUserDetails } from "@hooks/useAuthQuery";
// import { useNavigate } from "react-router-dom";
import { ActiveWeekCard } from "@components/ActiveWeekCard";
import { LastSeasonSection } from "@components/LastSeasonSection";
import { CurrentSeasonHeader } from "@components/CurrentSeasonHeader";
import { UpcomingWeekItem } from "@components/UpcomingWeekItem";
import preparingSeasonImage from "../../public/images/preparing-season.svg";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ShareIcon from "@mui/icons-material/Share";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { FeatureCard } from "@components/FeatureCard";
import { HeroSection } from "@components/HeroSection";
import { AppPreview } from "@components/AppPreview";
import { ComingSoonSection } from "@components/ComingSoonSection";
//
import { User } from "../types";

export function Home() {
  const queryClient = useQueryClient();
  // const navigate = useNavigate();
  const { data: seasonsData, isLoading: isLoadingSeason } = useCurrentSeason();
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { data: session } = useSession();
  const { data: currentUser } = useUserDetails(session?.session?.user?.id);

  // Always compute derived data before any early returns to preserve hooks order
  const sortedWeeks = useMemo(() => {
    const weeks = seasonsData?.currentSeason?.weeks;
    if (!weeks) return [];
    return [...weeks].sort((a, b) => {
      if (a.is_active && !b.is_active) return -1;
      if (!a.is_active && b.is_active) return 1;
      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    });
  }, [seasonsData?.currentSeason?.weeks]);

  if (isLoadingSeason) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!seasonsData?.currentSeason && !seasonsData?.lastCompletedSeason) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            mt: { xs: 4, md: 4 },
            mb: { xs: 12, md: 8 },
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <HeroSection />
          <ComingSoonSection />
          {/* Features Section */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 4,
              width: "100%",
              maxWidth: "1200px",
              mx: "auto",
            }}
          >
            <FeatureCard
              icon={<RestaurantMenuIcon sx={{ fontSize: 48 }} />}
              title="Créez"
              description="Réalisez des gâteaux créatifs selon les thèmes proposés chaque semaine"
            />
            <FeatureCard
              icon={<ShareIcon sx={{ fontSize: 48 }} />}
              title="Partagez"
              description="Partagez vos créations avec vos collègues et découvrez leurs talents"
            />
            <FeatureCard
              icon={<EmojiEventsIcon sx={{ fontSize: 48 }} />}
              title="Gagnez"
              description="Remportez des récompenses et devenez le meilleur pâtissier de l'équipe"
            />
          </Box>

          <AppPreview />
        </Box>
      </Container>
    );
  }

  const currentSeason = seasonsData?.currentSeason;
  const lastCompletedSeason = seasonsData?.lastCompletedSeason;

  if (
    currentSeason &&
    (!currentSeason.weeks || currentSeason.weeks.length === 0)
  ) {
    return (
      <Container maxWidth="md">
        <Alert
          severity="info"
          sx={{
            mt: 4,
            bgcolor: "background.paper",
            color: "text.primary",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            "& .MuiAlert-icon": {
              display: "none",
            },
            "& .MuiAlert-message": {
              fontSize: "1.1rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 2,
            },
          }}
        >
          <img
            src={preparingSeasonImage}
            alt="Saison en préparation"
            style={{ width: "48px", height: "48px" }}
          />
          La saison "{currentSeason.theme}" est en cours de préparation. Les
          semaines seront bientôt disponibles.
        </Alert>
      </Container>
    );
  }

  // sortedWeeks already computed above with useMemo
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Section de la dernière saison terminée */}
      {lastCompletedSeason && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            🏆 Dernière saison terminée
          </Typography>
          <LastSeasonSection season={lastCompletedSeason} />
        </Box>
      )}

      {/* Section de la saison en cours */}
      {currentSeason && (
        <>
          <CurrentSeasonHeader season={currentSeason} />

          {/* Section Semaine en cours */}
          {sortedWeeks.some((week) => week.is_active) && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                Semaine en cours
              </Typography>
              <Stack spacing={2}>
                {sortedWeeks
                  .filter((week) => week.is_active)
                  .map((week) => (
                    <ActiveWeekCard
                      key={week.id}
                      week={week}
                      currentUser={
                        currentUser ||
                        ({
                          id: "",
                          name: "",
                          email: "",
                          role: "USER",
                          created_at: new Date().toISOString(),
                        } as User)
                      }
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
          {sortedWeeks.some((week) => !week.is_active && new Date(week.end_date) >= new Date()) && (
            <Box>
              <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                Semaines à venir
              </Typography>
              <Stack spacing={2}>
                {sortedWeeks
                  .filter((week) => !week.is_active && new Date(week.end_date) >= new Date())
                  .map((week) => (
                    <UpcomingWeekItem key={week.id} week={week} />
                  ))}
              </Stack>
            </Box>
          )}
        </>
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
                queryClient.invalidateQueries({ queryKey: ["weekCake"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
