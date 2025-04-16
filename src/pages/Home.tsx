import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDetails } from '@hooks/useAuthQuery';
import { useCurrentWeek, useWeekCake } from '@hooks/useWeekQuery';
import { useCakeRatings } from '@hooks/useCakeQuery';
import { CakeUpload } from '@components/CakeUpload';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSession } from '../hooks/useAuthQuery';

export function Home() {
    const navigate = useNavigate();
    const { data: currentWeek, isLoading: weekLoading, error: weekError } = useCurrentWeek();
    const { data: userDetails } = useUserDetails(currentWeek?.user_id || '');
    const { data: weekCake, isLoading: cakeLoading } = useWeekCake(currentWeek?.id);
    const { data: ratings } = useCakeRatings(weekCake?.id);
    const [showUpload, setShowUpload] = useState(false);
    const { data: session } = useSession();

    if (weekLoading || cakeLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (weekError) {
        return (
            <Container maxWidth="md">
                <Alert severity="error" sx={{ mt: 4 }}>
                    Une erreur est survenue lors du chargement de la semaine en cours.
                </Alert>
            </Container>
        );
    }

    if (!currentWeek) {
        return (
            <Container maxWidth="md">
                <Alert severity="info" sx={{ mt: 4 }}>
                    Aucune semaine n'est active pour le moment.
                </Alert>
            </Container>
        );
    }

    const isParticipant = session?.session?.user?.id === currentWeek.user_id;
    const hasRated = ratings?.some(rating => rating.user_id === session?.session?.user?.id);
    const startDate = format(new Date(currentWeek.start_date), 'dd MMMM yyyy', { locale: fr });
    const endDate = format(new Date(currentWeek.end_date), 'dd MMMM yyyy', { locale: fr });

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Card sx={{ mt: 2 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" component="h1">
                                Semaine en cours
                            </Typography>
                            <Chip
                                label={currentWeek.theme}
                                color="primary"
                                sx={{
                                    fontWeight: 'bold',
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '& .MuiChip-label': {
                                        px: 2,
                                    }
                                }}
                            />
                        </Box>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            Du {startDate} au {endDate}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            {currentWeek.description}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            Participant : {userDetails?.name || 'Non assigné'}
                        </Typography>

                        {isParticipant && !weekCake && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setShowUpload(true)}
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Ajouter votre gâteau
                            </Button>
                        )}

                        {weekCake && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Gâteau de la semaine :
                                </Typography>
                                <CardMedia
                                    component="img"
                                    image={weekCake.image_url}
                                    alt={weekCake.description}
                                    sx={{ height: 200, objectFit: 'cover', borderRadius: 1 }}
                                />
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {weekCake.description}
                                </Typography>
                                {!isParticipant && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => navigate(`/rate/${weekCake.id}`)}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    >
                                        {hasRated ? 'Modifier ma note' : 'Noter ce gâteau'}
                                    </Button>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {showUpload && (
                <CakeUpload onClose={() => setShowUpload(false)} />
            )}
        </Container>
    );
}
