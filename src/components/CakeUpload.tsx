import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@hooks/useAuthQuery';
import { useCurrentWeek } from '@hooks/useWeekQuery';
import { useQueryClient } from '@tanstack/react-query';
import { auth } from '@services/auth';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
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
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

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
        if (!file) return;

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            setLoading(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${session?.session?.user?.id}/${Math.random()}.${fileExt}`;
            const filePath = fileName;

            const { error: uploadError } = await supabaseServer.storage
                .from('cakes')
                .upload(filePath, file);

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

            setSuccess(true);
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
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
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
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
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
                    <Box sx={{ maxWidth: 345, mb: 3, position: 'relative' }}>
                        <Box
                            component="img"
                            height="194"
                            src={previewUrl}
                            alt="Preview"
                            sx={{ width: '100%', objectFit: 'cover' }}
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
                    </Box>
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

                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        fullWidth
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading || !file}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Ajouter le gâteau'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};