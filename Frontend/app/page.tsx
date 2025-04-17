"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import SimpleLandingScene from "@/components/three/SimpleLandingScene"
import Navbar from "@/components/navbar"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center p-0 bg-black text-white relative">
      <Navbar />
      <div className="absolute inset-0 z-0">
        <SimpleLandingScene />
      </div>
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
            Try Demo
          </Button>

          <Button
            variant="outline"
            className="border-indigo-600 text-indigo-400 hover:bg-indigo-950 w-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 font-montserrat"
          >
            <Link href="/features" className="w-full">
              Explore Features
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
