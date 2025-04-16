import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Créer un client avec le compte de service
const serviceClient = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_SERVICE_KEY
);

async function ensureAvatarsBucketExists() {
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');

    if (!avatarsBucket) {
        const { data, error } = await supabase.storage.createBucket('avatars', {
            public: true,
            fileSizeLimit: 1024 * 1024, // 1MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
        });

        if (error) {
            console.error('Error creating avatars bucket:', error);
            throw error;
        }
    }
}

export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar`;

    console.log('Uploading avatar with filename:', fileName);
    console.log('User ID:', userId);
    console.log('File extension:', fileExt);

    // Supprimer l'ancien avatar s'il existe
    const { error: deleteError } = await serviceClient.storage
        .from('avatars')
        .remove([`${userId}/avatar`]);

    if (deleteError && deleteError.message !== 'Object not found') {
        console.error('Error deleting old avatar:', deleteError);
    }

    // Uploader le nouvel avatar
    const { error: uploadError } = await serviceClient.storage
        .from('avatars')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        throw uploadError;
    }

    const { data } = serviceClient.storage
        .from('avatars')
        .getPublicUrl(fileName);

    return data.publicUrl;
}; 