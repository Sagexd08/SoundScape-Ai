'use client';

import { useState, useEffect, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileAudio, Sparkles, Music } from 'lucide-react';
import SimpleAudioGenerator from '@/components/ai/SimpleAudioGenerator';
import AudioAnalyzer from '@/components/ai/AudioAnalyzer';
import MusicGenerator from '@/components/ai/MusicGenerator';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import SimpleBackgroundLayout from '@/components/layouts/SimpleBackgroundLayout';

// Simple loading component for Suspense fallback
function LoadingFallback() {
  return <div className="text-center text-gray-400">Loading...</div>;
}

function AIStudioContent() {
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }} // Smoother ease and slightly longer duration
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
              {/* Add hover/tap animations to TabsTrigger */}
              <TabsTrigger value="generate" asChild>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  <span>Generate Audio</span>
                </motion.button>
              </TabsTrigger>
              <TabsTrigger value="music" asChild>
                 <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <Music className="h-4 w-4" />
                  <span>Generate Music</span>
                 </motion.button>
              </TabsTrigger>
              <TabsTrigger value="analyze" asChild>
                 <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(236, 72, 153, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <FileAudio className="h-4 w-4" />
                  <span>Analyze</span>
                 </motion.button>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Use AnimatePresence for smoother tab transitions including exit animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab} // Key is crucial for AnimatePresence
              initial={{ opacity: 0, y: 10 }} // Start slightly lower
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} // Exit animation
              transition={{ duration: 0.3, ease: "easeInOut" }} // Smoother easing
            >
              <TabsContent value="generate" className="mt-0" forceMount>
                <SimpleAudioGenerator />
              </TabsContent>

              <TabsContent value="music" className="mt-0" forceMount>
                <MusicGenerator />
              </TabsContent>

              <TabsContent value="analyze" className="mt-0" forceMount>
                <AudioAnalyzer />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      <div className="mt-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }} // Slightly increased initial y offset
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} // Smoother ease
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
            initial={{ opacity: 0, y: 30 }} // Slightly increased initial y offset
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }} // Smoother ease
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
    </>
  );
}

export default function AIStudioPage() {
  return (
    <SimpleBackgroundLayout>
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingFallback />}>
            <AIStudioContent />
          </Suspense>
        </div>
      </div>
    </SimpleBackgroundLayout>
  );
}
