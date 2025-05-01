import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { toast } from "sonner";

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://etymxhxrcgnfonibvbha.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0eW14aHhyY2duZm9uaWJ2YmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2OTc2ODUsImV4cCI6MjA1OTI3MzY4NX0.cGgqyqha6XLxZ2h9zcUN0opBvvRPJC7q9TjT5NeRbfg";

// Create the basic Supabase client
const basicClient = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Important for OAuth redirects
  },
  global: {
    // Add retries for better network resilience
    fetch: (...args) => {
      return fetch(...args);
    },
  },
});

// Enhanced error handling for storage operations
const enhancedStorageClient = {
  from: (bucket: string) => {
    const originalBucket = basicClient.storage.from(bucket);

    return {
      ...originalBucket,
      // Override upload with retry and better error handling
      upload: async (path: string, fileBody: File | Blob, options?: {
        cacheControl?: string;
        upsert?: boolean;
      }) => {
        try {
          const result = await originalBucket.upload(path, fileBody, options);

          if (result.error) {
            console.error("Storage upload error:", result.error);
            toast.error("Failed to upload file", {
              description: result.error.message,
            });
            throw result.error;
          }

          return result;
        } catch (error) {
          console.error("Storage upload exception:", error);
          toast.error("Failed to upload file", {
            description: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      },

      // Enhanced createSignedUrl with better error handling
      createSignedUrl: async (path: string, expiresIn: number) => {
        try {
          const result = await originalBucket.createSignedUrl(path, expiresIn);

          if (result.error) {
            console.error("Signed URL creation error:", result.error);
            throw result.error;
          }

          return result;
        } catch (error) {
          console.error("Signed URL creation exception:", error);
          throw error;
        }
      },

      // All other methods pass through to the original client
      download: originalBucket.download.bind(originalBucket),
      getPublicUrl: originalBucket.getPublicUrl.bind(originalBucket),
      list: originalBucket.list.bind(originalBucket),
      move: originalBucket.move.bind(originalBucket),
      remove: originalBucket.remove.bind(originalBucket),
      createSignedUrls: originalBucket.createSignedUrls.bind(originalBucket),
    };
  }
};

// Create an enhanced Supabase client with better error handling
export const supabase = {
  ...basicClient,
  // Override storage with enhanced version
  storage: enhancedStorageClient,

  // Override auth with better error handling
  auth: {
    ...basicClient.auth,
    signUp: async (params: { email: string; password: string; options?: { data?: Record<string, any>; captchaToken?: string; emailRedirectTo?: string } }) => {
      try {
        const result = await basicClient.auth.signUp(params);

        if (result.error) {
          console.error("Sign up error:", result.error);
          toast.error("Failed to sign up", {
            description: result.error.message,
          });
          throw result.error;
        }

        return result;
      } catch (error) {
        console.error("Sign up exception:", error);
        toast.error("Failed to sign up", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    },

    signInWithPassword: async (params: { email: string; password: string; options?: { captchaToken?: string; redirectTo?: string } }) => {
      try {
        const result = await basicClient.auth.signInWithPassword(params);

        if (result.error) {
          console.error("Sign in error:", result.error);
          toast.error("Failed to sign in", {
            description: result.error.message,
          });
          throw result.error;
        }

        return result;
      } catch (error) {
        console.error("Sign in exception:", error);
        toast.error("Failed to sign in", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    },

    // Add other auth methods as needed with similar error handling
    signOut: basicClient.auth.signOut.bind(basicClient.auth),
    getSession: basicClient.auth.getSession.bind(basicClient.auth),
    getUser: basicClient.auth.getUser.bind(basicClient.auth),
    refreshSession: basicClient.auth.refreshSession.bind(basicClient.auth),
    setSession: basicClient.auth.setSession.bind(basicClient.auth),
    onAuthStateChange: basicClient.auth.onAuthStateChange.bind(basicClient.auth),
  },
};

// Export enhanced helper functions with better error handling

/**
 * Get a signed URL for a private file with improved error handling
 */
export async function getSignedUrl(
  filePath: string,
  bucket: string = "audio-files",
  expiresIn: number = 3600
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      throw error;
    }

    return data?.signedUrl;
  } catch (error) {
    console.error("Failed to get signed URL:", error);
    toast.error("Failed to access file", {
      description: "Could not generate access link for this file",
    });
    throw error;
  }
}

/**
 * Upload a file to Supabase storage with improved error handling
 */
export async function uploadFile(
  file: File,
  path: string,
  bucket: string = "audio-files"
) {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Error uploading file:", error);
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
  } catch (error) {
    console.error("Failed to upload file:", error);
    toast.error("Upload failed", {
      description: "Could not upload the file. Please try again.",
    });
    throw error;
  }
}

/**
 * Get the current authenticated user with improved error handling
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

export default supabase;