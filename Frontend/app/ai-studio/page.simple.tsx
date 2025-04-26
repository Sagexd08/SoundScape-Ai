'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileAudio, Music, AlertCircle } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-indigo-950 text-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          AI Audio Studio
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-center">
          Create and analyze audio using state-of-the-art AI models.
          Generate custom soundscapes or gain insights from your audio files.
        </p>

        <Alert className="mb-8 border-blue-500 bg-blue-500/10">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle>OpenAI Integration Active</AlertTitle>
          <AlertDescription>
            The AI Studio uses OpenAI's Text-to-Speech API to generate custom audio. Enter a prompt or select an environment type and mood, then click "Generate Audio". If no API key is provided, sample audio files will be used instead.
          </AlertDescription>
        </Alert>

        <div className="max-w-4xl mx-auto">
          <Tabs
            defaultValue="generate"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  <span>Generate Audio</span>
                </TabsTrigger>
                <TabsTrigger value="music" className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  <span>Generate Music</span>
                </TabsTrigger>
                <TabsTrigger value="analyze" className="flex items-center gap-2">
                  <FileAudio className="h-4 w-4" />
                  <span>Analyze</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="generate" className="mt-0">
              <Card className="w-full bg-gray-900/90 backdrop-blur-lg border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-indigo-400" />
                    AI Sound Environment Library
                  </CardTitle>
                  <CardDescription>
                    Browse and play high-quality sound environments based on your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Textarea
                      placeholder="Describe the sound environment you want (e.g., 'Peaceful forest with birds and gentle rain')..."
                      className="min-h-[80px] bg-gray-950/80 border-gray-800 mb-4"
                    />
                    <div className="flex justify-center pt-4">
                      <Button
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-6"
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Audio
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="music" className="mt-0">
              <Card className="w-full bg-gray-900/90 backdrop-blur-lg border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-indigo-400" />
                    AI Music Library
                  </CardTitle>
                  <CardDescription>
                    Browse and play high-quality music based on your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Textarea
                      placeholder="Describe the music you want (e.g., 'Classical piano music for relaxation')..."
                      className="min-h-[80px] bg-gray-950/80 border-gray-800 mb-4"
                    />
                    <div className="flex justify-center pt-4">
                      <Button
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-6"
                      >
                        <Music className="h-4 w-4 mr-2" />
                        Generate Music
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analyze" className="mt-0">
              <Card className="w-full bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileAudio className="h-5 w-5 text-indigo-400" />
                    AI Audio Analyzer
                  </CardTitle>
                  <CardDescription>
                    Analyze audio files to extract insights and features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-800 rounded-lg p-6 text-center mb-4">
                    <FileAudio className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-300 mb-2">Drag and drop an audio file or click to browse</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports MP3, WAV, FLAC, AAC, OGG (max 10MB)
                    </p>
                    <Button variant="outline" type="button">
                      Select File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
