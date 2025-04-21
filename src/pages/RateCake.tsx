import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Cake, Week } from "../types";
import { CakeRatingForm } from "../components/CakeRatingForm";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
} from "@mui/material";

export function RateCake() {
  const { cakeId } = useParams();
  const [cakes, setCakes] = useState<(Cake & { week: Week })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);

  useEffect(() => {
    fetchCakes();
  }, []);

  useEffect(() => {
    if (cakeId) {
      const cake = cakes.find((c) => c.id === cakeId);
      if (cake) {
        setSelectedCake(cake);
      }
    }
  }, [cakeId, cakes]);

  const fetchCakes = async () => {
    try {
      const { data, error } = await supabase
        .from("cakes")
        .select(
          `
                    *,
                    week:weeks(
                      *,
                      season:seasons(*)
                    )
                `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCakes(data as (Cake & { week: Week })[]);
    } catch (err) {
      setError("Erreur lors du chargement des gâteaux.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (selectedCake) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <CakeRatingForm cakeId={selectedCake.id} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Choisissez un gâteau à noter
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {cakes.map((cake) => (
            <Box key={cake.id}>
              <Card
                sx={{ cursor: "pointer" }}
                onClick={() => setSelectedCake(cake)}
              >
                <CardMedia
                  component="img"
                  image={cake.image_url}
                  alt={cake.description}
                  sx={{ height: 200, objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h6" component="h2">
                    {cake.week.season?.theme}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cake.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
