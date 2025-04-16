import { Container, Typography, Box } from '@mui/material';
import { CakeUpload } from '../components/CakeUpload';
import { useCurrentWeek } from '@hooks/useWeekQuery';
import { useSession } from '@hooks/useAuthQuery';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function UploadCake() {
    const { data: session } = useSession();
    const { data: currentWeek, isLoading } = useCurrentWeek();
    const navigate = useNavigate();

    useEffect(() => {
        // Vérifier si l'utilisateur est le participant de la semaine
        if (!isLoading && currentWeek && currentWeek.user_id !== session?.session?.user?.id) {
            navigate('/');
        }
    }, [currentWeek, session, isLoading, navigate]);

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography>Chargement...</Typography>
            </Container>
        );
    }

    if (!currentWeek) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography>Aucune semaine active en cours.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Ajouter votre gâteau
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                    Thème de la semaine : {currentWeek.theme}
                </Typography>
            </Box>

            <CakeUpload />
        </Container>
    );
} 