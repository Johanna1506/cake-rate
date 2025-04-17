import { createClient } from "@supabase/supabase-js";

// Créer un client avec le compte de service
const serviceClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY
);

export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/avatar`;

  console.log("Uploading avatar with filename:", fileName);
  console.log("User ID:", userId);
  console.log("File extension:", fileExt);

  // Supprimer l'ancien avatar s'il existe
  const { error: deleteError } = await serviceClient.storage
    .from("avatars")
    .remove([`${userId}/avatar`]);

  if (deleteError && deleteError.message !== "Object not found") {
    console.error("Error deleting old avatar:", deleteError);
  }

  // Uploader le nouvel avatar
  const { error: uploadError } = await serviceClient.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    throw uploadError;
  }

  const { data } = serviceClient.storage.from("avatars").getPublicUrl(fileName);

  return data.publicUrl;
};
