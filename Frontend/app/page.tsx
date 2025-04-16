"use client"

import { useRef } from "react"
import { Suspense } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Download, PlayCircle, CheckCircle, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import HeroScene from "@/components/hero-scene"
import FeatureCard from "@/components/feature-card"
import LoadingScene from "@/components/loading-scene"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AudioWaveform from "@/components/audio-waveform"
import AnimatedGradientText from "@/components/animated-gradient-text"
import TestimonialCarousel from "@/components/testimonial-carousel"
import HeroBackground from "@/components/three/HeroBackground"

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null)

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Global background */}
      <div className="fixed inset-0 z-0">
        <HeroBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
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

        {/* Features Section */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                title="Environment Scanner"
                description="Visual-based audio matching using camera input to create soundscapes that complement your surroundings."
                icon="camera"
                delay={0}
              />
              <FeatureCard
                title="Mood-Based Customization"
                description="Input how you feel and get tailored soundscapes that enhance or transform your emotional state."
                icon="heart"
                delay={1}
              />
              <FeatureCard
                title="Real-Time Audio Adjustment"
                description="Instant audio changes based on your movement and environment for a truly responsive experience."
                icon="activity"
                delay={2}
              />
              <FeatureCard
                title="Interactive Narration"
                description="Optional storytelling or guided meditation integration to enhance your audio journey."
                icon="book-open"
                delay={3}
              />
              <FeatureCard
                title="Noise Cancellation Companion"
                description="Focus-enhancing audio that masks distractions while creating a productive atmosphere."
                icon="ear"
                delay={4}
              />
              <FeatureCard
                title="Groq-Powered AI"
                description="Ultra-fast multimodal AI technology that processes your environment in real-time."
                icon="cpu"
                delay={5}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" />
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-indigo-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-purple-600/20 rounded-full blur-[100px]" />
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
                  How It <AnimatedGradientText text="Works" />
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  SoundScape uses advanced AI to analyze your visual surroundings and emotional state, creating
                  personalized audio environments that adapt in real-time.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-16">
              {[
                {
                  title: "Analyze",
                  description: "The app scans your environment through vision and interprets your mood via text input.",
                  icon: (
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center text-xl font-bold">
                      1
                    </div>
                  ),
                },
                {
                  title: "Process",
                  description:
                    "Groq's ultra-fast AI technology processes the data to generate the perfect audio profile.",
                  icon: (
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center text-xl font-bold">
                      2
                    </div>
                  ),
                },
                {
                  title: "Adapt",
                  description: "Your soundscape continuously adjusts to changes in your environment and emotional state.",
                  icon: (
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center text-xl font-bold">
                      3
                    </div>
                  ),
                },
              ].map((step, index) => (
                <motion.div
                  key={`step-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800"
                >
                  {step.icon}
                  <h3 className="text-xl font-semibold mt-4 mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative h-64 md:h-96 mb-12 rounded-xl overflow-hidden border border-gray-800"
            >
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
                <div className="absolute inset-0 opacity-20">
                  <AudioWaveform className="w-full h-full" />
                </div>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>

            <div className="flex justify-center">
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="border-indigo-600 text-indigo-400 hover:bg-indigo-950">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  What Our <AnimatedGradientText text="Users Say" />
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  Thousands of creators, professionals, and everyday users are enhancing their audio experience with
                  SoundScape
                </p>
              </motion.div>
            </div>

            <TestimonialCarousel />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" />
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 via-purple-950/10 to-black/0" />
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
                  Simple <AnimatedGradientText text="Pricing" />
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">Choose the plan that fits your needs</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Basic",
                  price: "Free",
                  description: "Perfect for casual users",
                  features: [
                    "Basic audio environments",
                    "Limited environment scanning",
                    "Standard audio quality",
                    "5 presets",
                    "Mobile app access",
                  ],
                  cta: "Start Free",
                  popular: false,
                },
                {
                  title: "Premium",
                  price: "$9.99",
                  period: "/month",
                  description: "For audio enthusiasts",
                  features: [
                    "Advanced audio environments",
                    "Full environment scanning",
                    "High-definition audio",
                    "Unlimited presets",
                    "All platforms access",
                    "Real-time audio adjustment",
                  ],
                  cta: "Try Free for 14 Days",
                  popular: true,
                },
                {
                  title: "Pro",
                  price: "$19.99",
                  period: "/month",
                  description: "For professionals",
                  features: [
                    "Everything in Premium",
                    "Studio quality audio",
                    "Advanced noise cancellation",
                    "Custom environment creation",
                    "API access",
                    "Priority support",
                  ],
                  cta: "Try Free for 14 Days",
                  popular: false,
                },
              ].map((plan, index) => (
                <motion.div
                  key={`plan-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`relative rounded-xl overflow-hidden border ${
                    plan.popular ? "border-indigo-500" : "border-gray-800"
                  } bg-gradient-to-br ${
                    plan.popular ? "from-indigo-950/50 to-gray-900" : "from-gray-900/50 to-gray-900"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-indigo-600 text-white text-center py-1 text-sm font-medium">
                      Most Popular
                    </div>
                  )}

                  <div className={`p-6 ${plan.popular ? "pt-10" : ""}`}>
                    <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-gray-400">{plan.period}</span>}
                    </div>
                    <p className="text-gray-400 mb-6">{plan.description}</p>

                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.popular ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Download CTA */}
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" />
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-indigo-950/10" />
            <div className="absolute inset-0 opacity-30">
              <AudioWaveform className="w-full h-full" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-900/70 backdrop-blur-md rounded-xl p-10 border border-indigo-500/20"
            >
              <Headphones className="h-16 w-16 mx-auto mb-6 text-indigo-400" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your <AnimatedGradientText text="Audio Experience" />?
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Download SoundScape today and discover a new dimension of personalized audio environments.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  <Download className="mr-2 h-5 w-5" />
                  Download for iOS
                </Button>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  <Download className="mr-2 h-5 w-5" />
                  Download for Android
                </Button>
                <Button size="lg" className="bg-gray-800 hover:bg-gray-700">
                  <Download className="mr-2 h-5 w-5" />
                  Download for Desktop
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
