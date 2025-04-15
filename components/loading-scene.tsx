"use client"

import { useEffect, useState } from "react"

export default function LoadingScene() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
      <div className="text-2xl font-bold mb-4 text-indigo-400">Loading SoundScape</div>
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-gray-400">{Math.round(progress)}%</div>
    </div>
  )
}
