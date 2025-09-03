import { supabaseServer } from "@lib/supabase";

export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string> => {
  const fileName = `${userId}/avatar`;


  // Supprimer l'ancien avatar s'il existe
  const { error: deleteError } = await supabaseServer.storage
    .from("avatars")
    .remove([`${userId}/avatar`]);

  if (deleteError && deleteError.message !== "Object not found") {
    console.error("Error deleting old avatar:", deleteError);
  }

  // Uploader le nouvel avatar
  const { error: uploadError } = await supabaseServer.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    throw uploadError;
  }

  const { data } = supabaseServer.storage.from("avatars").getPublicUrl(fileName);

  return data.publicUrl;
};
