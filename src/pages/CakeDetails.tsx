import { Container, Typography, Box, Card, CardMedia, Paper, Rating, Button, Avatar, Chip, Skeleton } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useCake, useCakeRatings } from "@hooks/useCakeQuery";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Rating as RatingType } from "../types";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function CakeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: cake, isLoading } = useCake(id);
  const { data: ratings } = useCakeRatings(id);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Button
          variant="text"
          onClick={() => navigate(-1)}
          sx={{ mt: 4, mb: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Retour
        </Button>

        <Card sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={400} />
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Box sx={{ mb: 2 }}>
              <Skeleton variant="rectangular" width={120} height={32} />
            </Box>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="90%" height={24} />

            <Box sx={{ mb: 4 }}>
              <Skeleton variant="text" width="30%" height={32} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                <Skeleton variant="rectangular" width="100%" height={40} />
                <Skeleton variant="rectangular" width="100%" height={40} />
                <Skeleton variant="rectangular" width="100%" height={40} />
              </Box>
            </Box>

            <Skeleton variant="text" width="30%" height={32} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <Skeleton variant="rectangular" width="100%" height={80} />
              <Skeleton variant="rectangular" width="100%" height={80} />
            </Box>
          </Box>
        </Card>
      </Container>
    );
  }

  if (!cake) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
          Gâteau non trouvé
        </Typography>
      </Container>
    );
  }

  const calculateAverage = (ratings: any[] | undefined, field: keyof RatingType) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + (rating[field] || 0), 0);
    return sum / ratings.length;
  };

  const averageAppearance = calculateAverage(ratings, 'appearance');
  const averageTaste = calculateAverage(ratings, 'taste');
  const averageTheme = calculateAverage(ratings, 'theme_adherence');

  return (
    <Container maxWidth="lg">
      <Button
        variant="text"
        onClick={() => navigate(-1)}
        sx={{ mt: 4, mb: 2 }}
        startIcon={<ArrowBackIcon />}
      >
        Retour
      </Button>

      <Card sx={{ mb: 4 }}>
        <CardMedia
          component="img"
          height="400"
          image={cake.image_url}
          alt={cake.description}
          sx={{ objectFit: "cover" }}
        />
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {cake.user?.name}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Chip
              label={cake.week?.season?.theme}
              color="primary"
              sx={{
                fontWeight: "bold",
                backgroundColor: "primary.main",
                color: "white",
                "& .MuiChip-label": {
                  px: 2,
                },
              }}
            />
          </Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {cake.week?.start_date && format(new Date(cake.week.start_date), "dd MMMM yyyy", {
              locale: fr,
            })}
            {" - "}
            {cake.week?.end_date && format(new Date(cake.week.end_date), "dd MMMM yyyy", {
              locale: fr,
            })}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {cake.description}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {ratings && ratings.length > 0 ? "Notes moyennes" : "Pas de note pour le moment"}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {ratings && ratings.some(rating => rating.appearance !== undefined) && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body1">Apparence:</Typography>
                  <Rating value={averageAppearance} precision={0.5} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({averageAppearance.toFixed(1)})
                  </Typography>
                </Box>
              )}
              {ratings && ratings.some(rating => rating.taste !== undefined) && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body1">Goût:</Typography>
                  <Rating value={averageTaste} precision={0.5} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({averageTaste.toFixed(1)})
                  </Typography>
                </Box>
              )}
              {ratings && ratings.some(rating => rating.theme_adherence !== undefined) && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body1">Respect du thème:</Typography>
                  <Rating value={averageTheme} precision={0.5} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({averageTheme.toFixed(1)})
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {ratings && ratings.some(rating => rating.comment) && (
            <>
              <Typography variant="h6" gutterBottom>
                Commentaires
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {ratings
                  .filter(rating => rating.comment)
                  .map((rating, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderLeft: "4px solid",
                        borderColor: "primary.main",
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Avatar
                          src={rating.user?.avatar_url}
                          alt={rating.user?.name}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {rating.user?.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {rating.comment}
                      </Typography>
                    </Paper>
                  ))}
              </Box>
            </>
          )}
        </Box>
      </Card>
    </Container>
  );
}