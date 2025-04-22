import { Box, Typography, Rating } from "@mui/material";
import { Cake, Rating as RatingType } from "../types";

interface CakeRatingsProps {
  cake: Cake;
}

export function CakeRatings({ cake }: CakeRatingsProps) {
  const calculateAverage = (ratings: RatingType[] | undefined) => {
    if (!ratings || ratings.length === 0) return { appearance: 0, taste: 0, theme_adherence: 0 };
    const sum = ratings.reduce((acc, rating) => ({
      appearance: acc.appearance + rating.appearance,
      taste: acc.taste + rating.taste,
      theme_adherence: acc.theme_adherence + rating.theme_adherence
    }), { appearance: 0, taste: 0, theme_adherence: 0 });

    const count = ratings.length;
    return {
      appearance: sum.appearance / count,
      taste: sum.taste / count,
      theme_adherence: sum.theme_adherence / count
    };
  };

  const averages = calculateAverage(cake.ratings);

  // Convertir les valeurs pour l'affichage des étoiles
  const displayAppearance = (averages.appearance / 2.5) * 5;
  const displayTaste = (averages.taste / 5) * 5;
  const displayThemeAdherence = (averages.theme_adherence / 2.5) * 5;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      mt: 3,
      p: 2,
      backgroundColor: 'background.default',
      borderRadius: 1
    }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Notes moyennes
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ minWidth: 120 }}>Apparence :</Typography>
        <Rating value={displayAppearance} precision={0.5} readOnly size="small" />
        <Typography variant="body2" color="text.secondary">
          ({averages.appearance.toFixed(1)}/2.5)
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ minWidth: 120 }}>Goût :</Typography>
        <Rating value={displayTaste} precision={0.5} readOnly size="small" />
        <Typography variant="body2" color="text.secondary">
          ({averages.taste.toFixed(1)}/5)
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ minWidth: 120 }}>Thème :</Typography>
        <Rating value={displayThemeAdherence} precision={0.5} readOnly size="small" />
        <Typography variant="body2" color="text.secondary">
          ({averages.theme_adherence.toFixed(1)}/2.5)
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
        <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 600 }}>Total :</Typography>
        <Typography variant="body2" color="text.secondary">
          {((averages.appearance + averages.taste + averages.theme_adherence) / 10 * 100).toFixed(1)}%
        </Typography>
      </Box>
    </Box>
  );
}