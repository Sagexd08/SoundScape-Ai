'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileAudio, Sparkles, Music, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import SimpleBackgroundLayout from '@/components/layouts/SimpleBackgroundLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Simplified AI Studio page that doesn't depend on backend services
export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <SimpleBackgroundLayout>
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              AI Audio Studio
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Create and analyze audio using state-of-the-art AI models from Grok and Gemini.
              Generate custom soundscapes or gain insights from your audio files.
            </p>
          </motion.div>

          <Alert className="mb-8 border-amber-500 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Backend services not available</AlertTitle>
            <AlertDescription>
              The AI Studio is currently in demo mode. Backend services for audio generation and analysis are not connected in this deployment.
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
                <Card className="w-full bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-indigo-400" />
                      AI Audio Generator
                    </CardTitle>
                    <CardDescription>
                      Create custom audio environments using AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Describe the audio environment you want to generate..."
                      className="min-h-[100px] bg-gray-950 border-gray-800 mb-4"
                    />
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
                        <h4 className="font-medium mb-2">Environment Type</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="justify-start">Forest</Button>
                          <Button variant="outline" size="sm" className="justify-start">Ocean</Button>
                          <Button variant="outline" size="sm" className="justify-start">City</Button>
                          <Button variant="outline" size="sm" className="justify-start">Cafe</Button>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
                        <h4 className="font-medium mb-2">Mood</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="justify-start">Relaxing</Button>
                          <Button variant="outline" size="sm" className="justify-start">Energetic</Button>
                          <Button variant="outline" size="sm" className="justify-start">Focused</Button>
                          <Button variant="outline" size="sm" className="justify-start">Peaceful</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Audio
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="music" className="mt-0">
                <Card className="w-full bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="h-5 w-5 text-indigo-400" />
                      AI Music Generator
                    </CardTitle>
                    <CardDescription>
                      Create custom music using AI with detailed control over genre, mood, and instruments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Describe the music you want to generate..."
                      className="min-h-[100px] bg-gray-950 border-gray-800 mb-4"
                    />
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
                        <h4 className="font-medium mb-2">Genre</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="justify-start">Ambient</Button>
                          <Button variant="outline" size="sm" className="justify-start">Classical</Button>
                          <Button variant="outline" size="sm" className="justify-start">Electronic</Button>
                          <Button variant="outline" size="sm" className="justify-start">Jazz</Button>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
                        <h4 className="font-medium mb-2">Instruments</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="justify-start">Piano</Button>
                          <Button variant="outline" size="sm" className="justify-start">Guitar</Button>
                          <Button variant="outline" size="sm" className="justify-start">Strings</Button>
                          <Button variant="outline" size="sm" className="justify-start">Synth</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Music className="h-4 w-4 mr-2" />
                      Generate Music
                    </Button>
                  </CardFooter>
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
                      <Button variant="outline">
                        Select File
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700" disabled>
                      <FileAudio className="h-4 w-4 mr-2" />
                      Analyze Audio
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-500/20 p-2 rounded-lg">
                    <Wand2 className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-medium">Grok AI</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Grok AI specializes in audio generation and analysis with exceptional
                  understanding of environmental sounds and acoustic properties.
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 mt-1 shrink-0" />
                    <span>Ultra-fast audio processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 mt-1 shrink-0" />
                    <span>Detailed acoustic feature extraction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 mt-1 shrink-0" />
                    <span>Realistic environmental sound generation</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <FileAudio className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-medium">Gemini AI</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Gemini AI excels at multimodal understanding, providing rich descriptive
                  analysis and creative audio generation capabilities.
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400 mt-1 shrink-0" />
                    <span>Multimodal understanding of audio context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400 mt-1 shrink-0" />
                    <span>Rich descriptive analysis capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400 mt-1 shrink-0" />
                    <span>Creative music and complex audio generation</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </SimpleBackgroundLayout>
  );
}
