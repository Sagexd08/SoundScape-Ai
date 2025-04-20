"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import HeroScene from "@/components/hero-scene";
import FeatureCard from "@/components/feature-card";
import LoadingScene from "@/components/loading-scene";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { Wand2, FileAudio, Headphones, Brain, Sparkles, ArrowRight, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Placeholder imports for missing components
const HeroBackground = () => <div className="hero-background" />;
const Suspense = ({ fallback, children }: { fallback: React.ReactNode; children: React.ReactNode }) => children;
const AnimatedGradientText = ({ text }: { text: string }) => <span className="animated-gradient-text">{text}</span>;
const PlayCircle = ({ className }: { className?: string }) => <div className={className}>▶</div>;
const Download = ({ className }: { className?: string }) => <div className={className}>⬇</div>;
const AudioWaveform = ({ className }: { className?: string }) => <div className={className}>AudioWaveform</div>;
const TestimonialCarousel = () => <div>TestimonialCarousel</div>;
const CheckCircle = ({ className }: { className?: string }) => <div className={className}>✔</div>;

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 z-0">
        <HeroBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <section className="relative h-screen w-full">
          <div className="absolute inset-0 bg-gradient-radial from-indigo-900/20 to-transparent" />
          <Suspense fallback={<LoadingScene />}>
            <HeroScene />
          </Suspense>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                <AnimatedGradientText text="SoundScape" />
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl md:text-2xl max-w-2xl mb-8 text-gray-300"
            >
              AI-powered audio environments that adapt to your surroundings and mood in real-time
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg">
                <PlayCircle className="mr-2 h-5 w-5" />
                Try Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-indigo-600 text-indigo-400 hover:bg-indigo-950 text-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download App
              </Button>
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <Button variant="ghost" className="animate-bounce text-gray-400" onClick={scrollToFeatures}>
              Explore Features
            </Button>
          </div>
        </section>

        <section ref={featuresRef} className="relative py-24 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent" />
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 via-indigo-950/10 to-black/0" />
            <AudioWaveform className="w-full h-full opacity-30" />
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Immersive Audio <AnimatedGradientText text="Experience" />
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  SoundScape transforms how you interact with your environment through the power of AI-generated audio
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
