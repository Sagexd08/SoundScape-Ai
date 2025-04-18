"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AudioWaveform from "@/components/audio-waveform"
import AnimatedGradientText from "@/components/animated-gradient-text"
import { Button } from "@/components/ui/button"
import { Headphones, Camera, Heart, Activity, BookOpen, Ear, Cpu, Check, ArrowRight } from "lucide-react"
import BackgroundLayout from "@/components/layouts/BackgroundLayout"

export default function FeaturesPage() {
  return (
    <BackgroundLayout>
      <main className="min-h-screen overflow-hidden">
        {/* Content */}
        <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-radial from-indigo-900/20 to-transparent" />
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 to-black/0" />
            <div className="absolute inset-0 opacity-30">
              <AudioWaveform className="w-full h-full" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Our <AnimatedGradientText text="Features" />
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl max-w-3xl mx-auto mb-8 text-gray-300"
            >
              Explore the innovative features that make SoundScape the most advanced AI-powered audio environment platform
            </motion.p>
          </div>
        </section>

        {/* Main Features Content */}
        {[
          {
            title: "Environment Scanner",
            description:
              "Our advanced vision system analyzes your surroundings and generates audio that perfectly complements what you see.",
            icon: <Camera className="h-8 w-8" />,
            image: "/placeholder.svg?height=600&width=800",
            features: [
              "Visual scene recognition and analysis",
              "Real-time environment adaptation",
              "Privacy-focused with on-device processing",
              "Works in any lighting condition",
            ],
            gradient: "from-blue-600/20 via-indigo-600/20 to-transparent",
          },
          {
            title: "Mood-Based Customization",
            description:
              "Tell SoundScape how you feel, and it will generate a personalized audio environment to enhance or transform your emotional state.",
            icon: <Heart className="h-8 w-8" />,
            image: "/placeholder.svg?height=600&width=800",
            features: [
              "Emotion detection through text input",
              "Customizable mood presets",
              "Gradual mood transition capability",
              "Personalized emotional profiles",
            ],
            gradient: "from-purple-600/20 via-indigo-600/20 to-transparent",
          },
          {
            title: "Real-Time Audio Adjustment",
            description:
              "As you move through your environment or your surroundings change, SoundScape automatically adjusts to provide a continuous, immersive experience.",
            icon: <Activity className="h-8 w-8" />,
            image: "/placeholder.svg?height=600&width=800",
            features: [
              "Motion-reactive audio",
              "Seamless transition between environments",
              "Low-latency adjustments",
              "Accelerometer and GPS integration",
            ],
            gradient: "from-indigo-600/20 via-blue-600/20 to-transparent",
          },
          {
            title: "Interactive Narration",
            description:
              "Enhance your experience with optional storytelling or guided meditation that responds to your environment and mood.",
            icon: <BookOpen className="h-8 w-8" />,
            image: "/placeholder.svg?height=600&width=800",
            features: [
              "Dynamic storytelling engine",
              "Guided meditation experiences",
              "Voice selection from premium voice models",
              "Custom content creation tools",
            ],
            gradient: "from-sky-600/20 via-indigo-600/20 to-transparent",
          },
          {
            title: "Noise Cancellation Companion",
            description:
              "Block out distractions with advanced noise masking that creates a focused, productive atmosphere.",
            icon: <Ear className="h-8 w-8" />,
            image: "/placeholder.svg?height=600&width=800",
            features: [
              "Adaptive noise cancellation",
              "Distraction identification and masking",
              "Focus-enhancing sound profiles",
              "Compatible with all headphone types",
            ],
            gradient: "from-violet-600/20 via-indigo-600/20 to-transparent",
          },
          {
            title: "Groq-Powered AI",
            description:
              "SoundScape leverages Groq's ultra-fast multimodal AI to process your environment in real-time, ensuring responsive and intelligent audio generation.",
            icon: <Cpu className="h-8 w-8" />,
            image: "/placeholder.svg?height=600&width=800",
            features: [
              "Ultra-fast processing with low latency",
              "Multimodal AI capabilities",
              "Energy-efficient operation",
              "Continuous improvement through machine learning",
            ],
            gradient: "from-indigo-600/20 via-purple-600/20 to-transparent",
          },
        ].map((feature, index) => (
          <section key={`feature-${index}`} className="py-20 px-4 relative">
            <div className={`absolute inset-0 -z-10 bg-gradient-radial ${feature.gradient}`} />

            <div className="max-w-6xl mx-auto">
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              >
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="rounded-xl overflow-hidden border border-gray-800">
                    <img
                      src={feature.image || "/placeholder.svg"}
                      alt={feature.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 mr-4 rounded-lg bg-indigo-600/20 text-indigo-400">{feature.icon}</div>
                    <h2 className="text-3xl font-bold">{feature.title}</h2>
                  </div>

                  <p className="text-xl text-gray-300 mb-6">{feature.description}</p>

                  <ul className="mb-8 space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-indigo-500 mr-3 mt-1" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-950/20 to-transparent" />

          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-900/70 backdrop-blur-md rounded-xl p-10 border border-indigo-500/20"
            >
              <Headphones className="h-16 w-16 mx-auto mb-6 text-indigo-400" />
              <h2 className="text-3xl font-bold mb-4">
                Experience SoundScape <AnimatedGradientText text="Today" />
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Download our app and transform your audio experience with the power of AI
              </p>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Get Started For Free
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
      </main>
    </BackgroundLayout>
  )
}
