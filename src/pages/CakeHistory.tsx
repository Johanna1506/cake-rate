import { Container, Typography, Box, Card, CardContent, CardMedia, Grid, Skeleton, Paper, Rating, Chip, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Cake, Week } from "../types";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@services/auth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[8],
  },
}));

const GridContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const RatingBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const LoadingCard = () => (
  <StyledCard>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="80%" />
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={100} />
      </Box>
    </CardContent>
  </StyledCard>
);

interface CakeWithWeek extends Cake {
  week: Week;
  user: {
    name: string;
    avatar_url: string;
  };
}

const CakeRatings: React.FC<{ cakeId: string; week: Week }> = ({ cakeId, week }) => {
  const navigate = useNavigate();
  const { data: ratings, isLoading } = useQuery({
    queryKey: ["ratings", cakeId],
    queryFn: async () => {
      const { data, error } = await auth.supabase
        .from("ratings")
        .select("*")
        .eq("cake_id", cakeId);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={100} />
      </Box>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Aucune note pour le moment
      </Typography>
    );
  }

  if (!week.show_scores) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Les scores ne sont pas encore disponibles pour cette semaine
      </Typography>
    );
  }

  const averageAppearance =
    ratings.reduce((acc, rating) => acc + rating.appearance, 0) /
    ratings.length;
  const averageTaste =
    ratings.reduce((acc, rating) => acc + rating.taste, 0) / ratings.length;
  const averageTheme =
    ratings.reduce((acc, rating) => acc + rating.theme_adherence, 0) /
    ratings.length;

  return (
    <Paper sx={{ p: 2, mt: 2, bgcolor: "background.paper" }}>
      <Typography variant="subtitle2" gutterBottom>
        Notes moyennes
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <RatingBox>
          <Typography variant="body2">Apparence:</Typography>
          <Rating value={averageAppearance} precision={0.5} readOnly />
          <Typography variant="body2" color="text.secondary">
            ({averageAppearance.toFixed(1)})
          </Typography>
        </RatingBox>
        <RatingBox>
          <Typography variant="body2">Goût:</Typography>
          <Rating value={averageTaste} precision={0.5} readOnly />
          <Typography variant="body2" color="text.secondary">
            ({averageTaste.toFixed(1)})
          </Typography>
        </RatingBox>
        <RatingBox>
          <Typography variant="body2">Respect du thème:</Typography>
          <Rating value={averageTheme} precision={0.5} readOnly />
          <Typography variant="body2" color="text.secondary">
            ({averageTheme.toFixed(1)})
          </Typography>
        </RatingBox>
      </Box>
      <Button
        variant="text"
        size="small"
        onClick={() => navigate(`/cake-history/${cakeId}`)}
        sx={{
          mt: 2,
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)'
          }
        }}
      >
        Voir les détails
      </Button>
    </Paper>
  );
};

export function CakeHistory() {
  const { data: cakes, isLoading } = useQuery<CakeWithWeek[]>({
    queryKey: ["cakes"],
    queryFn: async () => {
      const { data, error } = await auth.supabase
        .from("cakes")
        .select(
          `
          *,
          week:weeks(*),
          user:users(name, avatar_url)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CakeWithWeek[];
    },
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Historique des gâteaux
        </Typography>
        <GridContainer container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <LoadingCard />
            </Grid>
          ))}
        </GridContainer>
      </Container>
    );
  }

  if (!cakes || cakes.length === 0) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Historique des gâteaux
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aucun gâteau n'a été ajouté pour le moment.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Historique des gâteaux
      </Typography>
      <GridContainer container spacing={3}>
        {cakes.map((cake: CakeWithWeek, index) => (
          <Grid item xs={12} sm={6} md={4} key={cake.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <StyledCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={cake.image_url}
                  alt={cake.description}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="h6" noWrap>
                      {cake.user.name}
                    </Typography>
                    <StyledChip
                      label={cake.week.season?.theme}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {format(new Date(cake.week.start_date), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                    {" - "}
                    {format(new Date(cake.week.end_date), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {cake.description}
                  </Typography>
                  <CakeRatings cakeId={cake.id} week={cake.week} />
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
        ))}
      </GridContainer>
    </Container>
  );
}