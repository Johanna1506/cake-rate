import React, { useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CardMedia, Grid, Skeleton, Paper, Rating, Button, Alert, Collapse } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Cake, Week } from "../types";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@services/auth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorHandler } from "@hooks/useErrorHandler";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[8],
  },
}));

const GridContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const RatingBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const SeasonHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  backgroundColor: theme.palette.background.paper,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const SeasonTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.primary.main,
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
  const { handleError } = useErrorHandler();
  const { data: ratings, isLoading, error } = useQuery({
    queryKey: ["ratings", cakeId],
    queryFn: async () => {
      try {
        const { data, error } = await auth.supabase
          .from("ratings")
          .select("*")
          .eq("cake_id", cakeId);

        if (error) throw error;
        return data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
  });

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Une erreur est survenue lors du chargement des notes
      </Alert>
    );
  }

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
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [openSeasons, setOpenSeasons] = React.useState<Record<string, boolean>>({});
  const { data: cakes, isLoading, error } = useQuery<CakeWithWeek[]>({
    queryKey: ["cakes"],
    queryFn: async () => {
      try {
        const { data, error } = await auth.supabase
          .from("cakes")
          .select(
            `
            *,
            week:weeks(
              *,
              season:seasons(*)
            ),
            user:users(name, avatar_url)
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as CakeWithWeek[];
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
  });

  // Initialiser l'état des saisons quand les données sont chargées
  useEffect(() => {
    if (cakes) {
      const initialSeasons = cakes.reduce((acc, cake) => {
        const seasonName = cake.week.season?.theme || 'Sans saison';
        acc[seasonName] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setOpenSeasons(initialSeasons);
    }
  }, [cakes]);

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Historique des gâteaux
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          Une erreur est survenue lors du chargement de l'historique des gâteaux
        </Alert>
      </Container>
    );
  }

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

  // Grouper les gâteaux par saison
  const cakesBySeason = cakes.reduce((acc, cake) => {
    const seasonName = cake.week.season?.theme || 'Sans saison';
    if (!acc[seasonName]) {
      acc[seasonName] = [];
    }
    acc[seasonName].push(cake);
    return acc;
  }, {} as Record<string, CakeWithWeek[]>);

  const toggleSeason = (seasonName: string) => {
    setOpenSeasons(prev => ({
      ...prev,
      [seasonName]: !prev[seasonName]
    }));
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Historique des gâteaux
      </Typography>
      {Object.entries(cakesBySeason).map(([seasonName, seasonCakes]) => (
        <Box key={seasonName} sx={{ mb: 4 }}>
          <SeasonHeader onClick={() => toggleSeason(seasonName)}>
            <SeasonTitle variant="h6">
              {seasonName}
            </SeasonTitle>
            {openSeasons[seasonName] ? <KeyboardArrowUpIcon color="primary" /> : <KeyboardArrowDownIcon color="primary" />}
          </SeasonHeader>
          <Collapse in={openSeasons[seasonName] ?? true}>
            <GridContainer container spacing={2}>
              {seasonCakes.map((cake: CakeWithWeek, index) => (
                <Grid item xs={12} sm={6} md={4} key={cake.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <StyledCard onClick={() => navigate(`/cake-history/${cake.id}`)}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={cake.image_url}
                        alt={cake.description}
                        sx={{ objectFit: "cover" }}
                      />
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                          <Box
                            component="img"
                            src={cake.user.avatar_url}
                            alt={cake.user.name}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" noWrap>
                              {cake.user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(cake.week.start_date), "dd MMMM yyyy", {
                                locale: fr,
                              })}
                            </Typography>
                          </Box>
                        </Box>
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
          </Collapse>
        </Box>
      ))}
    </Container>
  );
}