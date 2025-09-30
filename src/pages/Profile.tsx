import { useState, useEffect } from "react";
import {
  useUserDetails,
  useUpdateUser,
  useSession,
  useUpdatePassword,
} from "@hooks/useAuthQuery";
import { useUserAchievements } from "@hooks/useAchievements";
import { uploadAvatar } from "@services/storage";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { useParams } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChangeEvent, FormEvent } from "react";
import { AchievementList } from "@components/AchievementList";

const AVATAR_MAX_SIZE_MB = 0.5;
const AVATAR_MAX_SIZE_BYTES = AVATAR_MAX_SIZE_MB * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
})) as typeof Container;

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 500,
  marginTop: theme.spacing(4),
})) as typeof Card;

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
})) as typeof CardContent;

const StyledForm = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
})) as typeof Box;

const AvatarContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
})) as typeof Box;

const StyledAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  fontSize: "3rem",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  border: "4px solid white",
  backgroundColor: "primary.main",
}) as typeof Avatar;

const InfoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
})) as typeof Box;

const InfoRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}) as typeof Box;

export function Profile() {
  const { userId: urlUserId } = useParams();
  const { data: session } = useSession();
  const currentUserId = session?.session?.user?.id;
  const userId = urlUserId || currentUserId;
  const isOwnProfile = userId === currentUserId;
  const { data: userDetails, isLoading, error } = useUserDetails(userId || "");
  const { data: achievements } = useUserAchievements(userId);
  const updateUser = useUpdateUser();
  const updatePassword = useUpdatePassword();
  const { handleError, handleSuccess } = useErrorHandler();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (userDetails) {
      setName(userDetails.name || "");
      setEmail(userDetails.email || "");
      setAvatarUrl(userDetails.avatar_url || null);
    }
  }, [userDetails]);

  const validateForm = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError("Le nom est requis");
      isValid = false;
    } else if (name.length < 2) {
      setNameError("Le nom doit contenir au moins 2 caractères");
      isValid = false;
    } else {
      setNameError("");
    }

    return isValid;
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier
      if (file.size > AVATAR_MAX_SIZE_BYTES) {
        handleError(`L'image ne doit pas dépasser ${AVATAR_MAX_SIZE_MB}MB`);
        return;
      }

      // Vérifier le type de fichier
      if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
        handleError(
          "Format d'image non supporté. Utilisez JPG, PNG, GIF ou WEBP"
        );
        return;
      }

      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      let avatarUrlToUpdate = avatarUrl;
      if (avatar && userId) {
        avatarUrlToUpdate = await uploadAvatar(avatar, userId);
      }
      if (userId) {
        await updateUser.mutateAsync({
          id: userId,
          name,
          avatar_url: avatarUrlToUpdate,
        });
      }

      handleSuccess("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      setLoading(true);
      await updatePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
      handleSuccess("Mot de passe mis à jour avec succès");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (userDetails?.name) {
      return userDetails.name.charAt(0).toUpperCase();
    }
    if (session?.session?.user?.email) {
      return session.session.user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <Typography color="error">
          Erreur lors du chargement du profil
        </Typography>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledCard elevation={3}>
        <StyledCardContent>
          {!isEditing && !isChangingPassword ? (
            <>
              <AvatarContainer>
                <StyledAvatar
                  src={avatarUrl || undefined}
                  alt={userDetails?.name || session?.session?.user?.email || ""}
                >
                  {!avatarUrl && getInitials()}
                </StyledAvatar>
              </AvatarContainer>

              <InfoContainer>
                <InfoRow>
                  <Typography variant="subtitle1" color="text.secondary">
                    Nom
                  </Typography>
                  <Typography variant="body1">
                    {userDetails?.name || "Non renseigné"}
                  </Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle1" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{userDetails?.email}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle1" color="text.secondary">
                    Rôle
                  </Typography>
                  <Typography variant="body1">{userDetails?.role}</Typography>
                </InfoRow>
              </InfoContainer>

              {achievements && achievements.length > 0 && (
                <AchievementList
                  achievements={achievements}
                  title="🏆 Récompenses"
                  showSeason={true}
                  variant="full"
                />
              )}

              {isOwnProfile && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 3,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsEditing(true)}
                    fullWidth
                  >
                    Modifier le profil
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setIsChangingPassword(true)}
                    fullWidth
                  >
                    Changer le mot de passe
                  </Button>
                </Box>
              )}
            </>
          ) : isChangingPassword ? (
            <StyledForm component="form" onSubmit={handlePasswordSubmit}>
              <Typography variant="h6" gutterBottom>
                Changer le mot de passe
              </Typography>

              <TextField
                label="Mot de passe actuel"
                type="password"
                value={currentPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCurrentPassword(e.target.value)
                }
                fullWidth
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />

              <TextField
                label="Nouveau mot de passe"
                type="password"
                value={newPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
                fullWidth
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />

              <TextField
                label="Confirmer le nouveau mot de passe"
                type="password"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                fullWidth
                variant="outlined"
                required
                error={!!passwordError}
                helperText={passwordError}
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setIsChangingPassword(false)}
                  fullWidth
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Enregistrer"}
                </Button>
              </Box>
            </StyledForm>
          ) : (
            <StyledForm component="form" onSubmit={handleSubmit}>
              <AvatarContainer>
                <StyledAvatar
                  src={avatarUrl || undefined}
                  alt={userDetails?.name || session?.session?.user?.email || ""}
                >
                  {!avatarUrl && getInitials()}
                </StyledAvatar>
                <Box
                  component="input"
                  accept="image/*"
                  type="file"
                  id="avatar-upload"
                  sx={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <Box
                  component="label"
                  htmlFor="avatar-upload"
                  sx={{ cursor: "pointer" }}
                >
                  <Button variant="outlined" component="span">
                    Changer l'avatar
                  </Button>
                </Box>
              </AvatarContainer>

              <TextField
                label="Nom"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                onBlur={() => setNameTouched(true)}
                error={!!nameError && nameTouched}
                helperText={nameTouched && nameError}
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiFormHelperText-root": {
                    marginLeft: 0,
                    marginRight: 0,
                  },
                }}
              />

              <TextField
                label="Email"
                value={email}
                disabled
                fullWidth
                variant="outlined"
              />

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  fullWidth
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Enregistrer"}
                </Button>
              </Box>
            </StyledForm>
          )}
        </StyledCardContent>
      </StyledCard>
    </StyledContainer>
  );
}
