"use client"

import { useState, useEffect, useRef } from "react"

interface MousePosition {
  x: number
  y: number
}

/**
 * Custom hook for tracking mouse position with performance optimizations
 * and consistent hook rendering patterns to prevent React Error #310.
 */
export function useMouse() {
  // Always declare all state and refs, regardless of environment
  const [mouse, setMouse] = useState<MousePosition>({ x: 0, y: 0 })
  const frameRef = useRef(0)
  const lastUpdateRef = useRef(0)
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const animationFrameIdRef = useRef<number | null>(null)

  // Always use the same effect pattern
  useEffect(() => {
    // Only run mouse tracking in browser environment
    if (typeof window === 'undefined') return
    
    // Throttled mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to be between -1 and 1
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1

      // Store target position
      targetMouseRef.current = { x, y }
    }

    // Animation frame based update for smoother performance
    const updateMousePosition = () => {
      const now = performance.now()

      // Only update every 16ms (approximately 60fps)
      if (now - lastUpdateRef.current > 16) {
        // Skip frames for better performance
        frameRef.current = (frameRef.current + 1) % 2
        if (frameRef.current === 0) {
          // Smooth transition to target position
          setMouse(prev => ({
            x: prev.x + (targetMouseRef.current.x - prev.x) * 0.1,
            y: prev.y + (targetMouseRef.current.y - prev.y) * 0.1
          }))
        }

        lastUpdateRef.current = now
      }

      animationFrameIdRef.current = requestAnimationFrame(updateMousePosition)
    }

    window.addEventListener("mousemove", handleMouseMove)
    animationFrameIdRef.current = requestAnimationFrame(updateMousePosition)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [])

  return { mouse }
}
