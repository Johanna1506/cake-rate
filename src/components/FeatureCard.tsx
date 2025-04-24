import { Box, Card, Typography } from "@mui/material";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}15`,
        '& .icon-container': {
          bgcolor: 'primary.main',
        }
      }
    }}>
      <Box
        className="icon-container"
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          transition: 'background-color 0.2s ease',
          '& .MuiSvgIcon-root': {
            transition: 'color 0.2s ease',
            color: 'primary.dark'
          },
          '&:hover': {
            '& .MuiSvgIcon-root': {
              color: 'white'
            }
          }
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
      >
        {description}
      </Typography>
    </Card>
  );
};