import { Box, Typography, Chip } from "@mui/material";

export const ComingSoonSection = () => {
  return (
    <Box sx={{
      textAlign: 'center',
      maxWidth: '800px',
      mx: 'auto',
      p: 6,
      borderRadius: '24px',
      bgcolor: 'background.paper',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(255,107,107,0.05) 0%, rgba(255,142,83,0.05) 100%)',
        zIndex: 1
      }
    }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 2,
          position: 'relative',
          zIndex: 2
        }}
      >
        Prochaine saison bientôt disponible !
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontSize: '1.1rem',
          lineHeight: 1.6,
          maxWidth: '600px',
          mx: 'auto',
          mb: 4,
          position: 'relative',
          zIndex: 2
        }}
      >
        Revenez bientôt pour participer à notre prochaine saison de concours de pâtisserie.
        Une nouvelle aventure culinaire vous attend !
      </Typography>
      <Box sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'center',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 2
      }}>
        <Chip
          label="🎂 Nouveaux thèmes"
          sx={{
            bgcolor: 'primary.light',
            color: 'primary.dark',
            fontWeight: 600
          }}
        />
        <Chip
          label="🎁 Récompenses"
          sx={{
            bgcolor: 'secondary.light',
            color: 'secondary.dark',
            fontWeight: 600
          }}
        />
        <Chip
          label="🌟 Surprises"
          sx={{
            bgcolor: 'success.light',
            color: 'success.dark',
            fontWeight: 600
          }}
        />
      </Box>
    </Box>
  );
};