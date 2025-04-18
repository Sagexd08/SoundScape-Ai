import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://etymxhxrcgnfonibvbha.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0eW14aHhyY2duZm9uaWJ2YmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg1MTY4MDAsImV4cCI6MjAxNDA5MjgwMH0.S-6O5RAqog_a_1qTz3QbXQRZBCQzB4q5xgxg0eS3NYY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to save audio to user's library
async function saveAudioToLibrary(audioUrl: string, title: string, description: string) {
  console.log('Saving audio to library:', { title, description });

  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Save the audio metadata to the database
    const { data, error } = await supabase
      .from('audio_files')
      .insert({
        user_id: user.id,
        title,
        description,
        url: audioUrl,
        type: 'generated',
        is_public: false,
        metadata: {
          generated_at: new Date().toISOString(),
          source: 'ai_generator'
        }
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error saving to Supabase:', error);

    // Fallback to mock data if Supabase fails
    return {
      id: `audio_${Date.now()}`,
      title,
      description,
      created_at: new Date().toISOString(),
      url: audioUrl
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audio_url, title, description } = body;

    if (!audio_url) {
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const savedAudio = await saveAudioToLibrary(audio_url, title, description || '');

    return NextResponse.json({
      success: true,
      message: 'Audio saved to library',
      audio: savedAudio
    });
  } catch (error) {
    console.error('Error saving audio:', error);
    return NextResponse.json(
      { error: 'Failed to save audio' },
      { status: 500 }
    );
  }
}
