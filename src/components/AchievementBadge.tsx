import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import * as Icons from "@mui/icons-material";
import { UserAchievement } from "../types";

interface AchievementBadgeProps {
  achievement: UserAchievement;
  showSeason?: boolean;
  variant?: "compact" | "full";
}

const getAchievementIcon = (type: string) => {
  switch (type) {
    case "season_winner":
      return (
        <Icons.MilitaryTech sx={{ color: "primary.main", fontSize: 32 }} />
      );
    case "best_taste":
      return (
        <Icons.RestaurantMenu sx={{ color: "primary.main", fontSize: 32 }} />
      );
    case "best_appearance":
      return <Icons.EmojiEvents sx={{ color: "primary.main", fontSize: 32 }} />;
    case "best_theme":
      return <Icons.Share sx={{ color: "primary.main", fontSize: 32 }} />;
    case "first_cake":
      return <Icons.Cake sx={{ color: "primary.main", fontSize: 32 }} />;
    case "regular":
      return <Icons.DateRange sx={{ color: "primary.main", fontSize: 32 }} />;
    case "dedicated":
      return <Icons.Star sx={{ color: "primary.main", fontSize: 32 }} />;
    case "first_rating":
      return <Icons.RateReview sx={{ color: "primary.main", fontSize: 32 }} />;
    case "active_judge":
      return <Icons.Gavel sx={{ color: "primary.main", fontSize: 32 }} />;
    case "community":
      return <Icons.People sx={{ color: "primary.main", fontSize: 32 }} />;
    case "weekly_winner":
      return <Icons.EmojiEvents sx={{ color: "primary.main", fontSize: 32 }} />;
    case "improvement":
      return <Icons.TrendingUp sx={{ color: "primary.main", fontSize: 32 }} />;
    case "perfect_score":
      return <Icons.Star sx={{ color: "primary.main", fontSize: 32 }} />;
    default:
      return <Icons.EmojiEvents sx={{ color: "primary.main", fontSize: 32 }} />;
  }
};

const getAchievementName = (type: string) => {
  switch (type) {
    case "season_winner":
      return "Gagnant de la saison";
    case "best_taste":
      return "Meilleur goût";
    case "best_appearance":
      return "Meilleure présentation";
    case "best_theme":
      return "Meilleur respect du thème";
    case "first_cake":
      return "Premier Gâteau";
    case "regular":
      return "Régulier";
    case "dedicated":
      return "Assidu";
    case "first_rating":
      return "Premier Avis";
    case "active_judge":
      return "Juge Actif";
    case "community":
      return "Communautaire";
    case "weekly_winner":
      return "Premier de la Semaine";
    case "improvement":
      return "En Progression";
    case "perfect_score":
      return "Parfait";
    default:
      return type;
  }
};

const MotionCard = motion(Card);

export function AchievementBadge({
  achievement,
  showSeason = true,
  variant = "full",
}: AchievementBadgeProps) {
  if (variant === "compact") {
    return (
      <Chip
        icon={getAchievementIcon(achievement.achievement_type)}
        label={getAchievementName(achievement.achievement_type)}
        color="primary"
        sx={{
          fontWeight: 600,
          fontSize: "0.9rem",
          height: 36,
          px: 2,
          borderRadius: 2,
        }}
      />
    );
  }

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      sx={{
        background: "background.paper",
        borderRadius: 2,
        border: "none",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        height: "100px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <CardContent sx={{ width: "100%", p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {getAchievementIcon(achievement.achievement_type)}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {getAchievementName(achievement.achievement_type)}
            </Typography>
            {showSeason && achievement.season && (
              <Typography variant="body2" color="text.secondary">
                Saison {achievement.season.theme}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </MotionCard>
  );
}
