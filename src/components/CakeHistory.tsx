import React from "react";
import { useCakes, useCakeRatings } from "../hooks/useCakeQuery";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Paper,
  Rating,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.02)",
  },
}));

const RatingBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const GridContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: theme.spacing(3),
  marginTop: theme.spacing(2),
}));

const LoadingCard = () => (
  <StyledCard>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="100%" height={24} />
      <Skeleton variant="text" width="100%" height={24} />
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={100} />
      </Box>
    </CardContent>
  </StyledCard>
);

const CakeRatings: React.FC<{ cakeId: string }> = ({ cakeId }) => {
  const { data: ratings, isLoading } = useCakeRatings(cakeId);

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

  const averageAppearance =
    ratings.reduce((acc, rating) => acc + rating.appearance, 0) /
    ratings.length;
  const averageTaste =
    ratings.reduce((acc, rating) => acc + rating.taste, 0) / ratings.length;
  const averageTheme =
    ratings.reduce((acc, rating) => acc + rating.theme_adherence, 0) /
    ratings.length;

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Notes moyennes
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <RatingBox>
          <Typography variant="body2">Apparence:</Typography>
          <Rating value={averageAppearance} precision={0.5} readOnly />
        </RatingBox>
        <RatingBox>
          <Typography variant="body2">Goût:</Typography>
          <Rating value={averageTaste} precision={0.5} readOnly />
        </RatingBox>
        <RatingBox>
          <Typography variant="body2">Respect du thème:</Typography>
          <Rating value={averageTheme} precision={0.5} readOnly />
        </RatingBox>
      </Box>
    </Paper>
  );
};

export const CakeHistory: React.FC = () => {
  const {
    data: cakes,
    isLoading: cakesLoading,
    error: cakesError,
  } = useCakes();

  if (cakesLoading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Historique des gâteaux
        </Typography>
        <GridContainer>
          {[...Array(6)].map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </GridContainer>
      </Container>
    );
  }

  if (cakesError) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Historique des gâteaux
        </Typography>
        <Alert severity="error">
          Une erreur est survenue lors du chargement des gâteaux
        </Alert>
      </Container>
    );
  }

  if (!cakes || cakes.length === 0) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Historique des gâteaux
        </Typography>
        <Alert severity="info">
          Aucun gâteau n'a été uploadé pour le moment
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Historique des gâteaux
      </Typography>
      <GridContainer>
        {cakes.map((cake) => (
          <StyledCard key={cake.id}>
            <CardMedia
              component="img"
              height="200"
              image={cake.image_url}
              alt={cake.name}
              sx={{ objectFit: "cover" }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {cake.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cake.description}
              </Typography>
              <CakeRatings cakeId={cake.id} />
            </CardContent>
          </StyledCard>
        ))}
      </GridContainer>
    </Container>
  );
};
