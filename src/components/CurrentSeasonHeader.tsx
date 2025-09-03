import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { Season } from "../types";

interface CurrentSeasonHeaderProps {
  season: Season;
}

export function CurrentSeasonHeader({ season }: CurrentSeasonHeaderProps) {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          {season.theme}
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip label={`${season.participant_count} participants`} size="small" />
          <Chip label={`${season.weeks?.length || 0} semaines`} size="small" />
        </Stack>

        <Typography variant="body1" color="text.secondary">
          Participez à cette saison de pâtisserie en réalisant des gâteaux sur le thème "{season.theme}". Chaque semaine, un participant différent sera sélectionné pour présenter sa création.
        </Typography>
      </CardContent>
    </Card>
  );
}


