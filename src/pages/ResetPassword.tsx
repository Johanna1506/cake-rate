import { useState } from 'react';
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

export function ResetPassword() {
    const navigate = useNavigate();
    const { handleError, handleSuccess } = useErrorHandler();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

    const validateForm = () => {
        let isValid = true;

        if (!password) {
            setPasswordError('Le mot de passe est requis');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (!confirmPassword) {
            setConfirmPasswordError('La confirmation du mot de passe est requise');
            isValid = false;
        } else if (confirmPassword !== password) {
            setConfirmPasswordError('Les mots de passe ne correspondent pas');
            isValid = false;
        } else {
            setConfirmPasswordError('');
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
            const { error } = await auth.updatePassword(password);
            if (error) {
                handleError(error);
            } else {
                handleSuccess('Mot de passe mis à jour avec succès !');
                navigate('/login');
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Réinitialisation du mot de passe
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Stack spacing={2}>
                            <TextField
                                required
                                fullWidth
                                label="Nouveau mot de passe"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setPasswordTouched(true)}
                                error={!!passwordError && passwordTouched}
                                helperText={passwordTouched && passwordError}
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
                            <TextField
                                required
                                fullWidth
                                label="Confirmer le mot de passe"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onBlur={() => setConfirmPasswordTouched(true)}
                                error={!!confirmPasswordError && confirmPasswordTouched}
                                helperText={confirmPasswordTouched && confirmPasswordError}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                            {loading ? <CircularProgress size={24} /> : "Réinitialiser le mot de passe"}
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/login')}
                            sx={{ mt: 1 }}
                        >
                            Retour à la connexion
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}