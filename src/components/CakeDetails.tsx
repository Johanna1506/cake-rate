import { Box, CardMedia, Typography, Button, Stack, Rating } from "@mui/material";
import { Cake, User } from "../types";
import { useCakeRatings } from "@hooks/useCakeQuery";

interface CakeDetailsProps {
  cake: Cake;
  currentUser?: User;
  onVote: () => void;
  onViewDetails?: () => void;
}

export function CakeDetails({
  cake,
  currentUser,
  onVote,
  onViewDetails,
}: CakeDetailsProps) {
  const { data: ratings } = useCakeRatings(cake.id);
  const userRating = ratings?.find(
    (rating) => rating.user_id === currentUser?.id
  );
  const averageRatings = ratings?.length && ratings?.reduce((acc, rating) => acc + rating.appearance + rating.taste + rating.theme_adherence, 0) / ratings?.length;
  const displayAverageRatings = averageRatings ? (averageRatings / 10) * 5 : 0;

  return (
    <Box
      sx={{
        mt: 3,
        borderTop: "1px solid",
        borderColor: "divider",
        pt: 3,
        backgroundColor: "background.paper",

        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 4 },
          alignItems: { xs: "center", md: "flex-start" },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", sm: "100%", md: "60%" },
            height: { xs: 300, sm: 400, md: 500 },
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 3,
          }}
        >
          <CardMedia
            component="img"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
            image={cake.image_url}
            alt={cake.name}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            width: "100%",
            textAlign: { xs: "center", md: "left" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: { xs: "auto", md: 500 },
          }}
        >
          <Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              {cake.description}
            </Typography>
            {cake.week?.show_scores && displayAverageRatings && (
              <>
                <Typography variant="h6" color="text.secondary" paragraph>
                  Note moyenne :
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Rating value={displayAverageRatings} precision={0.5} readOnly size="large" />
                <Typography variant="body2" color="text.secondary">
                  {averageRatings?.toFixed(1)}/10
                </Typography>
                </Box>
              </>
            )}
          </Box>

          <Box>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ mt: 2, justifyContent: { xs: "center", md: "flex-start" } }}
            >
              {currentUser && cake.user_id !== currentUser.id && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onVote}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
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
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                }}
              >
                Voir les détails
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
