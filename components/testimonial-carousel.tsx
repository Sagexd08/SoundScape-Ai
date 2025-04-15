"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    text: "SoundScape has completely transformed my work environment. The personalized audio adapts to my mood and helps me focus better than any playlist I've ever created.",
    name: "Alex Johnson",
    title: "UX Designer",
    avatar: "/placeholder.svg?height=80&width=80",
    initials: "AJ",
    rating: 5,
  },
  {
    text: "As someone who works in busy coffee shops, the noise cancellation and adaptive audio features have been a game-changer. I can finally focus in any environment.",
    name: "Samantha Park",
    title: "Freelance Writer",
    avatar: "/placeholder.svg?height=80&width=80",
    initials: "SP",
    rating: 5,
  },
  {
    text: "The real-time audio adjustments based on my surroundings create an immersive experience that's like nothing I've tried before. Absolutely worth it.",
    name: "Marcus Chen",
    title: "Software Developer",
    avatar: "/placeholder.svg?height=80&width=80",
    initials: "MC",
    rating: 4,
  },
]

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const handlePrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="absolute inset-0 -z-10 bg-indigo-900/5 rounded-2xl blur-3xl" />

      <div className="overflow-hidden relative py-10 px-4">
        {/* Carousel */}
        <div className="relative h-[300px] sm:h-[250px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center text-center px-6"
            >
              <div className="flex mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                ))}
                {[...Array(5 - testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i + testimonials[currentIndex].rating} className="h-5 w-5 text-gray-500" />
                ))}
              </div>

              <p className="text-lg sm:text-xl mb-6 text-gray-200 italic">"{testimonials[currentIndex].text}"</p>

              <div className="mt-auto flex flex-col items-center">
                <Avatar className="h-16 w-16 mb-3 border-2 border-indigo-500/30">
                  <AvatarImage
                    src={testimonials[currentIndex].avatar || "/placeholder.svg"}
                    alt={testimonials[currentIndex].name}
                  />
                  <AvatarFallback>{testimonials[currentIndex].initials}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h4 className="font-medium">{testimonials[currentIndex].name}</h4>
                  <p className="text-sm text-gray-400">{testimonials[currentIndex].title}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-6 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrentIndex(index)
              }}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index ? "w-8 bg-indigo-500" : "w-2 bg-gray-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Control buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-indigo-900/30"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-indigo-900/30"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
