"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AudioWaveform from "@/components/audio-waveform"
import AnimatedGradientText from "@/components/animated-gradient-text"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayCircle, Camera, Brain, Headphones, Code, Sparkles, Download, ChevronRight } from "lucide-react"
import SimpleHeroBackground from "@/components/three/SimpleHeroBackground"

export default function HowItWorksPage() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Global background */}
      <div className="fixed inset-0 z-0">
        <SimpleHeroBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-radial from-indigo-900/20 to-transparent" />
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 to-black/0" />
            <div className="absolute inset-0 opacity-20">
              <AudioWaveform className="w-full h-full" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                How <AnimatedGradientText text="SoundScape" /> Works
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl max-w-3xl mx-auto mb-8 text-gray-300"
            >
              Discover the technology behind our AI-powered audio environment generation
            </motion.p>
          </div>
        </section>

        {/* Process Overview */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">The SoundScape Process</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative">
              {/* Connection lines for desktop */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 hidden md:block -z-10" />

              {[
                {
                  title: "Input",
                  description: "Camera captures your environment and text input records your mood.",
                  icon: <Camera className="h-8 w-8" />,
                },
                {
                  title: "Process",
                  description: "AI analyzes your surroundings and emotional state to generate the perfect audio profile.",
                  icon: <Brain className="h-8 w-8" />,
                },
                {
                  title: "Output",
                  description: "Enjoy immersive, personalized audio that adapts to your environment in real-time.",
                  icon: <Headphones className="h-8 w-8" />,
                },
              ].map((step, index) => (
                <motion.div
                  key={`process-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl p-8 border border-gray-800 relative z-10"
                >
                  <div className="bg-indigo-600/20 text-indigo-400 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-400 text-center">{step.description}</p>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Deep Dive */}
        <section className="py-16 px-4 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-950/5 via-purple-950/5 to-black/0" />

          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">The Technology</h2>

            <Tabs defaultValue="vision" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-12">
                <TabsTrigger value="vision">Vision System</TabsTrigger>
                <TabsTrigger value="ai">AI Core</TabsTrigger>
                <TabsTrigger value="audio">Audio Engine</TabsTrigger>
              </TabsList>

              <TabsContent value="vision">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Advanced Vision Analysis</h3>
                    <p className="text-gray-300 mb-6">
                      Our computer vision system uses state-of-the-art image recognition to identify objects, colors,
                      lighting conditions, and spatial characteristics in your environment.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Real-time scene recognition with 98% accuracy</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Privacy-focused on-device processing</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Low-light enhancement capabilities</span>
                      </li>
                    </ul>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setActiveVideo("vision")}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      See it in action
                    </Button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-gray-800">
                    <img
                      src="/placeholder.svg?height=450&width=600"
                      alt="Vision Analysis System"
                      className="w-full h-auto"
                    />
                    {activeVideo === "vision" && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <div className="w-full max-w-lg p-6 rounded-lg bg-gray-900">
                          <div className="relative pt-[56.25%] rounded-md overflow-hidden bg-gray-800">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-center text-gray-400">Video player would load here</p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button variant="outline" onClick={() => setActiveVideo(null)}>
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="relative rounded-xl overflow-hidden border border-gray-800 order-2 md:order-1">
                    <img src="/placeholder.svg?height=450&width=600" alt="AI Core Technology" className="w-full h-auto" />
                    {activeVideo === "ai" && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <div className="w-full max-w-lg p-6 rounded-lg bg-gray-900">
                          <div className="relative pt-[56.25%] rounded-md overflow-hidden bg-gray-800">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-center text-gray-400">Video player would load here</p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button variant="outline" onClick={() => setActiveVideo(null)}>
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="order-1 md:order-2">
                    <h3 className="text-2xl font-bold mb-4">Groq-Powered AI Core</h3>
                    <p className="text-gray-300 mb-6">
                      At the heart of SoundScape is our advanced AI core, leveraging Groq's ultra-fast inference engine to
                      process multimodal inputs and generate audio profiles in milliseconds.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Sub-10ms processing latency</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Multimodal fusion of visual and text inputs</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Continuous learning and adaptation</span>
                      </li>
                    </ul>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setActiveVideo("ai")}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      See it in action
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audio">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Dynamic Audio Generation</h3>
                    <p className="text-gray-300 mb-6">
                      Our proprietary audio engine synthesizes high-fidelity soundscapes in real-time, generating adaptive
                      audio that responds to your environment and emotional state.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Studio-quality 3D spatial audio</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Adaptive layering of up to 24 audio tracks</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                        <span>Binaural processing for immersive experiences</span>
                      </li>
                    </ul>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setActiveVideo("audio")}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Listen to examples
                    </Button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-gray-800">
                    <div className="absolute inset-0">
                      <AudioWaveform className="w-full h-full" />
                    </div>
                    <img
                      src="/placeholder.svg?height=450&width=600"
                      alt="Audio Engine Technology"
                      className="w-full h-auto opacity-80"
                    />
                    {activeVideo === "audio" && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <div className="w-full max-w-lg p-6 rounded-lg bg-gray-900">
                          <div className="relative pt-[56.25%] rounded-md overflow-hidden bg-gray-800">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-center text-gray-400">Audio player would load here</p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button variant="outline" onClick={() => setActiveVideo(null)}>
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Technical Specifications</h2>
            <p className="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
              SoundScape is built with cutting-edge technology to deliver the most immersive audio experience possible
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Audio Quality",
                  items: [
                    "24-bit / 96kHz audio processing",
                    "3D spatial audio with head tracking",
                    "Dynamic range up to 120dB",
                    "Frequency response: 20Hz - 20kHz",
                  ],
                  icon: <Headphones className="h-6 w-6" />,
                },
                {
                  title: "AI Capabilities",
                  items: [
                    "5ms inference latency",
                    "On-device processing for privacy",
                    "Continuous learning algorithms",
                    "Multi-modal input fusion",
                  ],
                  icon: <Brain className="h-6 w-6" />,
                },
                {
                  title: "Performance",
                  items: [
                    "Battery impact: <5% per hour",
                    "CPU usage: 10-15% average",
                    "Memory footprint: 200MB",
                    "Optimized for iOS and Android",
                  ],
                  icon: <Sparkles className="h-6 w-6" />,
                },
                {
                  title: "Compatibility",
                  items: [
                    "iOS 14+ and Android 10+",
                    "Windows 10+ and macOS 11+",
                    "All major headphone brands",
                    "Bluetooth 5.0+ for optimal wireless",
                  ],
                  icon: <Code className="h-6 w-6" />,
                },
                {
                  title: "Privacy & Security",
                  items: [
                    "End-to-end encryption",
                    "On-device processing where possible",
                    "GDPR and CCPA compliant",
                    "Audio data never stored remotely",
                  ],
                  icon: <Sparkles className="h-6 w-6" />,
                },
                {
                  title: "Connectivity",
                  items: [
                    "Wi-Fi for cloud features",
                    "Bluetooth for headphones",
                    "Offline mode available",
                    "Cross-device synchronization",
                  ],
                  icon: <Code className="h-6 w-6" />,
                },
              ].map((spec, index) => (
                <motion.div
                  key={`spec-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-md bg-indigo-600/20 text-indigo-400 mr-3">{spec.icon}</div>
                    <h3 className="text-xl font-semibold">{spec.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {spec.items.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <ChevronRight className="h-4 w-4 text-indigo-500 mr-2 mt-1" />
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl p-10 border border-indigo-500/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">
                Ready to Experience <AnimatedGradientText text="SoundScape" />?
              </h2>
              <p className="text-gray-300 mb-8">Download now and transform your audio environment with the power of AI</p>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <Download className="mr-2 h-5 w-5" />
                Download The App
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
