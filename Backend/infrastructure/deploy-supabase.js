/**
 * Supabase Deployment Script
 * 
 * This script sets up the necessary Supabase resources for SoundScape-AI:
 * - Creates database tables
 * - Sets up storage buckets
 * - Configures authentication
 * - Implements database functions and triggers
 */

require('dotenv').config();
const { supabase } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

// SQL migration files directory
const migrationsDir = path.join(__dirname, 'migrations');

async function setupDatabase() {
  console.log('Setting up Supabase database...');
  
  try {
    // Run SQL migrations from files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order
    
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute SQL using Supabase's REST API (as Supabase JS client doesn't directly support raw SQL)
      const { error } = await supabase.rpc('run_sql', { sql_query: sql });
      
      if (error) {
        console.error(`Migration ${file} failed:`, error.message);
        return false;
      }
    }
    
    console.log('Database setup completed successfully');
    return true;
  } catch (err) {
    console.error('Failed to set up database:', err.message);
    return false;
  }
}

async function setupStorageBuckets() {
  console.log('Setting up Supabase storage buckets...');
  
  const buckets = [
    { name: 'audio-files', public: false },
    { name: 'profile-images', public: true },
    { name: 'waveform-images', public: true }
  ];
  
  try {
    for (const bucket of buckets) {
      // Check if bucket exists
      const { data: existingBuckets, error: checkError } = await supabase
        .storage
        .listBuckets();
      
      if (checkError) {
        console.error('Error checking buckets:', checkError.message);
        return false;
      }
      
      const bucketExists = existingBuckets.some(b => b.name === bucket.name);
      
      if (!bucketExists) {
        // Create bucket
        const { error: createError } = await supabase
          .storage
          .createBucket(bucket.name, { public: bucket.public });
        
        if (createError) {
          console.error(`Failed to create bucket ${bucket.name}:`, createError.message);
          return false;
        }
        
        console.log(`Created bucket: ${bucket.name}`);
      } else {
        console.log(`Bucket already exists: ${bucket.name}`);
      }
    }
    
    console.log('Storage buckets setup completed');
    return true;
  } catch (err) {
    console.error('Failed to set up storage buckets:', err.message);
    return false;
  }
}

async function setupRlsPolicy() {
  console.log('Setting up Row Level Security policies...');
  
  try {
    // Define RLS policies in SQL
    const rlsPolicies = `
    -- Enable RLS on all tables
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
    ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
    ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
    
    -- Users table policies
    CREATE POLICY "Users can view their own data" 
      ON users FOR SELECT 
      USING (auth.uid() = id);
    
    CREATE POLICY "Users can update their own data" 
      ON users FOR UPDATE 
      USING (auth.uid() = id);
    
    -- Audio files policies
    CREATE POLICY "Anyone can view public audio files" 
      ON audio_files FOR SELECT 
      USING (is_public = true OR user_id = auth.uid());
    
    CREATE POLICY "Users can CRUD their own audio files" 
      ON audio_files FOR ALL 
      USING (user_id = auth.uid());
    
    -- Playlists policies
    CREATE POLICY "Anyone can view public playlists" 
      ON playlists FOR SELECT 
      USING (is_public = true OR user_id = auth.uid());
    
    CREATE POLICY "Users can CRUD their own playlists" 
      ON playlists FOR ALL 
      USING (user_id = auth.uid());
    
    -- Playlist items policies
    CREATE POLICY "Users can view items from playlists they can access" 
      ON playlist_items FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM playlists 
          WHERE playlists.id = playlist_items.playlist_id 
          AND (playlists.is_public = true OR playlists.user_id = auth.uid())
        )
      );
    
    CREATE POLICY "Users can CRUD items in their own playlists" 
      ON playlist_items FOR ALL 
      USING (
        EXISTS (
          SELECT 1 FROM playlists 
          WHERE playlists.id = playlist_items.playlist_id 
          AND playlists.user_id = auth.uid()
        )
      );
    `;
    
    // Execute SQL for RLS policies
    const { error } = await supabase.rpc('run_sql', { sql_query: rlsPolicies });
    
    if (error) {
      console.error('Failed to set up RLS policies:', error.message);
      return false;
    }
    
    console.log('RLS policies setup completed');
    return true;
  } catch (err) {
    console.error('Failed to set up RLS policies:', err.message);
    return false;
  }
}

async function setupFunctionsAndTriggers() {
  console.log('Setting up database functions and triggers...');
  
  try {
    // Define functions and triggers in SQL
    const functionsAndTriggers = `
    -- Function to update "updated_at" timestamp
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Apply the trigger to all tables with updated_at
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
    
    CREATE TRIGGER update_audio_files_updated_at
      BEFORE UPDATE ON audio_files
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
    
    CREATE TRIGGER update_playlists_updated_at
      BEFORE UPDATE ON playlists
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
    
    -- Function to handle user registration
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO users (id, email, display_name, created_at, updated_at)
      VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name', NOW(), NOW());
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Trigger for user registration
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user();
    `;
    
    // Execute SQL for functions and triggers
    const { error } = await supabase.rpc('run_sql', { sql_query: functionsAndTriggers });
    
    if (error) {
      console.error('Failed to set up functions and triggers:', error.message);
      return false;
    }
    
    console.log('Functions and triggers setup completed');
    return true;
  } catch (err) {
    console.error('Failed to set up functions and triggers:', err.message);
    return false;
  }
}

async function deploySupabase() {
  console.log('Starting Supabase deployment...');
  
  // Test connection
  const connectionTest = await supabase.testConnection();
  if (!connectionTest) {
    console.error('Cannot proceed with deployment due to connection issues');
    process.exit(1);
  }
  
  // Run setup processes
  const dbSetup = await setupDatabase();
  const storageSetup = await setupStorageBuckets();
  const rlsSetup = await setupRlsPolicy();
  const functionsSetup = await setupFunctionsAndTriggers();
  
  if (dbSetup && storageSetup && rlsSetup && functionsSetup) {
    console.log('Supabase deployment completed successfully');
  } else {
    console.error('Supabase deployment completed with errors');
    process.exit(1);
  }
}

// Run the deployment
deploySupabase().catch(err => {
  console.error('Deployment failed with error:', err);
  process.exit(1);
});