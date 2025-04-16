/**
 * SoundScape-AI Supabase Deployment Script
 * 
 * This script initializes your Supabase project with the necessary
 * tables, storage buckets, and authentication settings.
 */

require('dotenv').config();
const { execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Supabase service role key for admin operations
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Validation of environment variables
if (!SUPABASE_URL || !SUPABASE_API_KEY || !SUPABASE_JWT_SECRET) {
  console.error('ERROR: Missing Supabase credentials. Please set the SUPABASE_URL, SUPABASE_API_KEY, and SUPABASE_JWT_SECRET environment variables.');
  process.exit(1);
}

// Headers for Supabase REST API calls
const headers = {
  'apikey': SUPABASE_API_KEY,
  'Authorization': `Bearer ${SUPABASE_API_KEY}`,
  'Content-Type': 'application/json'
};

/**
 * Create storage buckets
 */
async function createStorageBuckets() {
  console.log('Creating storage buckets...');
  
  const buckets = [
    { name: 'audio-files', public: false },
    { name: 'waveform-images', public: true },
    { name: 'profile-images', public: true }
  ];
  
  try {
    // Get existing buckets
    const response = await axios.get(
      `${SUPABASE_URL}/storage/v1/bucket`, 
      { headers }
    );
    
    const existingBuckets = response.data.map(bucket => bucket.name);
    
    // Create any missing buckets
    for (const bucket of buckets) {
      if (!existingBuckets.includes(bucket.name)) {
        console.log(`Creating bucket: ${bucket.name}`);
        
        await axios.post(
          `${SUPABASE_URL}/storage/v1/bucket`,
          { name: bucket.name, public: bucket.public },
          { headers }
        );
      } else {
        console.log(`Bucket already exists: ${bucket.name}`);
      }
    }
    
    console.log('Storage buckets created successfully');
    return true;
  } catch (error) {
    console.error('Error creating storage buckets:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Execute SQL on Supabase database
 */
async function executeSql(sql) {
  try {
    console.log('Executing SQL...');
    
    // Using Supabase's REST API to execute SQL
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/execute_sql`,
      { sql_query: sql },
      { headers }
    );
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error executing SQL:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Create database tables
 */
async function createDatabaseTables() {
  console.log('Creating database tables...');
  
  const sql = `
  -- Users table
  CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Audio files table
  CREATE TABLE IF NOT EXISTS public.audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration FLOAT,
    is_public BOOLEAN DEFAULT false,
    storage_path TEXT NOT NULL,
    waveform_path TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Playlists table
  CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Playlist items table
  CREATE TABLE IF NOT EXISTS public.playlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
    audio_file_id UUID NOT NULL REFERENCES public.audio_files(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (playlist_id, position)
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON public.audio_files(user_id);
  CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
  CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON public.playlist_items(playlist_id);
  CREATE INDEX IF NOT EXISTS idx_audio_files_tags ON public.audio_files USING GIN(tags);
  `;
  
  const result = await executeSql(sql);
  if (result.success) {
    console.log('Database tables created successfully');
    return true;
  } else {
    console.error('Failed to create database tables');
    return false;
  }
}

/**
 * Set up RLS policies
 */
async function setupRlsPolicies() {
  console.log('Setting up Row Level Security policies...');
  
  const sql = `
  -- Enable RLS on all tables
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
  
  -- Users table policies
  CREATE POLICY IF NOT EXISTS "Users can view their own data" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);
  
  CREATE POLICY IF NOT EXISTS "Users can update their own data" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);
  
  -- Audio files policies
  CREATE POLICY IF NOT EXISTS "Anyone can view public audio files" 
    ON public.audio_files FOR SELECT 
    USING (is_public = true OR user_id = auth.uid());
  
  CREATE POLICY IF NOT EXISTS "Users can CRUD their own audio files" 
    ON public.audio_files FOR ALL 
    USING (user_id = auth.uid());
  
  -- Playlists policies
  CREATE POLICY IF NOT EXISTS "Anyone can view public playlists" 
    ON public.playlists FOR SELECT 
    USING (is_public = true OR user_id = auth.uid());
  
  CREATE POLICY IF NOT EXISTS "Users can CRUD their own playlists" 
    ON public.playlists FOR ALL 
    USING (user_id = auth.uid());
  
  -- Playlist items policies
  CREATE POLICY IF NOT EXISTS "Users can view items from playlists they can access" 
    ON public.playlist_items FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.playlists 
        WHERE playlists.id = playlist_items.playlist_id 
        AND (playlists.is_public = true OR playlists.user_id = auth.uid())
      )
    );
  
  CREATE POLICY IF NOT EXISTS "Users can CRUD items in their own playlists" 
    ON public.playlist_items FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.playlists 
        WHERE playlists.id = playlist_items.playlist_id 
        AND playlists.user_id = auth.uid()
      )
    );
  `;
  
  const result = await executeSql(sql);
  if (result.success) {
    console.log('RLS policies set up successfully');
    return true;
  } else {
    console.error('Failed to set up RLS policies');
    return false;
  }
}

/**
 * Set up triggers and functions
 */
async function setupTriggersAndFunctions() {
  console.log('Setting up database triggers and functions...');
  
  const sql = `
  -- Function to update "updated_at" timestamp
  CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  -- Apply the trigger to all tables with updated_at
  DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
  CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
  
  DROP TRIGGER IF EXISTS update_audio_files_updated_at ON public.audio_files;
  CREATE TRIGGER update_audio_files_updated_at
    BEFORE UPDATE ON public.audio_files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
  
  DROP TRIGGER IF EXISTS update_playlists_updated_at ON public.playlists;
  CREATE TRIGGER update_playlists_updated_at
    BEFORE UPDATE ON public.playlists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
  
  -- Function to handle user registration
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.users (id, email, display_name, created_at, updated_at)
    VALUES (NEW.id, NEW.email, coalesce(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), NOW(), NOW());
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  
  -- Trigger for user registration
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  `;
  
  const result = await executeSql(sql);
  if (result.success) {
    console.log('Triggers and functions set up successfully');
    return true;
  } else {
    console.error('Failed to set up triggers and functions');
    return false;
  }
}

/**
 * Main deployment function
 */
async function deployToSupabase() {
  console.log('Starting Supabase deployment...');
  
  // Install necessary npm packages if not already installed
  console.log('Checking dependencies...');
  try {
    require('@supabase/supabase-js');
    require('axios');
  } catch (err) {
    console.log('Installing dependencies...');
    execSync('npm install @supabase/supabase-js axios', { stdio: 'inherit' });
  }
  
  // Run deployment steps
  await createStorageBuckets();
  await createDatabaseTables();
  await setupRlsPolicies();
  await setupTriggersAndFunctions();
  
  console.log('\nDeployment complete!');
  console.log('\nSuabase Project URL:', SUPABASE_URL);
  console.log('Use the following credentials in your application:');
  console.log('  SUPABASE_URL:', SUPABASE_URL);
  console.log('  SUPABASE_API_KEY:', SUPABASE_API_KEY.substring(0, 10) + '...');
}

// Run the deployment
deployToSupabase().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});