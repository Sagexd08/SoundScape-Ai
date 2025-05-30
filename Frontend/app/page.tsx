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
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
          {/* Mobile-optimized hero section with proper spacing */}
          <motion.div
            className="relative mb-8 px-2 sm:px-4 mt-16 sm:mt-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* 3D Headphones Model - adjusted for better mobile positioning */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[240px] xs:max-w-[280px] sm:max-w-md max-h-md z-0"
              style={{ marginTop: '-10px' }} // Slight adjustment for mobile
            >
              <HeadphonesModel />
            </motion.div>

            {/* Animated rings around the title - optimized for mobile */}
            <motion.div
              className="absolute -inset-2 xs:-inset-4 sm:-inset-10 md:-inset-20 rounded-full border border-indigo-500/20 z-0"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0, -5, 0],
                borderColor: ['rgba(99, 102, 241, 0.2)', 'rgba(168, 85, 247, 0.2)', 'rgba(99, 102, 241, 0.2)']
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute -inset-4 xs:-inset-8 sm:-inset-16 md:-inset-32 rounded-full border border-purple-500/10 z-0"
              animate={{
                scale: [1.05, 1, 1.05],
                rotate: [0, -5, 0, 5, 0],
                borderColor: ['rgba(168, 85, 247, 0.1)', 'rgba(99, 102, 241, 0.1)', 'rgba(168, 85, 247, 0.1)']
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Additional decorative elements for visual enhancement */}
            <motion.div
              className="absolute -inset-12 xs:-inset-16 sm:-inset-24 md:-inset-40 rounded-full border-2 border-dashed border-blue-500/5 z-0"
              animate={{
                rotate: [0, 360],
                scale: [0.95, 1, 0.95]
              }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 animate-gradient bg-[length:200%_auto] font-montserrat tracking-tight relative z-10"
            >
              SoundScape AI
            </motion.h1>
          </motion.div>

          <motion.div
            className="relative px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Animated underline */}
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: ['80px', '120px'] }}
              transition={{ duration: 1, delay: 1 }}
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-base xs:text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-center max-w-xs xs:max-w-sm sm:max-w-2xl text-gray-300 font-montserrat font-light leading-relaxed px-1"
            >
              AI-powered audio environments that adapt to your surroundings and mood in real-time
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-[90%] xs:max-w-md relative px-2 xs:px-4 sm:px-0"
          >
            {/* Enhanced glow effect behind buttons */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-xl blur-xl z-0"></div>

            {/* Additional ambient particles for visual enhancement */}
            <motion.div
              className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-indigo-600/10 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-purple-600/10 blur-xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            <div className="relative z-10 w-full will-change-transform">
              <motion.div
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="will-change-transform"
              >
                <Link href="/ai-studio" className="block w-full">
                  <Button
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-600 w-full h-12 xs:h-14 sm:h-12 transition-colors duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 font-montserrat relative overflow-hidden rounded-xl"
                  >
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 rounded-xl"></div>
                    <div className="w-full flex items-center justify-center gap-2 relative z-10">
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 8 }}
                        className="will-change-transform"
                      >
                        <Wand2 className="h-4 w-4 xs:h-5 xs:w-5" />
                      </motion.div>
                      <span className="font-medium text-sm xs:text-base">Try AI Studio</span>
                    </div>
                  </Button>
                </Link>
              </motion.div>
            </div>

            <div className="relative z-10 w-full will-change-transform">
              <motion.div
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="will-change-transform"
              >
                <Link href="/features" className="block w-full">
                  <Button
                    variant="outline"
                    className="border-indigo-600 text-indigo-400 hover:bg-indigo-950 w-full h-12 xs:h-14 sm:h-12 transition-colors duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/30 font-montserrat relative overflow-hidden rounded-xl"
                  >
                    <div className="absolute inset-0 bg-indigo-950/0 hover:bg-indigo-950/50 transition-colors duration-300 rounded-xl"></div>
                    <div className="w-full flex items-center justify-center gap-2 relative z-10">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.8, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 6 }}
                        className="will-change-transform"
                      >
                        <Sparkles className="h-4 w-4 xs:h-5 xs:w-5" />
                      </motion.div>
                      <span className="font-medium text-sm xs:text-base">Explore Features</span>
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
          className="relative z-10 w-full bg-gradient-to-b from-black to-gray-900 py-12 sm:py-16 md:py-20 px-3 sm:px-4"
        >
          {/* Enhanced background elements for visual appeal */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-900/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-indigo-900/10 to-transparent"></div>

            {/* Subtle animated particles */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-indigo-600/5 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                y: [0, -20, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-purple-600/5 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
                y: [0, 20, 0]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            />
          </div>

          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-fuchsia-400"
              >
                Experience AI-Powered Audio
              </motion.h2>

              {/* Decorative line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '80px' }}
                transition={{ duration: 0.8, delay: 1 }}
                className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-4"
              />

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="text-gray-400 max-w-xs xs:max-w-sm sm:max-w-2xl mx-auto text-sm sm:text-base"
              >
                SoundScape AI leverages cutting-edge machine learning to transform how you create and experience audio.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
              {/* Feature Card 1 */}
              <motion.div
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/30"
              >
                {/* Enhanced card header with glow effect */}
                <div className="h-24 xs:h-28 sm:h-32 md:h-40 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-indigo-600/20 flex items-center justify-center relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-indigo-500/5 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/10 blur-xl"></div>
                  </div>

                  {/* Icon with animation */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Wand2 className="h-10 w-10 xs:h-12 xs:w-12 sm:h-16 sm:w-16 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  </motion.div>
                </div>

                <div className="p-3 xs:p-4 sm:p-6">
                  <h3 className="text-base xs:text-lg sm:text-xl font-semibold mb-1 xs:mb-2">AI Audio Generation</h3>
                  <p className="text-gray-400 mb-3 xs:mb-4 text-xs xs:text-sm sm:text-base">
                    Create custom soundscapes and audio environments with simple text prompts using our Grok-powered AI.
                  </p>
                  <Link href="/ai-studio" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 text-xs xs:text-sm font-medium">
                    <span className="relative">
                      Try it now
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400/30"></span>
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 xs:h-3 xs:w-3 ml-1" />
                  </Link>
                </div>
              </motion.div>

              {/* Feature Card 2 - Music Generation */}
              <motion.div
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden hover:border-green-500/50 transition-all duration-300 shadow-lg shadow-green-500/10 hover:shadow-green-500/30"
              >
                {/* Enhanced card header with glow effect */}
                <div className="h-24 xs:h-28 sm:h-32 md:h-40 bg-gradient-to-br from-green-600/20 via-teal-600/20 to-green-600/20 flex items-center justify-center relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-green-500/5 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 blur-xl"></div>
                  </div>

                  {/* Icon with animation */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <Music className="h-10 w-10 xs:h-12 xs:w-12 sm:h-16 sm:w-16 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                  </motion.div>
                </div>

                <div className="p-3 xs:p-4 sm:p-6">
                  <h3 className="text-base xs:text-lg sm:text-xl font-semibold mb-1 xs:mb-2">AI Music Creation</h3>
                  <p className="text-gray-400 mb-3 xs:mb-4 text-xs xs:text-sm sm:text-base">
                    Generate custom music tracks with control over genre, mood, tempo, and instruments using Grok AI.
                  </p>
                  <Link href="/ai-studio?tab=music" className="text-green-400 hover:text-green-300 inline-flex items-center gap-1 text-xs xs:text-sm font-medium">
                    <span className="relative">
                      Create music
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400/30"></span>
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 xs:h-3 xs:w-3 ml-1" />
                  </Link>
                </div>
              </motion.div>

              {/* Feature Card 3 */}
              <motion.div
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30"
              >
                {/* Enhanced card header with glow effect */}
                <div className="h-24 xs:h-28 sm:h-32 md:h-40 bg-gradient-to-br from-purple-600/20 via-fuchsia-600/20 to-purple-600/20 flex items-center justify-center relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-purple-500/5 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-purple-500/10 blur-xl"></div>
                  </div>

                  {/* Icon with animation */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  >
                    <FileAudio className="h-10 w-10 xs:h-12 xs:w-12 sm:h-16 sm:w-16 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  </motion.div>
                </div>

                <div className="p-3 xs:p-4 sm:p-6">
                  <h3 className="text-base xs:text-lg sm:text-xl font-semibold mb-1 xs:mb-2">Audio Analysis</h3>
                  <p className="text-gray-400 mb-3 xs:mb-4 text-xs xs:text-sm sm:text-base">
                    Analyze any audio file to extract insights, emotions, and features using our Gemini-powered AI models.
                  </p>
                  <Link href="/ai-studio?tab=analyze" className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 text-xs xs:text-sm font-medium">
                    <span className="relative">
                      Analyze your audio
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400/30"></span>
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 xs:h-3 xs:w-3 ml-1" />
                  </Link>
                </div>
              </motion.div>

              {/* Feature Card 4 */}
              <motion.div
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30"
              >
                {/* Enhanced card header with glow effect */}
                <div className="h-24 xs:h-28 sm:h-32 md:h-40 bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-blue-600/20 flex items-center justify-center relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-blue-500/5 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-blue-500/10 blur-xl"></div>
                  </div>

                  {/* Icon with animation */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                  >
                    <Brain className="h-10 w-10 xs:h-12 xs:w-12 sm:h-16 sm:w-16 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  </motion.div>
                </div>

                <div className="p-3 xs:p-4 sm:p-6">
                  <h3 className="text-base xs:text-lg sm:text-xl font-semibold mb-1 xs:mb-2">Adaptive Environments</h3>
                  <p className="text-gray-400 mb-3 xs:mb-4 text-xs xs:text-sm sm:text-base">
                    Experience audio that adapts to your mood, surroundings, and activities in real-time.
                  </p>
                  <Link href="/features" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 text-xs xs:text-sm font-medium">
                    <span className="relative">
                      Learn more
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400/30"></span>
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 xs:h-3 xs:w-3 ml-1" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* 3D Waveform Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full max-w-3xl mx-auto my-8 sm:my-12 px-4 sm:px-0"
          >
            <WaveformScene className="mb-8 h-40 sm:h-auto" />
          </motion.div>

          <div className="mt-6 sm:mt-8 text-center relative px-4 sm:px-0">
              {/* Glow effect behind button */}
              <div className="absolute inset-0 w-64 h-14 sm:h-12 mx-auto bg-gradient-to-r from-indigo-600/30 to-purple-600/30 blur-xl rounded-full"></div>

              <div className="relative will-change-transform">
                <motion.div
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="will-change-transform"
                >
                  <Link href="/ai-studio" className="inline-block w-full sm:w-auto">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-colors duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 px-6 py-5 sm:py-6 relative overflow-hidden rounded-xl w-full sm:w-auto">
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 rounded-xl"></div>
                      <div className="flex items-center justify-center gap-3 relative z-10">
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
