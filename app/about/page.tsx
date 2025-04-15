"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import HeroBackground from "@/components/three/HeroBackground"

export default function AboutPage() {
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
        <section className="pt-32 pb-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-radial from-indigo-900/20 to-transparent" />
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
                About SoundScape
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Transforming how people experience audio through AI-powered personalization
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent" />
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Our <span className="text-indigo-400">Story</span>
                </h2>
                <p className="text-gray-300 mb-4">
                  SoundScape began in 2023 with a simple question: What if our audio environments could adapt to us,
                  rather than the other way around?
                </p>
                <p className="text-gray-300 mb-4">
                  Founded by a team of audio engineers, AI researchers, and user experience designers, we set out to
                  create a platform that could analyze a person's surroundings and emotional state to generate
                  personalized audio environments in real-time.
                </p>
                <p className="text-gray-300">
                  After two years of research and development, we're proud to introduce SoundScape—a revolutionary
                  approach to audio that uses cutting-edge AI to transform how people experience sound in their daily
                  lives.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative rounded-xl overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="SoundScape team"
                    className="object-cover w-full h-full rounded-xl"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black -z-10" />
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our <span className="text-indigo-400">Mission</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                We believe that audio has the power to transform how we feel, focus, and experience the world around us.
                Our mission is to make personalized audio environments accessible to everyone, enhancing wellbeing,
                productivity, and creativity through the power of AI.
              </p>
              <div className="flex justify-center">
                <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/10 to-black -z-10" />
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Meet Our <span className="text-indigo-400">Team</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                The passionate individuals behind SoundScape's innovation
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Dr. Elena Chen",
                  role: "Founder & CEO",
                  bio: "Audio engineer with 15+ years of experience in spatial audio technologies.",
                  image: "/placeholder.svg?height=300&width=300",
                  delay: 0,
                },
                {
                  name: "Marcus Johnson",
                  role: "CTO",
                  bio: "AI researcher specializing in audio processing and machine learning.",
                  image: "/placeholder.svg?height=300&width=300",
                  delay: 1,
                },
                {
                  name: "Sophia Rodriguez",
                  role: "Head of Design",
                  bio: "UX designer focused on creating intuitive audio experiences.",
                  image: "/placeholder.svg?height=300&width=300",
                  delay: 2,
                },
                {
                  name: "David Kim",
                  role: "Head of Research",
                  bio: "Neuroscientist studying the impact of audio on cognitive function.",
                  image: "/placeholder.svg?height=300&width=300",
                  delay: 3,
                },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: member.delay * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800/50"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-indigo-400 mb-2">{member.role}</p>
                    <p className="text-gray-300 text-sm">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black -z-10" />
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our <span className="text-indigo-400">Values</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                The principles that guide everything we do at SoundScape
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Innovation",
                  description:
                    "We push the boundaries of what's possible in audio technology, constantly exploring new ways to enhance the listening experience.",
                  delay: 0,
                },
                {
                  title: "Personalization",
                  description:
                    "We believe that audio should adapt to individual preferences, environments, and emotional states for a truly personalized experience.",
                  delay: 1,
                },
                {
                  title: "Accessibility",
                  description:
                    "We're committed to making advanced audio technology accessible to everyone, regardless of technical expertise or background.",
                  delay: 2,
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: value.delay * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800/50"
                >
                  <div className="h-12 w-12 rounded-full bg-indigo-900/50 flex items-center justify-center mb-6">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/10 to-black -z-10" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center relative overflow-hidden bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-12 rounded-2xl border border-indigo-800/30"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl" />

            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Join Our Team</h2>
            <p className="text-xl text-gray-300 mb-8 relative z-10">
              We're always looking for talented individuals who are passionate about audio and AI technology.
            </p>
            <div className="flex flex-wrap gap-4 justify-center relative z-10">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-900/30 transition-all duration-300 hover:scale-105"
              >
                View Open Positions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
