/**
 * Fix Supabase Issues Script
 * 
 * This script diagnoses and fixes common issues with Supabase deployment.
 */

require('dotenv').config();
const { execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Supabase credentials
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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask a yes/no question
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(`${question} (y/n): `, answer => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
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
    if (error.response?.data?.message?.includes('function "execute_sql" does not exist')) {
      console.error('The execute_sql function does not exist in your Supabase instance.');
      console.log('Creating the execute_sql function...');
      
      // Create the execute_sql function
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result JSONB;
      BEGIN
        EXECUTE sql_query;
        result := '{"success": true}'::JSONB;
        RETURN result;
      EXCEPTION WHEN OTHERS THEN
        result := jsonb_build_object(
          'success', false,
          'error', SQLERRM,
          'detail', SQLSTATE
        );
        RETURN result;
      END;
      $$;
      `;
      
      try {
        // We need a different approach since we can't use execute_sql to create itself
        // Let's try a direct query to the database
        console.log('Please run the following SQL in the Supabase SQL editor:');
        console.log(createFunctionSql);
        
        const shouldContinue = await askQuestion('Did you run the SQL in the Supabase dashboard?');
        
        if (shouldContinue) {
          // Now try executing the original SQL again
          return await executeSql(sql);
        } else {
          return { success: false, error: 'User skipped creating execute_sql function' };
        }
      } catch (innerError) {
        console.error('Could not create execute_sql function:', innerError.message);
        console.log('Please run the following SQL in the Supabase SQL editor:');
        console.log(createFunctionSql);
        return { success: false, error: innerError.response?.data || innerError.message };
      }
    }
    
    console.error('Error executing SQL:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Check and fix storage buckets
 */
async function checkAndFixStorageBuckets() {
  console.log('\nChecking storage buckets...');
  
  const requiredBuckets = [
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
    console.log('Existing buckets:', existingBuckets.join(', '));
    
    // Find missing buckets
    const missingBuckets = requiredBuckets.filter(bucket => 
      !existingBuckets.includes(bucket.name)
    );
    
    if (missingBuckets.length === 0) {
      console.log('✅ All required storage buckets exist.');
      return true;
    }
    
    console.log('Missing buckets:', missingBuckets.map(b => b.name).join(', '));
    
    // Ask if we should create missing buckets
    const shouldCreate = await askQuestion('Would you like to create the missing buckets?');
    
    if (!shouldCreate) {
      console.log('Skipping bucket creation.');
      return false;
    }
    
    // Create missing buckets
    for (const bucket of missingBuckets) {
      console.log(`Creating bucket: ${bucket.name}`);
      
      await axios.post(
        `${SUPABASE_URL}/storage/v1/bucket`,
        { name: bucket.name, public: bucket.public },
        { headers }
      );
      
      console.log(`✅ Created bucket: ${bucket.name}`);
    }
    
    console.log('✅ All required storage buckets now exist.');
    return true;
  } catch (error) {
    console.error('Error checking/creating storage buckets:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Check and fix database tables
 */
async function checkAndFixDatabaseTables() {
  console.log('\nChecking database tables...');
  
  const tables = ['users', 'audio_files', 'playlists', 'playlist_items'];
  const existingTables = [];
  const missingTables = [];
  
  // First, check which tables exist
  for (const table of tables) {
    try {
      const response = await axios.get(
        `${SUPABASE_URL}/rest/v1/${table}?limit=0`,
        { headers }
      );
      
      existingTables.push(table);
    } catch (error) {
      if (error.response?.status === 404) {
        missingTables.push(table);
      } else {
        console.error(`Error checking table ${table}:`, error.response?.data || error.message);
      }
    }
  }
  
  console.log('Existing tables:', existingTables.join(', '));
  
  if (missingTables.length === 0) {
    console.log('✅ All required database tables exist.');
    return true;
  }
  
  console.log('Missing tables:', missingTables.join(', '));
  
  // Ask if we should create missing tables
  const shouldCreate = await askQuestion('Would you like to create the missing tables?');
  
  if (!shouldCreate) {
    console.log('Skipping table creation.');
    return false;
  }
  
  // Create missing tables
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
    console.log('✅ Database tables created successfully');
    return true;
  } else {
    console.error('Failed to create database tables');
    return false;
  }
}

/**
 * Check and fix RLS policies
 */
async function checkAndFixRlsPolicies() {
  console.log('\nChecking Row Level Security policies...');
  
  // Check if RLS is enabled on tables
  const sql = `
  SELECT table_name, has_row_level_security
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('users', 'audio_files', 'playlists', 'playlist_items');
  `;
  
  try {
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/execute_sql_select`,
      { sql_query: sql },
      { headers }
    );
    
    const tablesWithoutRls = response.data
      .filter(table => !table.has_row_level_security)
      .map(table => table.table_name);
    
    if (tablesWithoutRls.length === 0) {
      console.log('✅ RLS is enabled on all tables.');
    } else {
      console.log('Tables without RLS:', tablesWithoutRls.join(', '));
      
      const shouldFix = await askQuestion('Would you like to enable RLS and set up policies?');
      
      if (!shouldFix) {
        console.log('Skipping RLS setup.');
        return false;
      }
      
      // Enable RLS and create policies
      const rlsSql = `
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
      
      const result = await executeSql(rlsSql);
      
      if (result.success) {
        console.log('✅ RLS policies set up successfully');
        return true;
      } else {
        console.error('Failed to set up RLS policies');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    // If execute_sql_select doesn't exist, create it first
    if (error.response?.data?.message?.includes('function "execute_sql_select" does not exist')) {
      console.error('The execute_sql_select function does not exist in your Supabase instance.');
      console.log('Creating the execute_sql_select function...');
      
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION execute_sql_select(sql_query TEXT)
      RETURNS SETOF RECORD
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY EXECUTE sql_query;
      END;
      $$;
      `;
      
      console.log('Please run the following SQL in the Supabase SQL editor:');
      console.log(createFunctionSql);
      
      const shouldContinue = await askQuestion('Did you run the SQL in the Supabase dashboard?');
      
      if (shouldContinue) {
        return await checkAndFixRlsPolicies();
      } else {
        return false;
      }
    }
    
    console.error('Error checking RLS policies:', error.response?.data || error.message);
    
    // If we can't check, just ask if they want to set up RLS anyway
    const shouldSetup = await askQuestion('Would you like to set up RLS policies anyway?');
    
    if (!shouldSetup) {
      console.log('Skipping RLS setup.');
      return false;
    }
    
    // Set up RLS policies
    const rlsSql = `
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
    
    const result = await executeSql(rlsSql);
    
    if (result.success) {
      console.log('✅ RLS policies set up successfully');
      return true;
    } else {
      console.error('Failed to set up RLS policies');
      return false;
    }
  }
}

/**
 * Check and fix functions and triggers
 */
async function checkAndFixFunctionsAndTriggers() {
  console.log('\nChecking database functions and triggers...');
  
  // Create functions and triggers
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
    console.log('✅ Functions and triggers set up successfully');
    return true;
  } else {
    console.error('Failed to set up functions and triggers');
    return false;
  }
}

/**
 * Main function to fix Supabase issues
 */
async function fixSupabaseIssues() {
  console.log('Starting Supabase diagnostics and repair...');
  console.log('Supabase URL:', SUPABASE_URL);
  
  try {
    // Install necessary npm packages if not already installed
    console.log('Checking dependencies...');
    try {
      require('@supabase/supabase-js');
      require('axios');
    } catch (err) {
      console.log('Installing dependencies...');
      execSync('npm install @supabase/supabase-js axios dotenv', { stdio: 'inherit' });
    }
    
    // Test connection
    console.log('\nTesting connection to Supabase...');
    try {
      const response = await axios.get(
        `${SUPABASE_URL}/rest/v1/`,
        { headers }
      );
      console.log('✅ Connection successful');
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('Please check your Supabase URL and API key.');
      process.exit(1);
    }
    
    // Run checks and fixes
    await checkAndFixStorageBuckets();
    await checkAndFixDatabaseTables();
    await checkAndFixRlsPolicies();
    await checkAndFixFunctionsAndTriggers();
    
    console.log('\n✅ Supabase diagnostics and repair completed!');
    rl.close();
  } catch (err) {
    console.error('Repair failed:', err);
    rl.close();
    process.exit(1);
  }
}

// Run the fix script
fixSupabaseIssues();