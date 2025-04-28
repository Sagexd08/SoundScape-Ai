import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://etymxhxrcgnfonibvbha.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0eW14aHhyY2duZm9uaWJ2YmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2OTc2ODUsImV4cCI6MjA1OTI3MzY4NX0.cGgqyqha6XLxZ2h9zcUN0opBvvRPJC7q9TjT5NeRbfg";

// Create a Supabase client for server components
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
  },
});

// Create a Supabase client for client components
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      flowType: 'pkce',
    },
  });
};

/**
 * Get a signed URL for a private file
 * @param filePath Path to the file in the storage bucket
 * @param bucket Storage bucket name (default: 'audio-files')
 * @param expiresIn Expiration time in seconds (default: 3600)
 * @returns Signed URL for the file
 */
export async function getSignedUrl(
  filePath: string,
  bucket: string = "audio-files",
  expiresIn: number = 3600
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error("Error creating signed URL:", error.message);
    throw error;
  }

  return data?.signedUrl;
}

/**
 * Upload a file to Supabase storage
 * @param file File to upload
 * @param path Path in the storage bucket where the file should be stored
 * @param bucket Storage bucket name (default: 'audio-files')
 * @returns Upload result containing the file's URL
 */
export async function uploadFile(
  file: File,
  path: string,
  bucket: string = "audio-files"
) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Error uploading file:", error.message);
    throw error;
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    ...data,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Upload an audio file and generate waveform
 * @param file Audio file to upload
 * @param metadata Metadata for the audio file
 * @returns Upload result with file metadata
 */
export async function uploadAudioWithMetadata(
  file: File,
  metadata: {
    title: string;
    description?: string;
    isPublic?: boolean;
    tags?: string[];
  }
) {
  // Generate a unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  // Upload the file
  const uploadResult = await uploadFile(file, filePath);

  // Create the database entry
  const { data, error } = await supabase.from("audio_files").insert({
    filename: fileName,
    title: metadata.title,
    description: metadata.description || "",
    is_public: metadata.isPublic || false,
    storage_path: filePath,
    tags: metadata.tags || [],
  }).select();

  if (error) {
    console.error("Error creating audio file entry:", error.message);
    // Try to delete the uploaded file to avoid orphaned files
    await supabase.storage.from("audio-files").remove([filePath]);
    throw error;
  }

  return {
    upload: uploadResult,
    metadata: data[0],
  };
}

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting current user:", error.message);
    return null;
  }

  return user;
}

/**
 * Get the user profile data
 * @param userId User ID (defaults to current user)
 * @returns User profile data
 */
export async function getUserProfile(userId?: string) {
  // If no userId provided, get the current user
  if (!userId) {
    const user = await getCurrentUser();
    userId = user?.id;
  }

  if (!userId) {
    throw new Error("No user ID provided and no current user");
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error getting user profile:", error.message);
    throw error;
  }

  return data;
}

export default supabase;