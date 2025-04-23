import { Box, CardMedia, Typography, Button } from "@mui/material";
import { Cake, Week } from "../types";
import { CakeRatings } from "./CakeRatings";
import { useCakeRatings } from "@hooks/useCakeQuery";

interface CakeDetailsProps {
  cake: Cake;
  week: Week;
  currentUser: any;
  onVote: () => void;
}

export function CakeDetails({ cake, week, currentUser, onVote }: CakeDetailsProps) {
  const { data: ratings } = useCakeRatings(cake.id);
  const userRating = ratings?.find(rating => rating.user_id === currentUser?.id);

  return (
    <Box sx={{
      mt: 3,
      borderTop: '1px solid',
      borderColor: 'divider',
      pt: 3,
      backgroundColor: 'background.paper',
      borderRadius: 2,
      p: 2
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 4 },
        alignItems: { xs: 'center', md: 'flex-start' }
      }}>
        <CardMedia
          component="img"
          sx={{
            width: { xs: '100%', sm: 300, md: 250 },
            height: { xs: 200, sm: 300, md: 250 },
            objectFit: 'cover',
            borderRadius: 2,
            boxShadow: 2
          }}
          image={cake.image_url}
          alt={cake.name}
        />
        <Box sx={{
          flex: 1,
          width: '100%',
          textAlign: { xs: 'center', md: 'left' }
        }}>
          <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            {cake.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {cake.description}
          </Typography>

          {/* Bouton de vote */}
          {currentUser && cake.user_id !== currentUser.id && (
            <Button
              variant="contained"
              color="primary"
              onClick={onVote}
              sx={{
                mt: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              {userRating ? "Modifier mon vote" : "Voter"}
            </Button>
          )}

          {/* Notes moyennes */}
          {week.show_scores && (
            <CakeRatings cake={cake} />
          )}
        </Box>
      </Box>
    </Box>
  );
}