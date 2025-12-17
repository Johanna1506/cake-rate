import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  CircularProgress,
  Chip,
  useTheme,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useSeasonRanking } from "../hooks/useRankings";

interface SeasonRankingProps {
  seasonId: string;
}

export function SeasonRanking({ seasonId }: SeasonRankingProps) {
  const theme = useTheme();
  const { data: rankings = [], isLoading, error } = useSeasonRanking(seasonId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          {error instanceof Error
            ? error.message
            : "Erreur lors du chargement du classement"}
        </Typography>
      </Box>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <EmojiEventsIcon color="primary" />
            Top 3 de la saison
          </Typography>
          <Typography color="text.secondary">
            Le classement sera disponible une fois que les notes de la saison
            seront révélées par l'administrateur.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "#FFD700"; // Gold
      case 1:
        return "#C0C0C0"; // Silver
      case 2:
        return "#CD7F32"; // Bronze
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <EmojiEventsIcon color="primary" />
          Top 3 de la saison
        </Typography>

        <Stack spacing={2}>
          {rankings.map((ranking, index) => (
            <Box
              key={ranking.user.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: "action.hover",
                border:
                  index === 0
                    ? `2px solid ${getRankColor(0)}`
                    : "1px solid transparent",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              {/* Rang */}
              <Box
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: getRankColor(index),
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                {getRankIcon(index)}
              </Box>

              {/* Avatar et nom */}
              <Avatar
                src={ranking.user.avatar_url}
                sx={{
                  width: { xs: 28, sm: 48 },
                  height: { xs: 28, sm: 48 },
                  border: "2px solid",
                  backgroundColor: "primary.main",
                }}
              >
                {ranking.user.name.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {ranking.user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ranking.totalRatings} note
                  {ranking.totalRatings > 1 ? "s" : ""} reçue
                  {ranking.totalRatings > 1 ? "s" : ""}
                </Typography>
              </Box>

              {/* Score moyen */}
              <Box sx={{ textAlign: "right" }}>
                <Chip
                  label={`${ranking.averageScore.toFixed(1)}/10`}
                  color={index === 0 ? "primary" : "default"}
                  variant={index === 0 ? "filled" : "outlined"}
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>

        {rankings.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}
          >
            Podium basé sur la note moyenne du gâteau soumis par chaque
            participant
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
