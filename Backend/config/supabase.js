/**
 * Supabase Configuration
 * 
 * This file manages the Supabase connection and provides utilities
 * for interacting with Supabase services.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  console.error('ERROR: Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_API_KEY environment variables.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

/**
 * Test the Supabase connection
 * 
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection() {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1).catch(err => {
      // If health_check table doesn't exist, try a different query
      return { error: true };
    });
    
    if (error) {
      // Try a different approach - check if we can get the storage buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Supabase connection test failed:', bucketsError.message);
        return false;
      }
      
      console.log('Supabase connection successful (via storage API)');
      return true;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Error testing Supabase connection:', err.message);
    return false;
  }
}

/**
 * Get a JWT token for server-side operations
 * 
 * @param {Object} payload - The JWT payload
 * @returns {string} JWT token
 */
function generateServiceToken(payload = {}) {
  if (!SUPABASE_JWT_SECRET) {
    console.error('ERROR: Missing SUPABASE_JWT_SECRET environment variable.');
    return null;
  }
  
  const jwt = require('jsonwebtoken');
  
  // Default payload with service role
  const defaultPayload = {
    role: 'service_role',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour
  };
  
  // Merge default payload with provided payload
  const finalPayload = { ...defaultPayload, ...payload };
  
  try {
    return jwt.sign(finalPayload, SUPABASE_JWT_SECRET);
  } catch (err) {
    console.error('Error generating JWT token:', err.message);
    return null;
  }
}

module.exports = {
  supabase,
  testConnection,
  generateServiceToken,
  SUPABASE_URL
};
