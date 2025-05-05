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
  Paper,
  Fade,
  IconButton,
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
  ariaLabel: string;
  ariaDescribedBy?: string;
}

function CustomRating({
  value,
  onChange,
  max,
  label,
  error,
  helperText,
  ariaLabel,
  ariaDescribedBy,
}: CustomRatingProps) {
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
      <Typography
        component="legend"
        gutterBottom
        color={error ? "error" : "text.primary"}
      >
        {label} (sur {max})
      </Typography>
      <Rating
        value={displayValue}
        onChange={handleChange}
        size="large"
        precision={0.5}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />
      {value !== null && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Note : {value.toFixed(1)}/{max}
        </Typography>
      )}
      {error && helperText && (
        <Typography
          variant="caption"
          color="error"
          sx={{ display: "block", mt: 0.5 }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

function CakeHeader({ cake, userRating }: { cake: any; userRating: boolean }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        sx={{
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          mb: 2,
          fontWeight: 600,
          color: "primary.main",
        }}
      >
        {userRating ? "Modifier votre note" : "Noter le gâteau"}
      </Typography>

      <CardMedia
        component="img"
        image={cake.image_url}
        alt={cake.description}
        sx={{
          objectFit: "cover",
          borderRadius: 2,
          height: { xs: "200px", sm: "300px" },
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      />
    </Box>
  );
}

function CakeInfo({ cake }: { cake: any }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <IconButton
          onClick={() => cake.user?.id && navigate(`/profile/${cake.user.id}`)}
          sx={{ p: 0 }}
        >
          <Avatar
            src={cake.user?.avatar_url}
            alt={cake.user?.name}
            sx={{
              width: 40,
              height: 40,
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            {cake.user?.name?.[0] || "U"}
          </Avatar>
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: "1rem", sm: "1.1rem" },
            fontWeight: 500,
          }}
        >
          Gâteau réalisé par {cake.user?.name}
        </Typography>
      </Box>

      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontSize: { xs: "1.1rem", sm: "1.2rem" },
          fontWeight: 600,
          color: "text.primary",
          mb: 1,
        }}
      >
        {cake.name}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          lineHeight: 1.5,
          mb: 1.5,
        }}
      >
        {cake.description}
      </Typography>

      <Box>
        <Chip
          label={cake.week?.season?.theme}
          color="primary"
          sx={{
            fontWeight: 600,
            backgroundColor: "primary.main",
            color: "white",
            "& .MuiChip-label": {
              px: 2,
              py: 0.5,
            },
            alignSelf: { xs: "center", sm: "flex-start" },
            boxShadow: 1,
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        />
        {cake.week && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              textAlign: { xs: "center", sm: "left" },
              fontStyle: "italic",
            }}
          >
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
    </Box>
  );
}

function RatingForm({
  appearance,
  setAppearance,
  taste,
  setTaste,
  themeAdherence,
  setThemeAdherence,
  comment,
  setComment,
  commentError,
  setCommentError,
  commentTouched,
  setCommentTouched,
  totalScore,
  loading,
  handleSubmit,
  appearanceError,
  tasteError,
  themeAdherenceError,
}: {
  appearance: number | null;
  setAppearance: (value: number | null) => void;
  taste: number | null;
  setTaste: (value: number | null) => void;
  themeAdherence: number | null;
  setThemeAdherence: (value: number | null) => void;
  comment: string;
  setComment: (value: string) => void;
  commentError: string;
  setCommentError: (value: string) => void;
  commentTouched: boolean;
  setCommentTouched: (value: boolean) => void;
  totalScore: number | null;
  loading: boolean;
  handleSubmit: (event: React.FormEvent) => void;
  appearanceError: string;
  tasteError: string;
  themeAdherenceError: string;
}) {
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      role="form"
      aria-label="Formulaire de notation du gâteau"
    >
      <Stack spacing={2}>
        <CustomRating
          value={appearance}
          onChange={setAppearance}
          max={2.5}
          label="Apparence"
          error={!!appearanceError}
          helperText={appearanceError}
          ariaLabel="Noter l'apparence du gâteau"
          ariaDescribedBy={appearanceError ? "appearance-error" : undefined}
        />
        <CustomRating
          value={taste}
          onChange={setTaste}
          max={5}
          label="Goût"
          error={!!tasteError}
          helperText={tasteError}
          ariaLabel="Noter le goût du gâteau"
          ariaDescribedBy={tasteError ? "taste-error" : undefined}
        />
        <CustomRating
          value={themeAdherence}
          onChange={setThemeAdherence}
          max={2.5}
          label="Respect du thème"
          error={!!themeAdherenceError}
          helperText={themeAdherenceError}
          ariaLabel="Noter le respect du thème"
          ariaDescribedBy={themeAdherenceError ? "theme-error" : undefined}
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
              setCommentError(
                "Le commentaire doit contenir au moins 10 caractères"
              );
            } else {
              setCommentError("");
            }
          }
        }}
        onBlur={() => setCommentTouched(true)}
        error={!!commentError}
        helperText={commentError}
        aria-label="Ajouter un commentaire sur le gâteau"
        aria-describedby={commentError ? "comment-error" : undefined}
        sx={{
          "& .MuiInputBase-root": {
            fontSize: { xs: "0.875rem", sm: "1rem" },
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
      />

      {totalScore !== null && (
        <Typography
          variant="h6"
          align="center"
          sx={{
            color: "primary.main",
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.1rem" },
          }}
          role="status"
          aria-label="Note totale du gâteau"
        >
          Note totale : {totalScore.toFixed(1)}/10
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
        aria-label={
          loading
            ? "Enregistrement de la note en cours..."
            : "Enregistrer la note"
        }
        sx={{
          py: 1.5,
          fontSize: { xs: "0.875rem", sm: "1rem" },
          fontWeight: 600,
          borderRadius: 2,
          textTransform: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 3,
          },
        }}
      >
        {loading ? <CircularProgress size={24} /> : "Enregistrer la note"}
      </Button>
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

    if (comment.trim() && comment.length < 10) {
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
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  const userRating =
    ratings?.some((r) => r.user_id === session?.session?.user?.id) ?? false;

  return (
    <Fade in={true} timeout={500}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          maxWidth: "100%",
          overflow: "hidden",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <CakeHeader cake={cake} userRating={userRating} />
        <CakeInfo cake={cake} />
        <RatingForm
          appearance={appearance}
          setAppearance={setAppearance}
          taste={taste}
          setTaste={setTaste}
          themeAdherence={themeAdherence}
          setThemeAdherence={setThemeAdherence}
          comment={comment}
          setComment={setComment}
          commentError={commentError}
          setCommentError={setCommentError}
          commentTouched={commentTouched}
          setCommentTouched={setCommentTouched}
          totalScore={totalScore}
          loading={loading}
          handleSubmit={handleSubmit}
          appearanceError={appearanceError}
          tasteError={tasteError}
          themeAdherenceError={themeAdherenceError}
        />
      </Paper>
    </Fade>
  );
}
