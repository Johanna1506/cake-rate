import { useState, useEffect } from 'react';
import { useUserDetails, useUpdateUser, useSession } from '@hooks/useAuthQuery';
import { uploadAvatar } from '@services/storage';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
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

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (userDetails) {
            setName(userDetails.name || '');
            setEmail(userDetails.email || '');
            setAvatarUrl(userDetails.avatar_url || null);
        }
    }, [userDetails]);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatar(file);
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
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

            setSuccessMessage('Profil mis à jour avec succès');
            setIsEditing(false);
        } catch (error) {
            setErrorMessage('Erreur lors de la mise à jour du profil');
            console.error(error);
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
                <Alert severity="error">
                    Erreur lors du chargement du profil
                </Alert>
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
                    {!isEditing ? (
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

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setIsEditing(true)}
                                sx={{ mt: 3 }}
                                fullWidth
                            >
                                Modifier
                            </Button>
                        </>
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
                                fullWidth
                                variant="outlined"
                            />

                            <TextField
                                label="Email"
                                value={email}
                                disabled
                                fullWidth
                                variant="outlined"
                            />

                            {errorMessage && (
                                <Alert severity="error">{errorMessage}</Alert>
                            )}

                            {successMessage && (
                                <Alert severity="success">{successMessage}</Alert>
                            )}

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => setIsEditing(false)}
                                    fullWidth
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={updateUser.isPending}
                                    fullWidth
                                >
                                    {updateUser.isPending ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        'Enregistrer'
                                    )}
                                </Button>
                            </Box>
                        </Form>
                    )}
                </StyledCardContent>
            </StyledCard>
        </StyledContainer>
    );
} 