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
      gap: 2.5,
      mt: 4,
      p: 3,
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      borderLeft: '4px solid',
      borderColor: 'primary.main',
      '&:hover': {
        boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)'
      },
      '& .MuiRating-root': {
        color: 'primary.main',
        '& .MuiRating-iconFilled': {
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
        }
      }
    }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: 'primary.main',
          textAlign: 'left',
          letterSpacing: '0.5px'
        }}
      >
        Notes moyennes
      </Typography>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: 2,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}>
        <Typography variant="body1" sx={{ minWidth: 120, fontWeight: 600 }}>Apparence :</Typography>
        <Rating value={displayAppearance} precision={0.5} readOnly size="medium" />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
          ({averages.appearance.toFixed(1)}/2.5)
        </Typography>
      </Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: 2,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}>
        <Typography variant="body1" sx={{ minWidth: 120, fontWeight: 600 }}>Goût :</Typography>
        <Rating value={displayTaste} precision={0.5} readOnly size="medium" />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
          ({averages.taste.toFixed(1)}/5)
        </Typography>
      </Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: 2,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}>
        <Typography variant="body1" sx={{ minWidth: 120, fontWeight: 600 }}>Thème :</Typography>
        <Rating value={displayThemeAdherence} precision={0.5} readOnly size="medium" />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
          ({averages.theme_adherence.toFixed(1)}/2.5)
        </Typography>
      </Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mt: 2,
        pt: 2,
        borderTop: '2px solid',
        borderColor: 'divider',
        p: 2,
      }}>
        <Typography variant="h6" sx={{ minWidth: 120, fontWeight: 700, color: 'primary.main' }}>Total :</Typography>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
          {(averages.appearance + averages.taste + averages.theme_adherence).toFixed(1)}/10
        </Typography>
      </Box>
    </Box>
  );
}