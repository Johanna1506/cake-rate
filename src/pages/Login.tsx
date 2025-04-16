import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignIn } from '@hooks/useAuthQuery';
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
    Link as MuiLink,
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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        try {
            await signIn.mutateAsync({ email, password });
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de la connexion');
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
                        />
                        <TextField
                            fullWidth
                            label="Mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
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
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
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
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <MuiLink
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/signup')}
                            >
                                Créer un compte
                            </MuiLink>
                        </Stack>
                    </StyledForm>
                </StyledPaper>
            </Box>
        </Container>
    );
} 