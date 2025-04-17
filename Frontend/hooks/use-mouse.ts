"use client"

import { useState, useEffect } from "react"

interface MousePosition {
  x: number
  y: number
}

export function useMouse() {
  const [mouse, setMouse] = useState<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to be between -1 and 1
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      setMouse({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return { mouse }
}
