import { Box, Typography, Chip } from "@mui/material";
import cakeRatePreview from "../assets/app-preview.png";
export const AppPreview = () => {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      gap: 6,
      width: '100%',
      maxWidth: '1200px',
      mx: 'auto',
      alignItems: 'center'
    }}>
      <Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 3,
            background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Découvrez Cake Rate
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: '1.1rem',
            lineHeight: 1.6,
            mb: 4
          }}
        >
          Participez à des concours de pâtisserie hebdomadaires, partagez vos créations et votez pour vos préférées.
          Une façon ludique de renforcer la cohésion d'équipe tout en développant vos talents culinaires.
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Chip
            label="🎨 Thèmes créatifs"
            sx={{
              bgcolor: 'primary.light',
              color: 'primary.dark',
              fontWeight: 600
            }}
          />
          <Chip
            label="📱 Interface intuitive"
            sx={{
              bgcolor: 'secondary.light',
              color: 'secondary.dark',
              fontWeight: 600
            }}
          />
          <Chip
            label="🌟 Expérience unique"
            sx={{
              bgcolor: 'success.light',
              color: 'success.dark',
              fontWeight: 600
            }}
          />
        </Box>
      </Box>
      <Box sx={{
        position: 'relative',
        height: '400px',
        borderRadius: '24px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,107,107,0.1) 0%, rgba(255,142,83,0.1) 100%)',
          zIndex: 1
        }
      }}>
        <img
          src={cakeRatePreview}
          alt="Présentation de Cake Rate"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '16px',
            position: 'relative',
            zIndex: 2
          }}
        />
      </Box>
    </Box>
  );
};