# SoundScape-AI Deployment Guide

This guide explains how to deploy SoundScape-AI using Supabase for backend services. The application uses Supabase for authentication, database, and storage.

## Prerequisites

1. Node.js (v16+)
2. npm or yarn
3. Git
4. A Supabase account

## Step 1: Set Up Supabase Project

1. Create a new project at [Supabase](https://supabase.com).
2. Once your project is created, go to Project Settings > API and copy:
   - Project URL
   - Project API Key (anon, public)
   - JWT Secret

## Step 2: Configure Environment Variables

Create a `.env` file in the Backend directory:

```bash
# Supabase Credentials
SUPABASE_URL=https://mxvcweenflmanyknwccr.supabase.co
SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dmN3ZWVuZmxtYW55a253Y2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzY1NDcsImV4cCI6MjA2MDMxMjU0N30.7vGieWdn8C65i0p970s0a4myEm6d2f6NgSMHOmVeoRM
SUPABASE_JWT_SECRET=oUcjGefM3eZTkYb8FM8pyZrQnWlV69zJZiVFQMeibEiV00l5YVM5HzLZv1eHZHd5uwnNECJt8Bc7DPWJHQjx2g==

# Grok API key (if using Grok AI)
SOUNDSCAPE_GROK_API_KEY=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
```

For the frontend, create a `.env.local` file in the Frontend directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://mxvcweenflmanyknwccr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dmN3ZWVuZmxtYW55a253Y2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzY1NDcsImV4cCI6MjA2MDMxMjU0N30.7vGieWdn8C65i0p970s0a4myEm6d2f6NgSMHOmVeoRM
```

## Step 3: Deploy Supabase Resources

1. Install backend dependencies:

```bash
cd Backend
npm install
```

2. Run the deployment script to set up your Supabase project:

```bash
node scripts/deploy-supabase.js
```

This script will:
- Create storage buckets: `audio-files`, `waveform-images`, and `profile-images`
- Create database tables with proper relations
- Set up Row Level Security (RLS) policies
- Create database functions and triggers

3. Test your Supabase configuration:

```bash
node scripts/test-supabase.js
```

4. If any issues are found, run the fix script:

```bash
node scripts/fix-supabase.js
```

## Step 4: Deploy Backend Services

### Option 1: Deploy using Docker

1. Build all services:

```bash
cd Backend
docker-compose build
```

2. Start the services:

```bash
docker-compose up -d
```

### Option 2: Deploy to a Cloud Provider

#### Deploy to Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `cd Backend && npm install`
   - Start Command: `cd Backend && node server.js`
   - Add the environment variables from your `.env` file

#### Deploy to Vercel

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the deployment:
   - Root Directory: `Backend`
   - Build Command: `npm install`
   - Output Directory: `.`
   - Add the environment variables from your `.env` file

## Step 5: Deploy Frontend

### Deploy to Vercel

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the deployment:
   - Root Directory: `Frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `.next`
   - Add the environment variables from your `.env.local` file

### Deploy to Netlify

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Configure the deployment:
   - Base Directory: `Frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`
   - Add the environment variables from your `.env.local` file

## Step 6: Configure Authentication

1. Go to your Supabase project dashboard > Authentication > Providers
2. Enable Email/Password sign-in
3. Configure email templates for confirmation emails, password resets, etc.
4. (Optional) Configure OAuth providers like Google, GitHub, etc.
5. Set the Site URL in Authentication settings to your frontend URL to enable proper redirects

## Step 7: Set Up Storage Permissions

1. Go to Storage > Configuration in your Supabase dashboard
2. For the `audio-files` bucket:
   - If you want to allow anyone to upload files: set Public to "false" and add a policy to allow authenticated users to upload
   - If you want to restrict uploads: set Public to "false" and add a policy to allow only specific users to upload
3. For the `waveform-images` bucket:
   - Set Public to "true" to allow anyone to view waveform images
4. For the `profile-images` bucket:
   - Set Public to "true" to allow anyone to view profile images

## Step 8: Verify Deployment

1. Visit your deployed frontend URL
2. Sign up for a new account (this should trigger the user creation trigger in Supabase)
3. Upload a test audio file
4. Verify that audio files, waveforms, and metadata are correctly stored in Supabase

## Troubleshooting

### Common Issues

1. **CORS errors**: If you're experiencing CORS issues, make sure you've added your frontend domain to the allowed origins in your Supabase project settings (Project Settings > API > CORS).

2. **Authentication issues**: Check that your site URL is correctly set in Authentication > Settings > Site URL.

3. **Database policies**: If users can't read/write data, check your RLS policies. You can run the following SQL in the Supabase SQL editor to enable RLS:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);
```

4. **Storage issues**: If you can't upload or access files, check your storage bucket policies:

```sql
-- Allow anyone to read public files
CREATE POLICY "Anyone can view public audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'waveform-images' OR bucket_id = 'profile-images' OR 
        (bucket_id = 'audio-files' AND (storage.foldername(name))[1] = 'public'));

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Debugging Tools

1. **Supabase Debug Tool**: Use the debug tool in your Supabase dashboard to check API requests and responses.

2. **Backend Logs**: Check the logs for your backend services to identify any errors.

```bash
# If using Docker
docker-compose logs -f
```

3. **Run the Fix Script**: The fix script can resolve common configuration issues:

```bash
node Backend/scripts/fix-supabase.js
```

## Maintenance and Updates

### Database Migrations

When you need to update your database schema, create a new SQL file in `Backend/infrastructure/migrations/` and run it through the Supabase SQL editor or using the following command:

```bash
node Backend/scripts/run-migration.js -f new-migration.sql
```

### API Key Rotation

For security, it's recommended to rotate your API keys periodically:

1. Go to Project Settings > API in your Supabase dashboard
2. Generate a new API key
3. Update your environment variables with the new key
4. Redeploy your services

## Performance Optimization

### Supabase Edge Functions

For low-latency APIs, consider using Supabase Edge Functions:

1. Install the Supabase CLI:
```bash
npm install -g supabase
```

2. Create a new edge function:
```bash
supabase functions new my-function
```

3. Deploy the function:
```bash
supabase functions deploy my-function
```

### CDN for Audio Files

To improve audio loading performance, consider setting up a CDN for your Supabase storage:

1. Cloudflare: Create a Cloudflare account, add your domain, and configure caching rules
2. Vercel Edge Network: If using Vercel, enable Edge Caching for API routes

## Security Best Practices

1. **Never expose service role keys** in frontend code
2. Use environment variables for all sensitive information
3. Enable RLS on all tables
4. Set up appropriate storage policies
5. Implement rate limiting on your APIs
6. Regularly audit user permissions and database access

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [SoundScape-AI GitHub Repository](https://github.com/yourusername/SoundScape-AI)