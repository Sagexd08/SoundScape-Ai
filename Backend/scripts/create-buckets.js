const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://etymxhxrcgnfonibvbha.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Updated to use environment variable

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBuckets() {
  const buckets = [
    { name: 'audio-files', public: false },
    { name: 'waveform-images', public: true },
    { name: 'profile-images', public: true }
  ]

  for (const bucket of buckets) {
    try {
      console.log(`Creating bucket: ${bucket.name}...`)
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 52428800 // 50MB
      })

      if (error) {
        console.error(`Error creating bucket ${bucket.name}:`, error.message)
      } else {
        console.log(`Successfully created bucket: ${bucket.name}`)
      }
    } catch (err) {
      console.error(`Error creating bucket ${bucket.name}:`, err.message)
    }
  }
}

createBuckets()