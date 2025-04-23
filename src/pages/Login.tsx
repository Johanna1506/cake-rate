import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignIn } from '@hooks/useAuthQuery';
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
import { styled } from '@mui/material/styles';
import { VisibilityOff, Visibility } from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 400,
    margin: '0 auto',
}));

const StyledForm = styled('form')(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
}));

export function Login() {
    const navigate = useNavigate();
    const signIn = useSignIn();
    const { handleError, handleSuccess } = useErrorHandler();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await signIn.mutateAsync({ email, password });
            handleSuccess('Connexion réussie !');
            navigate('/');
        } catch (err) {
            handleError(err);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <StyledPaper>
                    <Typography component="h1" variant="h5">
                        Connexion
                    </Typography>
                    <StyledForm onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Adresse email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setEmailTouched(true)}
                            error={!!emailError && emailTouched}
                            helperText={emailTouched && emailError}
                            sx={{
                                mb: 1,
                                '& .MuiFormHelperText-root': {
                                    marginLeft: 0,
                                    marginRight: 0
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => setPasswordTouched(true)}
                            margin="normal"
                            required
                            error={!!passwordError && passwordTouched}
                            helperText={passwordTouched && passwordError}
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

                        <StyledButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={signIn.isPending}
                        >
                            {signIn.isPending ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Se connecter'
                            )}
                        </StyledButton>
                        <Stack direction="column" justifyContent="center">
                            <Button
                                fullWidth
                                variant="text"
                                onClick={() => navigate('/signup')}
                            >
                                Créer un compte
                            </Button>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={() => navigate('/forgot-password')}
                            >
                                Mot de passe oublié ?
                            </Button>
                        </Stack>
                    </StyledForm>
                </StyledPaper>
            </Box>
        </Container>
    );
}