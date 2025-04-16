"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedGradientTextProps {
  text: string
  className?: string
  from?: string
  via?: string
  to?: string
}

export default function AnimatedGradientText({
  text,
  className = "",
  from = "from-indigo-400",
  via = "via-purple-500",
  to = "to-indigo-600",
}: AnimatedGradientTextProps) {
  const [animationKey, setAnimationKey] = useState(0)

  // Reset animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <span className={cn("relative inline-block", className)}>
      <motion.span
        key={animationKey}
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: "100% 50%" }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className={cn("bg-clip-text text-transparent bg-gradient-to-r", from, via, to, "bg-[length:200%_auto]")}
      >
        {text}
      </motion.span>
    </span>
  )
}
