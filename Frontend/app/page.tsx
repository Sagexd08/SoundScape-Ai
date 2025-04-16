"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-black text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
        SoundScape AI
      </h1>

      <p className="text-xl mb-8 text-center max-w-2xl text-gray-300">
        AI-powered audio environments that adapt to your surroundings and mood in real-time
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">
          Try Demo
        </Button>

        <Button variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-950 w-full">
          <Link href="/features" className="w-full">
            Explore Features
          </Link>
        </Button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-400">
          Powered by Supabase and Vercel
        </p>
      </div>
    </div>
  );
}
