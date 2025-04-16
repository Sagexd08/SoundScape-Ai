import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://mxvcweenflmanyknwccr.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dmN3ZWVuZmxtYW55a253Y2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzY1NDcsImV4cCI6MjA2MDMxMjU0N30.7vGieWdn8C65i0p970s0a4myEm6d2f6NgSMHOmVeoRM';
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET || 'oUcjGefM3eZTkYb8FM8pyZrQnWlV69zJZiVFQMeibEiV00l5YVM5HzLZv1eHZHd5uwnNECJt8Bc7DPWJHQjx2g==';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export configuration for use in other services
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  jwtSecret: supabaseJwtSecret
};

export default supabase;