"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

export default function AudioWaveform({ className = "" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let hue = 240 // Starting hue (indigo/purple)

    // Set canvas dimensions
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }

    window.addEventListener("resize", resize)
    resize()

    // Create waveform animation
    const renderFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio
      const centerY = height / 2

      // Draw the waveform
      for (let i = 0; i < 3; i++) {
        const frequency = 0.01 + i * 0.005
        const amplitude = 20 + i * 5
        const speed = 0.05 + i * 0.02
        const thickness = 2 - i * 0.5
        const opacity = 0.7 - i * 0.2

        const colorHue = (hue + i * 20) % 360
        ctx.strokeStyle = `hsla(${colorHue}, 80%, 60%, ${opacity})`
        ctx.lineWidth = thickness

        ctx.beginPath()

        for (let x = 0; x < width; x++) {
          const time = Date.now() * speed * 0.001
          const y = centerY + Math.sin(x * frequency + time) * amplitude

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.stroke()
      }

      // Gradually shift the color hue
      hue = (hue + 0.1) % 360

      animationFrameId = requestAnimationFrame(renderFrame)
    }

    renderFrame()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={`relative overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  )
}
