'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileAudio, Sparkles, Music } from 'lucide-react';
import AudioGenerator from '@/components/ai/AudioGenerator';
import AudioAnalyzer from '@/components/ai/AudioAnalyzer';
import MusicGenerator from '@/components/ai/MusicGenerator';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import SimpleBackgroundLayout from '@/components/layouts/SimpleBackgroundLayout';

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if tab parameter exists in URL
    const tabParam = searchParams.get('tab');
    if (tabParam === 'analyze') {
      setActiveTab('analyze');
    } else if (tabParam === 'music') {
      setActiveTab('music');
    }
  }, [searchParams]);

  return (
    <SimpleBackgroundLayout>
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'generate' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="generate" className="mt-0">
              <AudioGenerator />
            </TabsContent>

            <TabsContent value="music" className="mt-0">
              <MusicGenerator />
            </TabsContent>

            <TabsContent value="analyze" className="mt-0">
              <AudioAnalyzer />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>

      <div className="mt-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
