import { Box, CardMedia, Typography, Button, Stack } from "@mui/material";
import { Cake, Week } from "../types";
import { CakeRatings } from "./CakeRatings";
import { useCakeRatings } from "@hooks/useCakeQuery";

interface CakeDetailsProps {
  cake: Cake;
  week: Week;
  currentUser: any;
  onVote: () => void;
  onViewDetails?: () => void;
}

export function CakeDetails({ cake, week, currentUser, onVote, onViewDetails }: CakeDetailsProps) {
  const { data: ratings } = useCakeRatings(cake.id);
  const userRating = ratings?.find(rating => rating.user_id === currentUser?.id);

  return (
    <Box sx={{
      mt: 3,
      borderTop: '1px solid',
      borderColor: 'divider',
      pt: 3,
      backgroundColor: 'background.paper',

      p: 2
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 4 },
        alignItems: { xs: 'center', md: 'flex-start' }
      }}>
        <Box sx={{
          position: 'relative',
          width: { xs: '100%', sm: '100%', md: '60%' },
          height: { xs: 300, sm: 400, md: 500 },
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3
        }}>
          <CardMedia
            component="img"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
            image={cake.image_url}
            alt={cake.name}
          />
        </Box>
        <Box sx={{
          flex: 1,
          width: '100%',
          textAlign: { xs: 'center', md: 'left' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: { xs: 'auto', md: 500 }
        }}>
          <Box>

            <Typography variant="body1" color="text.secondary" paragraph>
              {cake.description}
            </Typography>
          </Box>

          <Box>
            <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              {currentUser && cake.user_id !== currentUser.id && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onVote}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1
                  }}
                >
                  {userRating ? "Modifier mon vote" : "Voter"}
                </Button>
              )}
              <Button
                variant="outlined"
                color="primary"
                onClick={onViewDetails}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1
                }}
              >
                Voir les détails
              </Button>
            </Stack>

            {/* Notes moyennes */}
            {week.show_scores ? (
              <CakeRatings cake={{ ...cake, ratings }} />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Les notes ne sont pas encore disponibles
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}