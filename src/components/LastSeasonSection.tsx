import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { Season } from "../types";
import { SeasonRewards } from "./SeasonRewards";

interface LastSeasonSectionProps {
  season: Season;
}

export function LastSeasonSection({ season }: LastSeasonSectionProps) {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          {season.theme}
        </Typography>

        <Stack direction="row" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Chip label={`${season.participant_count} participants`} size="small" />
          <Chip label={`${season.weeks?.length || 0} semaines`} size="small" />
          <Chip label="Saison terminée" size="small" color="success" />
        </Stack>

        {season.achievements && <SeasonRewards season={season} />}
      </CardContent>
    </Card>
  );
}


