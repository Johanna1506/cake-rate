import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@services/auth';
import { useErrorHandler } from '@hooks/useErrorHandler';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    CircularProgress,
    Stack,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export function SignUp() {
    const navigate = useNavigate();
    const { handleError, handleSuccess } = useErrorHandler();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Validation states
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [nameTouched, setNameTouched] = useState(false);

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

    const validateForm = () => {
        let isValid = true;

        if (!name) {
            setNameError('Le nom est requis');
            isValid = false;
        } else {
            setNameError('');
        }

        if (!email) {
            setEmailError('L\'adresse email est requise');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Format d\'adresse email invalide');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Le mot de passe est requis');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const { error } = await auth.signUp(email, password, {
                data: {
                    name: name,
                }
            });

            if (error) {
                handleError(error);
            } else {
                setSuccess(true);
                handleSuccess('Compte créé avec succès !');
                setRedirectCountdown(5);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResendConfirmation = async () => {
        setResendLoading(true);
        try {
            const { error } = await auth.resendConfirmationEmail(email);
            if (error) {
                handleError(error);
            } else {
                handleSuccess('Email de confirmation renvoyé avec succès !');
            }
        } catch (err) {
            handleError(err);
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
                    {success ? (
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="success.main" sx={{ mb: 2 }}>
                                Compte créé avec succès !
                            </Typography>

                            {redirectCountdown !== null && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Redirection vers la page de connexion dans {redirectCountdown} secondes...
                                </Typography>
                            )}
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
                                    onBlur={() => setNameTouched(true)}
                                    error={!!nameError && nameTouched}
                                    helperText={nameTouched && nameError}
                                    margin="normal"
                                    sx={{
                                        '& .MuiFormHelperText-root': {
                                            marginLeft: 0,
                                            marginRight: 0
                                        }
                                    }}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => setEmailTouched(true)}
                                    error={!!emailError && emailTouched}
                                    helperText={emailTouched && emailError}
                                    margin="normal"
                                    sx={{
                                        '& .MuiFormHelperText-root': {
                                            marginLeft: 0,
                                            marginRight: 0
                                        }
                                    }}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Mot de passe"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => setPasswordTouched(true)}
                                    error={!!passwordError && passwordTouched}
                                    helperText={passwordTouched && passwordError}
                                    margin="normal"
                                    sx={{
                                        '& .MuiFormHelperText-root': {
                                            marginLeft: 0,
                                            marginRight: 0
                                        }
                                    }}
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