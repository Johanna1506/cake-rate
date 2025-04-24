import { Box, Typography, Rating, useTheme, useMediaQuery } from "@mui/material";
import { Cake, Rating as RatingType } from "../types";

interface CakeRatingsProps {
  cake: Cake;
}

export function CakeRatings({ cake }: CakeRatingsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  if (!cake.ratings || cake.ratings.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 4,
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        borderLeft: '4px solid',
        borderColor: 'primary.main',
        '&:hover': {
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)'
        }
      }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: 'primary.main',
            textAlign: 'left',
            letterSpacing: '0.5px',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Notes moyennes
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            py: 2
          }}
        >
          Aucune note pour le moment
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      mt: 4,
      p: { xs: 2, sm: 3 },
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
          letterSpacing: '0.5px',
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        Notes moyennes
      </Typography>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 2 },
        p: { xs: 1, sm: 1.5 },
        borderRadius: 2,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}>
        <Typography variant="body1" sx={{
          minWidth: { xs: 'auto', sm: 120 },
          fontWeight: 600,
          mb: { xs: 0.5, sm: 0 }
        }}>Apparence :</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={displayAppearance} precision={0.5} readOnly size={isMobile ? "small" : "medium"} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            ({averages.appearance.toFixed(1)}/2.5)
          </Typography>
        </Box>
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 2 },
        p: { xs: 1, sm: 1.5 },
        borderRadius: 2,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}>
        <Typography variant="body1" sx={{
          minWidth: { xs: 'auto', sm: 120 },
          fontWeight: 600,
          mb: { xs: 0.5, sm: 0 }
        }}>Goût :</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={displayTaste} precision={0.5} readOnly size={isMobile ? "small" : "medium"} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            ({averages.taste.toFixed(1)}/5)
          </Typography>
        </Box>
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 2 },
        p: { xs: 1, sm: 1.5 },
        borderRadius: 2,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}>
        <Typography variant="body1" sx={{
          minWidth: { xs: 'auto', sm: 120 },
          fontWeight: 600,
          mb: { xs: 0.5, sm: 0 }
        }}>Thème :</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={displayThemeAdherence} precision={0.5} readOnly size={isMobile ? "small" : "medium"} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            ({averages.theme_adherence.toFixed(1)}/2.5)
          </Typography>
        </Box>
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 2 },
        mt: 2,
        pt: 2,
        borderTop: '2px solid',
        borderColor: 'divider',
        p: { xs: 1, sm: 2 },
      }}>
        <Typography variant="h6" sx={{
          minWidth: { xs: 'auto', sm: 120 },
          fontWeight: 700,
          color: 'primary.main',
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>Total :</Typography>
        <Typography variant="h6" color="primary.main" sx={{
          fontWeight: 700,
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          {(averages.appearance + averages.taste + averages.theme_adherence).toFixed(1)}/10
        </Typography>
      </Box>
    </Box>
  );
}