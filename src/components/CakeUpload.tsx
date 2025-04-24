import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@hooks/useAuthQuery';
import { useCurrentWeek } from '@hooks/useWeekQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from '@hooks/useErrorHandler';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabaseServer } from "@lib/supabase";

interface CakeUploadProps {
    onClose?: () => void;
    weekId: string;
}

export const CakeUpload: React.FC<CakeUploadProps> = ({ onClose, weekId }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const { data: currentWeek, isLoading: weekLoading, error: weekError } = useCurrentWeek();
    const { handleError, handleSuccess } = useErrorHandler();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [descriptionTouched, setDescriptionTouched] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        let isValid = true;

        if (!file) {
            handleError('Veuillez sélectionner une photo');
            isValid = false;
        }

        if (!description.trim()) {
            setDescriptionError('La description est requise');
            isValid = false;
        } else if (description.length < 10) {
            setDescriptionError('La description doit contenir au moins 10 caractères');
            isValid = false;
        } else {
            setDescriptionError('');
        }

        return isValid;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            // Vérifier la taille du fichier (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                handleError('L\'image ne doit pas dépasser 5MB');
                return;
            }

            // Vérifier le type de fichier
            if (!selectedFile.type.startsWith('image/')) {
                handleError('Le fichier doit être une image');
                return;
            }

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

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const fileExt = file!.name.split('.').pop();
            const fileName = `${session?.session?.user?.id}/${Math.random()}.${fileExt}`;
            const filePath = fileName;

            const { error: uploadError } = await supabaseServer.storage
                .from('cakes')
                .upload(filePath, file!);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabaseServer.storage
                .from('cakes')
                .getPublicUrl(filePath);

            const { error: insertError } = await supabaseServer
                .from('cakes')
                .insert({
                    user_id: session?.session?.user?.id,
                    week_id: weekId,
                    image_url: publicUrl,
                    description,
                });

            if (insertError) throw insertError;

            // Rafraîchir les données
            await queryClient.invalidateQueries({ queryKey: ['cakes'] });
            await queryClient.invalidateQueries({ queryKey: ['weekCake'] });
            await queryClient.invalidateQueries({ queryKey: ['currentSeason'] });

            handleSuccess('Le gâteau a été ajouté avec succès !');
            setFile(null);
            setDescription('');
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }

            if (onClose) {
                onClose();
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
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
                <Typography color="error">
                    Une erreur est survenue lors du chargement de la semaine en cours.
                </Typography>
            </Box>
        );
    }

    if (!currentWeek) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography color="info">
                    Aucune semaine active en cours.
                </Typography>
            </Box>
        );
    }

    if (currentWeek.user_id !== session.session.user.id) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography color="warning">
                    Vous n'êtes pas le participant de la semaine en cours.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            maxWidth: 600,
            mx: 'auto',
            p: { xs: 2, sm: 3 },
            width: '100%'
        }}>
            <Typography variant="h4" gutterBottom align="center" sx={{
                fontSize: { xs: '1.5rem', sm: '2rem' },
                mb: { xs: 2, sm: 3 }
            }}>
                Ajouter votre gâteau
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{
                mt: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 2, sm: 3 }
            }} role="form" aria-label="Formulaire d'ajout de gâteau">
                <Box sx={{
                    mb: { xs: 2, sm: 3 },
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="cake-image"
                        type="file"
                        onChange={handleFileChange}
                        aria-label="Sélectionner une photo de gâteau"
                    />
                    <label htmlFor="cake-image">
                        <Button
                            variant="contained"
                            component="span"
                            sx={{
                                py: { xs: 1, sm: 1.5 },
                                px: { xs: 2, sm: 3 },
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            Sélectionner une photo
                        </Button>
                    </label>
                </Box>

                {previewUrl && (
                    <Box sx={{
                        maxWidth: { xs: '100%', sm: 345 },
                        mb: { xs: 2, sm: 3 },
                        position: 'relative',
                        mx: 'auto',
                        width: '100%'
                    }} role="img" aria-label="Aperçu de la photo du gâteau">
                        <Box
                            component="img"
                            src={previewUrl}
                            alt="Aperçu de la photo du gâteau"
                            sx={{
                                width: '100%',
                                height: { xs: '200px', sm: '300px' },
                                objectFit: 'cover',
                                borderRadius: 1
                            }}
                        />
                        <IconButton
                            onClick={handleRemoveFile}
                            aria-label="Supprimer la photo"
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                },
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 }
                            }}
                        >
                            <DeleteIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                        </IconButton>
                    </Box>
                )}

                <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value);
                        if (descriptionTouched) {
                            if (!e.target.value.trim()) {
                                setDescriptionError('La description est requise');
                            } else if (e.target.value.length < 10) {
                                setDescriptionError('La description doit contenir au moins 10 caractères');
                            } else {
                                setDescriptionError('');
                            }
                        }
                    }}
                    onBlur={() => setDescriptionTouched(true)}
                    error={!!descriptionError}
                    helperText={descriptionError}
                    sx={{
                        '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                    }}
                />

                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    mt: 2,
                    flexDirection: { xs: 'column-reverse', sm: 'row' }
                }}>
                    {onClose && (
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            fullWidth
                            disabled={loading}
                            aria-label="Annuler l'ajout du gâteau"
                            sx={{
                                py: { xs: 1, sm: 1.5 },
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            Annuler
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        aria-label={loading ? "Ajout du gâteau en cours..." : "Ajouter le gâteau"}
                        sx={{
                            py: { xs: 1, sm: 1.5 },
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Ajouter le gâteau"}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};