/**
 * Test Supabase Connection
 * 
 * This script tests your Supabase connection and reports on the status
 * of buckets, tables, and other resources.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  console.error('ERROR: Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_API_KEY environment variables.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

async function testStorageBuckets() {
  console.log('\nTesting storage buckets...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error accessing storage buckets:', error.message);
      return false;
    }
    
    console.log(`Found ${buckets.length} storage buckets:`);
    
    // Check for required buckets
    const requiredBuckets = ['audio-files', 'waveform-images', 'profile-images'];
    const foundBuckets = buckets.map(bucket => bucket.name);
    
    console.table(buckets.map(b => ({
      name: b.name, 
      public: b.public ? 'Yes' : 'No', 
      created: new Date(b.created_at).toLocaleString()
    })));
    
    // Check which required buckets are missing
    const missingBuckets = requiredBuckets.filter(name => !foundBuckets.includes(name));
    
    if (missingBuckets.length > 0) {
      console.warn(`Missing required buckets: ${missingBuckets.join(', ')}`);
      console.warn('Run the deployment script to create these buckets.');
    } else {
      console.log('All required storage buckets exist.');
    }
    
    return true;
  } catch (err) {
    console.error('Error testing storage buckets:', err.message);
    return false;
  }
}

async function testDatabaseTables() {
  console.log('\nTesting database tables...');
  try {
    // List of tables we expect to exist
    const tables = ['users', 'audio_files', 'playlists', 'playlist_items'];
    const results = [];
    
    for (const table of tables) {
      // Query the table to see if it exists and count rows
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      results.push({
        table,
        exists: !error,
        count: count || 0,
        error: error ? error.message : null
      });
    }
    
    console.table(results);
    
    const missingTables = results.filter(r => !r.exists);
    if (missingTables.length > 0) {
      console.warn(`Missing tables: ${missingTables.map(t => t.table).join(', ')}`);
      console.warn('Run the deployment script to create these tables.');
    } else {
      console.log('All required database tables exist.');
    }
    
    return true;
  } catch (err) {
    console.error('Error testing database tables:', err.message);
    return false;
  }
}

async function testAuthentication() {
  console.log('\nTesting authentication...');
  try {
    // Check if auth is configured by trying to get the current user
    const { data: user, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error accessing authentication:', error.message);
    } else {
      console.log('Authentication service is working.');
      if (user) {
        console.log('Currently authenticated as:', user.email || 'Unknown User');
      } else {
        console.log('Not currently authenticated.');
      }
    }
    
    // Get auth settings
    const { data: settings, error: settingsError } = await supabase.auth.getSettings();
    
    if (settingsError) {
      console.error('Error getting auth settings:', settingsError.message);
    } else if (settings) {
      console.log('Auth settings:', settings);
    }
    
    return !error;
  } catch (err) {
    console.error('Error testing authentication:', err.message);
    return false;
  }
}

async function testRPC() {
  console.log('\nTesting Remote Procedure Calls...');
  try {
    // Try to call a simple RPC function
    const { data, error } = await supabase.rpc('current_database');
    
    if (error) {
      console.error('Error testing RPC:', error.message);
      console.warn('You may need to create the current_database function:');
      console.warn('CREATE OR REPLACE FUNCTION current_database() RETURNS text AS $$ SELECT current_database(); $$ LANGUAGE SQL;');
      return false;
    }
    
    console.log('RPC test successful.');
    console.log('Current database:', data);
    return true;
  } catch (err) {
    console.error('Error testing RPC:', err.message);
    return false;
  }
}

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('Supabase URL:', SUPABASE_URL);
  
  try {
    // Test a simple query to check connection
    const startTime = Date.now();
    const { data, error } = await supabase.from('users').select('count()', { count: 'exact', head: true });
    const endTime = Date.now();
    
    if (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
    
    console.log(`Connection successful (${endTime - startTime}ms)`);
    
    // Run all the tests
    await testStorageBuckets();
    await testDatabaseTables();
    await testAuthentication();
    await testRPC();
    
    console.log('\n✅ Supabase connection test complete!');
    console.log('If you encountered any issues, run the deployment script:');
    console.log('  node scripts/deploy-supabase.js');
    
    return true;
  } catch (err) {
    console.error('Supabase connection test failed:', err.message);
    return false;
  }
}

// Run the test
testConnection().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});