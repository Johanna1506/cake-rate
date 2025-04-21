import { useState, useEffect } from "react";
import { useSession } from "@hooks/useAuthQuery";
import { useRateCake, useCakeRatings, useCake } from "@hooks/useCakeQuery";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Rating,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Snackbar,
  CardMedia,
  Chip,
  Avatar,
} from "@mui/material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CakeRatingFormProps {
  cakeId: string;
}

export function CakeRatingForm({ cakeId }: CakeRatingFormProps) {
  const { data: session } = useSession();
  const rateCake = useRateCake();
  const { data: ratings } = useCakeRatings(cakeId);
  const { data: cake } = useCake(cakeId);
  const navigate = useNavigate();
  const [appearance, setAppearance] = useState<number | null>(null);
  const [taste, setTaste] = useState<number | null>(null);
  const [themeAdherence, setThemeAdherence] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Charger le vote existant de l'utilisateur
  useEffect(() => {
    if (session?.session?.user?.id && ratings) {
      const userRating = ratings.find(
        (rating) => rating.user_id === session.session?.user?.id
      );
      if (userRating) {
        setAppearance(userRating.appearance);
        setTaste(userRating.taste);
        setThemeAdherence(userRating.theme_adherence);
        setComment(userRating.comment || "");
      }
    }
  }, [session?.session?.user?.id, ratings]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!appearance || !taste || !themeAdherence) {
      setError("Veuillez noter tous les critères");
      return;
    }

    try {
      await rateCake.mutateAsync({
        cakeId,
        rating: {
          cake_id: cakeId,
          appearance,
          taste,
          theme_adherence: themeAdherence,
          comment,
        },
      });
      setSuccess(true);
      // Rediriger directement vers la page d'accueil après 2 secondes
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      setError(
        err.message ||
          "Une erreur est survenue lors de l'enregistrement de votre note"
      );
    }
  };

  if (!cake) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom align="center">
          {ratings?.some((r) => r.user_id === session?.session?.user?.id)
            ? "Modifier votre note"
            : "Noter le gâteau"}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <CardMedia
            component="img"
            height="300"
            image={cake.image_url}
            alt={cake.description}
            sx={{ objectFit: "cover", borderRadius: 1, mb: 2 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar
              src={cake.user?.avatar_url}
              alt={cake.user?.name}
              sx={{ width: 40, height: 40 }}
            />
            <Typography variant="h6">
              Gâteau réalisé par {cake.user?.name}
            </Typography>
          </Box>
          <Typography variant="h6" gutterBottom>
            {cake.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {cake.description}
          </Typography>
          <Chip
            label={cake.week?.theme}
            color="primary"
            sx={{
              mt: 1,
              fontWeight: "bold",
              backgroundColor: "primary.main",
              color: "white",
              "& .MuiChip-label": {
                px: 2,
              },
            }}
          />
          {cake.week && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {format(new Date(cake.week.start_date), "dd MMMM yyyy", {
                locale: fr,
              })}
              {" - "}
              {format(new Date(cake.week.end_date), "dd MMMM yyyy", {
                locale: fr,
              })}
            </Typography>
          )}
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography component="legend" gutterBottom>
                Apparence
              </Typography>
              <Rating
                value={appearance}
                onChange={(_, newValue) => setAppearance(newValue)}
                size="large"
              />
            </Box>

            <Box>
              <Typography component="legend" gutterBottom>
                Goût
              </Typography>
              <Rating
                value={taste}
                onChange={(_, newValue) => setTaste(newValue)}
                size="large"
              />
            </Box>

            <Box>
              <Typography component="legend" gutterBottom>
                Respect du thème
              </Typography>
              <Rating
                value={themeAdherence}
                onChange={(_, newValue) => setThemeAdherence(newValue)}
                size="large"
              />
            </Box>

            <TextField
              fullWidth
              label="Commentaire"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={rateCake.isPending}
              fullWidth
              size="large"
            >
              {rateCake.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : ratings?.some(
                  (r) => r.user_id === session?.session?.user?.id
                ) ? (
                "Modifier ma note"
              ) : (
                "Noter"
              )}
            </Button>
          </Stack>
        </Box>
      </CardContent>

      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Votre note a bien été enregistrée ! Redirection vers l'accueil...
        </Alert>
      </Snackbar>
    </Card>
  );
}
