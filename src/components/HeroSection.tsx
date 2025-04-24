import { Box, Typography } from "@mui/material";

export const HeroSection = () => {
  return (
    <Box sx={{
      textAlign: 'center',
      maxWidth: '800px',
      mx: 'auto',

      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        zIndex: -1,
        animation: 'pulse 3s infinite',
      },
      '@keyframes pulse': {
        '0%': { transform: 'translate(-50%, -50%) scale(1)' },
        '50%': { transform: 'translate(-50%, -50%) scale(1.1)' },
        '100%': { transform: 'translate(-50%, -50%) scale(1)' },
      }
    }}>
      <Typography
        variant="h1"
        component="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '3rem', md: '5rem' },
          background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
          letterSpacing: '-0.02em'
        }}
      >
        Cake Rate
      </Typography>
      <Typography
        variant="h2"
        sx={{
          fontWeight: 500,
          fontSize: { xs: '1.5rem', md: '2rem' },
          color: 'text.secondary',
          maxWidth: '600px',
          mx: 'auto',
          lineHeight: 1.4,
        }}
      >
        Un concours de pâtisserie entre collègues
      </Typography>

    </Box>
  );
};