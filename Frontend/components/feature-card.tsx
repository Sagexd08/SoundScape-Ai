"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Camera, Heart, Activity, BookOpen, Ear, Cpu, ArrowRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Feature Card Components
type FeatureIconType = "camera" | "heart" | "activity" | "book-open" | "ear" | "cpu"

interface FeatureCardProps {
  title: string
  description: string
  icon: FeatureIconType
  delay?: number
}

const iconMap: Record<FeatureIconType, LucideIcon> = {
  camera: Camera,
  heart: Heart,
  activity: Activity,
  "book-open": BookOpen,
  ear: Ear,
  cpu: Cpu,
}

export default function FeatureCard({ title, description, icon, delay = 0 }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = iconMap[icon]
  
  return (
    <motion.div
      className={cn(
        "relative p-6 rounded-xl overflow-hidden transition-all duration-300",
        "bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm",
        "border border-gray-800 hover:border-indigo-500/50",
        isHovered ? "shadow-lg shadow-indigo-900/20 -translate-y-1" : "",
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 transition-opacity duration-300"
        style={{ opacity: isHovered ? 1 : 0 }}
      />
      
      <div className="flex items-center mb-4">
        <div
          className={cn(
            "p-3 rounded-lg mr-4 transition-all duration-300",
            isHovered ? "bg-indigo-600/80 scale-110" : "bg-gray-800/80",
          )}
        >
          <motion.div initial={{ rotate: 0 }} animate={{ rotate: isHovered ? 360 : 0 }} transition={{ duration: 0.5 }}>
            <Icon className="h-6 w-6" />
          </motion.div>
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      
      <p className="text-gray-400 mb-4">{description}</p>
      
      <div className="mt-auto">
        <Button
          variant="ghost"
          className={cn(
            "p-0 h-auto text-indigo-400 hover:text-indigo-300 hover:bg-transparent",
            "opacity-0 transition-opacity duration-300",
            isHovered ? "opacity-100" : "",
          )}
        >
          Learn more <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <motion.div
        className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-indigo-600/10 -mr-16 -mb-16"
        animate={{
          scale: isHovered ? 1.2 : 1,
          opacity: isHovered ? 0.2 : 0.05,
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  )
}