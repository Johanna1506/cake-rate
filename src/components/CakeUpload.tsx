import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@hooks/useAuthQuery';
import { useCurrentWeek } from '@hooks/useWeekQuery';
import { auth } from '@services/auth';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    CardMedia,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface CakeUploadProps {
    onClose?: () => void;
}

export const CakeUpload: React.FC<CakeUploadProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const { data: session } = useSession();
    const { data: currentWeek, isLoading: weekLoading, error: weekError } = useCurrentWeek();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!file || !currentWeek) return;

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            console.log('Session:', session);
            console.log('Current Week:', currentWeek);
            console.log('Is participant:', currentWeek.user_id === session?.session?.user?.id);

            const fileExt = file.name.split('.').pop();
            const fileName = `${session?.session?.user?.id}/${Math.random()}.${fileExt}`;
            const filePath = fileName;

            console.log('Uploading file:', filePath);

            const { error: uploadError } = await auth.supabase.storage
                .from('cakes')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = auth.supabase.storage
                .from('cakes')
                .getPublicUrl(filePath);

            console.log('Inserting cake with data:', {
                user_id: session?.session?.user?.id,
                week_id: currentWeek.id,
                image_url: publicUrl,
                description,
            });

            const { error: insertError } = await auth.supabase
                .from('cakes')
                .insert({
                    user_id: session?.session?.user?.id,
                    week_id: currentWeek.id,
                    image_url: publicUrl,
                    description,
                });

            if (insertError) {
                console.error('Insert error:', insertError);
                throw insertError;
            }

            setSuccess(true);
            setFile(null);
            setDescription('');
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            if (onClose) {
                onClose();
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error submitting cake:', error);
            setError('Une erreur est survenue lors de l\'enregistrement de votre gâteau');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!weekLoading && currentWeek && currentWeek.user_id !== session?.session?.user?.id) {
            navigate('/');
        }
    }, [currentWeek, session, weekLoading, navigate]);

    if (!session?.session?.user) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography>Vous devez être connecté pour ajouter un gâteau.</Typography>
            </Box>
        );
    }

    if (weekLoading) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (weekError) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <Alert severity="error">
                    Une erreur est survenue lors du chargement de la semaine en cours.
                </Alert>
            </Box>
        );
    }

    if (!currentWeek) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <Alert severity="info">
                    Aucune semaine active en cours.
                </Alert>
            </Box>
        );
    }

    if (currentWeek.user_id !== session.session.user.id) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <Alert severity="warning">
                    Vous n'êtes pas le participant de la semaine en cours.
                </Alert>
            </Box>
        );
    }

    return (
        <Card sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
            <CardContent>
                <Typography variant="h4" gutterBottom align="center">
                    Ajouter votre gâteau
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="cake-image"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="cake-image">
                            <Button variant="contained" component="span">
                                Sélectionner une photo
                            </Button>
                        </label>
                    </Box>

                    {previewUrl && (
                        <Card sx={{ maxWidth: 345, mb: 3, position: 'relative' }}>
                            <CardMedia
                                component="img"
                                height="194"
                                image={previewUrl}
                                alt="Preview"
                            />
                            <IconButton
                                onClick={handleRemoveFile}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    },
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Card>
                    )}

                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Le gâteau a été ajouté avec succès !
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting || !file}
                        fullWidth
                        sx={{ mb: 3 }}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Ajouter le gâteau'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}; 