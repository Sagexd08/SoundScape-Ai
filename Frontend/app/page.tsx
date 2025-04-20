"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { Wand2, FileAudio, Headphones, Brain, Sparkles, ArrowRight, Music } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SimpleBackgroundLayout from "@/components/layouts/SimpleBackgroundLayout";

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
    <SimpleBackgroundLayout>
      <div className="flex min-h-screen flex-col items-center p-0 relative">
        <Navbar />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-7xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 animate-gradient bg-[length:200%_auto] font-montserrat tracking-tight"
          >
            SoundScape AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl mb-8 text-center max-w-2xl text-gray-300 font-montserrat font-light leading-relaxed"
          >
            AI-powered audio environments that adapt to your surroundings and mood in real-time
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
          >
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 w-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 font-montserrat"
            >
              <Link href="/ai-studio" className="w-full flex items-center justify-center gap-2">
                <Wand2 className="h-4 w-4" />
                Try AI Studio
              </Link>
            </Button>

            <Button
              variant="outline"
              className="border-indigo-600 text-indigo-400 hover:bg-indigo-950 w-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 font-montserrat"
            >
              <Link href="/features" className="w-full flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Explore Features
              </Link>
            </Button>
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
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300"
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
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-green-500/50 transition-all duration-300"
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
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
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
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
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

            <div className="mt-12 text-center">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
                <Link href="/ai-studio" className="flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Experience Full AI Studio
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </SimpleBackgroundLayout>
  );
}
