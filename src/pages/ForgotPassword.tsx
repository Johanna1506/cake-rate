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
    CircularProgress,
} from '@mui/material';

export function ForgotPassword() {
    const navigate = useNavigate();
    const { handleError, handleSuccess } = useErrorHandler();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);

    const validateForm = () => {
        let isValid = true;

        if (!email) {
            setEmailError('L\'adresse email est requise');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Format d\'adresse email invalide');
            isValid = false;
        } else {
            setEmailError('');
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
            const { error } = await auth.resetPassword(email);
            if (error) {
                handleError(error);
            } else {
                handleSuccess('Un email de réinitialisation a été envoyé à votre adresse email.');
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
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Mot de passe oublié
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }} align="center">
                        Entrez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <TextField
                            required
                            fullWidth
                            label="Adresse email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setEmailTouched(true)}
                            error={!!emailError && emailTouched}
                            helperText={emailTouched && emailError}
                            sx={{
                                mb: 2,
                                '& .MuiFormHelperText-root': {
                                    marginLeft: 0,
                                    marginRight: 0
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3 }}
                        >
                            {loading ? <CircularProgress size={24} /> : "Envoyer le lien de réinitialisation"}
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
            </Box>
        </Container>
    );
}