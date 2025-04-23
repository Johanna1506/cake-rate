import { useState, useEffect } from 'react';
import { useUserDetails, useUpdateUser, useSession, useUpdatePassword } from '@hooks/useAuthQuery';
import { uploadAvatar } from '@services/storage';
import { useErrorHandler } from '@hooks/useErrorHandler';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    width: '100%',
    maxWidth: 500,
    marginTop: theme.spacing(4),
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const Form = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const AvatarContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const StyledAvatar = styled(Avatar)({
    width: 120,
    height: 120,
    fontSize: '3rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '4px solid white',
});

const InfoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

const InfoRow = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

export function Profile() {
    const { data: session } = useSession();
    const userId = session?.session?.user?.id;
    const { data: userDetails, isLoading, error } = useUserDetails(userId || '');
    const updateUser = useUpdateUser();
    const updatePassword = useUpdatePassword();
    const { handleError, handleSuccess } = useErrorHandler();

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
    const [nameTouched, setNameTouched] = useState(false);
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (userDetails) {
            setName(userDetails.name || '');
            setEmail(userDetails.email || '');
            setAvatarUrl(userDetails.avatar_url || null);
        }
    }, [userDetails]);

    const validateForm = () => {
        let isValid = true;

        if (!name.trim()) {
            setNameError('Le nom est requis');
            isValid = false;
        } else if (name.length < 2) {
            setNameError('Le nom doit contenir au moins 2 caractères');
            isValid = false;
        } else {
            setNameError('');
        }

        return isValid;
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Vérifier la taille du fichier (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                handleError('L\'image ne doit pas dépasser 2MB');
                return;
            }

            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                handleError('Le fichier doit être une image');
                return;
            }

            setAvatar(file);
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
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

            handleSuccess('Profil mis à jour avec succès');
            setIsEditing(false);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setPasswordError('');

        if (newPassword !== confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            setLoading(true);
            await updatePassword.mutateAsync({
                currentPassword,
                newPassword
            });
            handleSuccess('Mot de passe mis à jour avec succès');
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
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
        return '?';
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
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
            <Typography variant="h4" gutterBottom>
                Mon Profil
            </Typography>

            <StyledCard elevation={3}>
                <StyledCardContent>
                    {!isEditing && !isChangingPassword ? (
                        <>
                            <AvatarContainer>
                                <StyledAvatar
                                    src={avatarUrl || undefined}
                                    alt={userDetails?.name || session?.session?.user?.email || ''}
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
                                        {userDetails?.name || 'Non renseigné'}
                                    </Typography>
                                </InfoRow>

                                <InfoRow>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1">
                                        {userDetails?.email}
                                    </Typography>
                                </InfoRow>

                                <InfoRow>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Rôle
                                    </Typography>
                                    <Typography variant="body1">
                                        {userDetails?.role}
                                    </Typography>
                                </InfoRow>
                            </InfoContainer>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
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
                        </>
                    ) : isChangingPassword ? (
                        <Form onSubmit={handlePasswordSubmit}>
                            <Typography variant="h6" gutterBottom>
                                Changer le mot de passe
                            </Typography>

                            <TextField
                                label="Mot de passe actuel"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                fullWidth
                                variant="outlined"
                                required
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                label="Nouveau mot de passe"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                fullWidth
                                variant="outlined"
                                required
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                label="Confirmer le nouveau mot de passe"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                fullWidth
                                variant="outlined"
                                required
                                error={!!passwordError}
                                helperText={passwordError}
                                sx={{ mb: 3 }}
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
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
                                    {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
                                </Button>
                            </Box>
                        </Form>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <AvatarContainer>
                                <StyledAvatar
                                    src={avatarUrl || undefined}
                                    alt={userDetails?.name || session?.session?.user?.email || ''}
                                >
                                    {!avatarUrl && getInitials()}
                                </StyledAvatar>
                                <input
                                    accept="image/*"
                                    type="file"
                                    id="avatar-upload"
                                    hidden
                                    onChange={handleAvatarChange}
                                />
                                <label htmlFor="avatar-upload">
                                    <Button variant="outlined" component="span">
                                        Changer l'avatar
                                    </Button>
                                </label>
                            </AvatarContainer>

                            <TextField
                                label="Nom"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => setNameTouched(true)}
                                error={!!nameError && nameTouched}
                                helperText={nameTouched && nameError}
                                fullWidth
                                variant="outlined"
                                sx={{
                                    '& .MuiFormHelperText-root': {
                                        marginLeft: 0,
                                        marginRight: 0
                                    }
                                }}
                            />

                            <TextField
                                label="Email"
                                value={email}
                                disabled
                                fullWidth
                                variant="outlined"
                            />

                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
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
                                    {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
                                </Button>
                            </Box>
                        </Form>
                    )}
                </StyledCardContent>
            </StyledCard>
        </StyledContainer>
    );
}