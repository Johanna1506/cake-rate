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
  onClose?: () => void;
}

interface CustomRatingProps {
  value: number | null;
  onChange: (value: number | null) => void;
  max: number;
  label: string;
}

function CustomRating({ value, onChange, max, label }: CustomRatingProps) {
  const handleChange = (_: React.SyntheticEvent, newValue: number | null) => {
    if (newValue === null) {
      onChange(null);
      return;
    }
    // Convertir la valeur de 5 étoiles à l'échelle souhaitée
    const convertedValue = (newValue / 5) * max;
    onChange(convertedValue);
  };

  // Convertir la valeur de l'échelle souhaitée à 5 étoiles
  const displayValue = value === null ? null : (value / max) * 5;

  return (
    <Box>
      <Typography component="legend" gutterBottom>
        {label} (sur {max})
      </Typography>
      <Rating
        value={displayValue}
        onChange={handleChange}
        size="large"
        precision={0.5}
      />
      {value !== null && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Note : {value.toFixed(1)}/{max}
        </Typography>
      )}
    </Box>
  );
}

export function CakeRatingForm({ cakeId, onClose }: CakeRatingFormProps) {
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

  // Calculer la note globale
  const calculateTotalScore = () => {
    if (appearance === null || taste === null || themeAdherence === null) {
      return null;
    }
    // Convertir chaque note en pourcentage de sa valeur maximale
    const appearanceScore = (appearance / 2.5) * 2.5; // 25% de la note finale
    const tasteScore = (taste / 5) * 5; // 50% de la note finale
    const themeScore = (themeAdherence / 2.5) * 2.5; // 25% de la note finale

    // Additionner les scores
    return appearanceScore + tasteScore + themeScore;
  };

  const totalScore = calculateTotalScore();

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
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          navigate("/");
        }
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
    <Box sx={{ p: 2 }}>
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
          label={cake.week?.season?.theme}
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
          <CustomRating
            value={appearance}
            onChange={setAppearance}
            max={2.5}
            label="Apparence"
          />

          <CustomRating
            value={taste}
            onChange={setTaste}
            max={5}
            label="Goût"
          />

          <CustomRating
            value={themeAdherence}
            onChange={setThemeAdherence}
            max={2.5}
            label="Respect du thème"
          />

          {totalScore !== null && (
            <Box sx={{
              p: 2,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="body1" color="text.secondary">
                Note globale
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {totalScore.toFixed(1)}/10
              </Typography>
            </Box>
          )}

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
    </Box>
  );
}
