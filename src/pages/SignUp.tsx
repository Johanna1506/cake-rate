import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@services/auth';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Stack,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (redirectCountdown !== null && redirectCountdown > 0) {
            const timer = setTimeout(() => {
                setRedirectCountdown(redirectCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (redirectCountdown === 0) {
            navigate('/login');
        }
    }, [redirectCountdown, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await auth.signUp(email, password, {
                data: {
                    name: name,
                }
            });

            if (error) {
                setError(error instanceof Error ? error.message : 'Une erreur est survenue');
            } else {
                setSuccess(true);
                setRedirectCountdown(5);
            }
        } catch (err) {
            setError('Une erreur inattendue est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleResendConfirmation = async () => {
        setResendLoading(true);
        try {
            const { error } = await auth.resendConfirmationEmail(email);
            if (error) {
                setError(error.message);
            } else {
                setError('Email de confirmation renvoyé avec succès!');
            }
        } catch (err) {
            setError('Une erreur est survenue lors de l\'envoi de l\'email de confirmation');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Inscription
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success ? (
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Compte créé avec succès !
                                </Typography>

                                {redirectCountdown !== null && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Redirection vers la page de connexion dans {redirectCountdown} secondes...
                                    </Typography>
                                )}
                            </Alert>
                            <Stack spacing={2}>
                                <Button
                                    variant="contained"
                                    onClick={handleResendConfirmation}
                                    disabled={resendLoading}
                                    startIcon={resendLoading ? <CircularProgress size={20} /> : null}
                                >
                                    {resendLoading ? 'Envoi en cours...' : "Renvoyer l'email de confirmation"}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/login')}
                                >
                                    Retour à la connexion
                                </Button>
                            </Stack>
                        </Box>
                    ) : (
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <Stack spacing={2}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Nom"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    margin="normal"
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    margin="normal"
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Mot de passe"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    margin="normal"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Stack>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 3 }}
                            >
                                {loading ? <CircularProgress size={24} /> : "S'inscrire"}
                            </Button>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={() => navigate('/login')}
                                sx={{ mt: 1 }}
                            >
                                Déjà un compte ? Se connecter
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}