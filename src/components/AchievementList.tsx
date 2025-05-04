import { Box, Typography, Grid } from "@mui/material";
import { UserAchievement } from "../types";
import { AchievementBadge } from "./AchievementBadge";

interface AchievementListProps {
  achievements: UserAchievement[];
  title?: string;
  showSeason?: boolean;
  variant?: "compact" | "full";
}

export function AchievementList({
  achievements,
  title = "🏆 Récompenses",
  showSeason = true,
  variant = "full",
}: AchievementListProps) {
  if (!achievements || achievements.length === 0) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {achievements.map((achievement) => (
          <Grid item xs={12} sm={6} key={achievement.id}>
            <AchievementBadge
              achievement={achievement}
              showSeason={showSeason}
              variant={variant}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
