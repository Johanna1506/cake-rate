import { Container, Typography, Box, Card, CardMedia, Paper, Rating, Button, Avatar, Chip, Skeleton } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@services/auth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Cake, Week } from "../types";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function CakeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: cake, isLoading } = useQuery({
    queryKey: ["cake", id],
    queryFn: async () => {
      const { data, error } = await auth.supabase
        .from("cakes")
        .select(
          `
          *,
          week:weeks(*),
          user:users(name)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Cake & { week: Week; user: { name: string } };
    },
  });

  const { data: ratings } = useQuery({
    queryKey: ["ratings", id],
    queryFn: async () => {
      const { data, error } = await auth.supabase
        .from("ratings")
        .select(`
          *,
          user:users(name, avatar_url)
        `)
        .eq("cake_id", id);

      if (error) throw error;
      return data;
    },
  });

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

  const averageAppearance = ratings?.reduce((acc, rating) => acc + rating.appearance, 0) / (ratings?.length || 1);
  const averageTaste = ratings?.reduce((acc, rating) => acc + rating.taste, 0) / (ratings?.length || 1);
  const averageTheme = ratings?.reduce((acc, rating) => acc + rating.theme_adherence, 0) / (ratings?.length || 1);

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
            {cake.user.name}
          </Typography>
          <Box sx={{ mb: 2 }}>
          <Chip
                label={cake.week.theme}
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
            {format(new Date(cake.week.start_date), "dd MMMM yyyy", {
              locale: fr,
            })}
            {" - "}
            {format(new Date(cake.week.end_date), "dd MMMM yyyy", {
              locale: fr,
            })}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {cake.description}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Notes moyennes
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1">Apparence:</Typography>
                <Rating value={averageAppearance} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  ({averageAppearance.toFixed(1)})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1">Goût:</Typography>
                <Rating value={averageTaste} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  ({averageTaste.toFixed(1)})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1">Respect du thème:</Typography>
                <Rating value={averageTheme} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  ({averageTheme.toFixed(1)})
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            Commentaires
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {ratings?.map((rating, index) => (
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
                    src={rating.user.avatar_url}
                    alt={rating.user.name}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {rating.user.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {rating.comment || "Aucun commentaire"}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Card>
    </Container>
  );
}