import { useState, useEffect } from "react";
import { useSession } from "@hooks/useAuthQuery";
import { useRateCake, useCakeRatings, useCake } from "@hooks/useCakeQuery";
import { useNavigate } from "react-router-dom";
import { useErrorHandler } from "@hooks/useErrorHandler";
import {
  Box,
  Button,
  TextField,
  Typography,
  Rating,
  CircularProgress,
  Stack,
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
  error?: boolean;
  helperText?: string;
}

function CustomRating({ value, onChange, max, label, error, helperText }: CustomRatingProps) {
  const handleChange = (_: React.SyntheticEvent, newValue: number | null) => {
    if (newValue === null) {
      onChange(null);
      return;
    }
    const convertedValue = (newValue / 5) * max;
    onChange(convertedValue);
  };

  const displayValue = value === null ? null : (value / max) * 5;

  return (
    <Box>
      <Typography component="legend" gutterBottom color={error ? "error" : "text.primary"}>
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
      {error && helperText && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
          {helperText}
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
  const { handleError, handleSuccess } = useErrorHandler();
  const [appearance, setAppearance] = useState<number | null>(null);
  const [taste, setTaste] = useState<number | null>(null);
  const [themeAdherence, setThemeAdherence] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentTouched, setCommentTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation states
  const [appearanceError, setAppearanceError] = useState("");
  const [tasteError, setTasteError] = useState("");
  const [themeAdherenceError, setThemeAdherenceError] = useState("");

  const calculateTotalScore = () => {
    if (appearance === null || taste === null || themeAdherence === null) {
      return null;
    }
    const appearanceScore = (appearance / 2.5) * 2.5;
    const tasteScore = (taste / 5) * 5;
    const themeScore = (themeAdherence / 2.5) * 2.5;
    return appearanceScore + tasteScore + themeScore;
  };

  const totalScore = calculateTotalScore();

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

  const validateForm = () => {
    let isValid = true;

    if (appearance === null) {
      setAppearanceError("Veuillez noter l'apparence");
      isValid = false;
    } else {
      setAppearanceError("");
    }

    if (taste === null) {
      setTasteError("Veuillez noter le goût");
      isValid = false;
    } else {
      setTasteError("");
    }

    if (themeAdherence === null) {
      setThemeAdherenceError("Veuillez noter le respect du thème");
      isValid = false;
    } else {
      setThemeAdherenceError("");
    }

    if (!comment.trim()) {
      setCommentError("Veuillez ajouter un commentaire");
      isValid = false;
    } else if (comment.length < 10) {
      setCommentError("Le commentaire doit contenir au moins 10 caractères");
      isValid = false;
    } else {
      setCommentError("");
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await rateCake.mutateAsync({
        cakeId,
        rating: {
          cake_id: cakeId,
          appearance: appearance!,
          taste: taste!,
          theme_adherence: themeAdherence!,
          comment,
        },
      });
      handleSuccess("Votre note a été enregistrée avec succès !");
      onClose ? onClose() : navigate("/");

    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
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
    <Box sx={{
      p: { xs: 1, sm: 2 },
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <Typography variant="h5" gutterBottom align="center" sx={{
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
        mb: 1
      }}>
        {ratings?.some((r) => r.user_id === session?.session?.user?.id)
          ? "Modifier votre note"
          : "Noter le gâteau"}
      </Typography>

      <Box sx={{
        mb: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, sm: 3 }
      }}>
        <CardMedia
          component="img"
          height="300"
          image={cake.image_url}
          alt={cake.description}
          sx={{
            objectFit: "cover",
            borderRadius: 1,
            mb: 2,
            height: { xs: '200px', sm: '300px' }
          }}
        />
        <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Avatar
            src={cake.user?.avatar_url}
            alt={cake.user?.name}
            sx={{ width: 40, height: 40 }}
          />
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Gâteau réalisé par {cake.user?.name}
          </Typography>
        </Box>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
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
            alignSelf: { xs: 'center', sm: 'flex-start' }
          }}
        />
        {cake.week && (
          <Typography variant="body2" color="text.secondary" sx={{
            mt: 1,
            textAlign: { xs: 'center', sm: 'left' }
          }}>
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

      <Box component="form" onSubmit={handleSubmit} sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, sm: 3 }
      }}>
        <Stack spacing={3}>
          <CustomRating
            value={appearance}
            onChange={setAppearance}
            max={2.5}
            label="Apparence"
            error={!!appearanceError}
            helperText={appearanceError}
          />
          <CustomRating
            value={taste}
            onChange={setTaste}
            max={5}
            label="Goût"
            error={!!tasteError}
            helperText={tasteError}
          />
          <CustomRating
            value={themeAdherence}
            onChange={setThemeAdherence}
            max={2.5}
            label="Respect du thème"
            error={!!themeAdherenceError}
            helperText={themeAdherenceError}
          />
        </Stack>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Commentaire"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (commentTouched) {
              if (!e.target.value.trim()) {
                setCommentError("Veuillez ajouter un commentaire");
              } else if (e.target.value.length < 10) {
                setCommentError("Le commentaire doit contenir au moins 10 caractères");
              } else {
                setCommentError("");
              }
            }
          }}
          onBlur={() => setCommentTouched(true)}
          error={!!commentError}
          helperText={commentError}
          sx={{
            mt: 2,
            '& .MuiInputBase-root': {
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }
          }}
        />

        {totalScore !== null && (
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            Note totale : {totalScore.toFixed(1)}/10
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 2,
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Enregistrer la note"}
        </Button>
      </Box>
    </Box>
  );
}
