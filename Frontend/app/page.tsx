"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { Wand2, FileAudio, Headphones, Brain, Sparkles, ArrowRight, Music } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ModernBackgroundLayout from "@/components/layouts/ModernBackgroundLayout";
import WaveformScene from "@/components/3d/WaveformScene";
import HeadphonesModel from "@/components/3d/HeadphonesModel";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  // Only render the home page if user is authenticated
  if (!user) {
    return null;
  }

  return (
    <ModernBackgroundLayout>
      <div className="flex min-h-screen flex-col items-center p-0 relative">
        <Navbar />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* 3D Headphones Model */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md max-h-md z-0"
            >
              <HeadphonesModel />
            </motion.div>

            {/* Animated rings around the title */}
            <motion.div
              className="absolute -inset-10 md:-inset-20 rounded-full border border-indigo-500/20 z-0"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0, -5, 0],
                borderColor: ['rgba(99, 102, 241, 0.2)', 'rgba(168, 85, 247, 0.2)', 'rgba(99, 102, 241, 0.2)']
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute -inset-20 md:-inset-32 rounded-full border border-purple-500/10 z-0"
              animate={{
                scale: [1.05, 1, 1.05],
                rotate: [0, -5, 0, 5, 0],
                borderColor: ['rgba(168, 85, 247, 0.1)', 'rgba(99, 102, 241, 0.1)', 'rgba(168, 85, 247, 0.1)']
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl md:text-7xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 animate-gradient bg-[length:200%_auto] font-montserrat tracking-tight relative z-10"
            >
              SoundScape AI
            </motion.h1>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Animated underline */}
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 1, delay: 1 }}
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-xl md:text-2xl mb-8 text-center max-w-2xl text-gray-300 font-montserrat font-light leading-relaxed"
            >
              AI-powered audio environments that adapt to your surroundings and mood in real-time
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative"
          >
            {/* Glow effect behind buttons */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl z-0"></div>

            <div className="relative z-10 w-full will-change-transform">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="will-change-transform"
              >
                <Link href="/ai-studio" className="block w-full">
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 w-full transition-colors duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 font-montserrat relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300"></div>
                    <div className="w-full flex items-center justify-center gap-2 relative z-10">
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 8 }}
                        className="will-change-transform"
                      >
                        <Wand2 className="h-4 w-4" />
                      </motion.div>
                      Try AI Studio
                    </div>
                  </Button>
                </Link>
              </motion.div>
            </div>

            <div className="relative z-10 w-full will-change-transform">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="will-change-transform"
              >
                <Link href="/features" className="block w-full">
                  <Button
                    variant="outline"
                    className="border-indigo-600 text-indigo-400 hover:bg-indigo-950 w-full transition-colors duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/30 font-montserrat relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-indigo-950/0 hover:bg-indigo-950/50 transition-colors duration-300"></div>
                    <div className="w-full flex items-center justify-center gap-2 relative z-10">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.8, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 6 }}
                        className="will-change-transform"
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                      Explore Features
                    </div>
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* AI Features Demo Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-10 w-full bg-gradient-to-b from-black to-gray-900 py-20 px-4"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                Experience AI-Powered Audio
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                SoundScape AI leverages cutting-edge machine learning to transform how you create and experience audio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Feature Card 1 */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/30"
              >
                <div className="h-40 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                  <Wand2 className="h-16 w-16 text-indigo-400" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">AI Audio Generation</h3>
                  <p className="text-gray-400 mb-4">
                    Create custom soundscapes and audio environments with simple text prompts using our Grok-powered AI.
                  </p>
                  <Link href="/ai-studio" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 text-sm font-medium">
                    Try it now <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>

              {/* Feature Card 2 - Music Generation */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden hover:border-green-500/50 transition-all duration-500 shadow-lg shadow-green-500/10 hover:shadow-green-500/30"
              >
                <div className="h-40 bg-gradient-to-br from-green-600/20 to-teal-600/20 flex items-center justify-center">
                  <Music className="h-16 w-16 text-green-400" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">AI Music Creation</h3>
                  <p className="text-gray-400 mb-4">
                    Generate custom music tracks with control over genre, mood, tempo, and instruments using Grok AI.
                  </p>
                  <Link href="/ai-studio?tab=music" className="text-green-400 hover:text-green-300 inline-flex items-center gap-1 text-sm font-medium">
                    Create music <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>

              {/* Feature Card 3 */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30"
              >
                <div className="h-40 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                  <FileAudio className="h-16 w-16 text-purple-400" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Audio Analysis</h3>
                  <p className="text-gray-400 mb-4">
                    Analyze any audio file to extract insights, emotions, and features using our Gemini-powered AI models.
                  </p>
                  <Link href="/ai-studio?tab=analyze" className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 text-sm font-medium">
                    Analyze your audio <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>

              {/* Feature Card 4 */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30"
              >
                <div className="h-40 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                  <Brain className="h-16 w-16 text-blue-400" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Adaptive Environments</h3>
                  <p className="text-gray-400 mb-4">
                    Experience audio that adapts to your mood, surroundings, and activities in real-time.
                  </p>
                  <Link href="/features" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 text-sm font-medium">
                    Learn more <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* 3D Waveform Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full max-w-3xl mx-auto my-12"
          >
            <WaveformScene className="mb-8" />
          </motion.div>

          <div className="mt-8 text-center relative">
              {/* Glow effect behind button */}
              <div className="absolute inset-0 w-64 h-12 mx-auto bg-gradient-to-r from-indigo-600/30 to-purple-600/30 blur-xl rounded-full"></div>

              <div className="relative will-change-transform">
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="will-change-transform"
                >
                  <Link href="/ai-studio" className="inline-block">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-colors duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 px-6 py-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300"></div>
                      <div className="flex items-center gap-3 relative z-10">
                        <motion.div
                          animate={{
                            rotate: [0, 10, 0, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 5, repeat: Infinity, repeatDelay: 5 }}
                          className="will-change-transform"
                        >
                          <Headphones className="h-5 w-5" />
                        </motion.div>
                        <span className="font-semibold tracking-wide">Experience Full AI Studio</span>
                      </div>
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </ModernBackgroundLayout>
  );
}
