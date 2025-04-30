"use client"

import { Suspense, useRef, useState, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { MeshDistortMaterial, AdaptiveDpr, Preload } from "@react-three/drei"
import { Mesh, Color, Points as ThreePoints } from "three"
import { useMouse } from "@/hooks/use-mouse"
import { ClientOnly } from "@/components/client-only"

// Simplified AudioWave component without problematic dependencies
function AudioWave({ position = [0, 0, 0], color = "#4f46e5" }) {
  const mesh = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)
  const { mouse } = useMouse()

  // Create color objects once
  const baseColor = useMemo(() => new Color(color), [color])
  const hoverColor = useMemo(() => new Color("#6366f1"), [])

  // Frame skipping for performance - increased to skip more frames
  const frameSkip = useRef(0)

  useFrame((state) => {
    if (!mesh.current) return

    // Skip more frames for better performance
    frameSkip.current = (frameSkip.current + 1) % 4 // Increased from 2 to 4
    if (frameSkip.current !== 0) return

    const time = state.clock.getElapsedTime()
    mesh.current.rotation.x = time * 0.03 // Reduced rotation speed
    mesh.current.rotation.y = time * 0.05 // Reduced rotation speed
    mesh.current.position.x = position[0] + mouse.x * 0.03 // Reduced mouse influence
    mesh.current.position.y = position[1] + mouse.y * 0.03 // Reduced mouse influence
    const scale = 1 + Math.sin(time * 1.0) * 0.02 // Reduced animation intensity
    mesh.current.scale.set(scale, scale, scale)

    // Smooth color transition
    if (mesh.current.material) {
      const material = mesh.current.material as any
      if (hovered) {
        material.color.lerp(hoverColor, 0.05) // Slower transition
      } else {
        material.color.lerp(baseColor, 0.05) // Slower transition
      }
    }
  })

  return (
    <mesh
      ref={mesh}
      position={position as [number, number, number]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[1.5, 16, 16]} /> {/* Further reduced geometry detail */}
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.2} // Reduced distortion
        speed={1.5} // Reduced speed
        roughness={0.3}
        metalness={0.6} // Reduced metalness
      />
    </mesh>
  )
}

// Simplified ParticleField component
function ParticleField() {
  const particlesRef = useRef<ThreePoints>(null)
  const { mouse } = useMouse()
  const { size } = useThree()

  // Further reduce particle count for better performance
  const particleCount = useMemo(() => {
    const isMobile = size.width < 768
    return isMobile ? 200 : 400 // Further reduced for better performance
  }, [size.width])

  // Create particles once with memoization
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      // Simplified distribution - more concentrated
      const radius = Math.random() * 8 // Reduced radius
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      // Convert spherical to cartesian coordinates
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi) - 2

      // Simplified sizes - less variation
      sizes[i] = 0.03 // Fixed size for better performance
    }

    return [positions, sizes]
  }, [particleCount])

  // Frame skipping for performance - increased to skip more frames
  const frameSkip = useRef(0)

  useFrame((state) => {
    if (!particlesRef.current) return

    // Skip more frames for better performance
    frameSkip.current = (frameSkip.current + 1) % 6 // Increased from 3 to 6
    if (frameSkip.current !== 0) return

    const time = state.clock.getElapsedTime()

    // Even slower rotation
    particlesRef.current.rotation.y = time * 0.01 // Reduced from 0.02
    particlesRef.current.rotation.x = mouse.y * 0.005 // Reduced from 0.01
    particlesRef.current.rotation.z = mouse.x * 0.005 // Reduced from 0.01
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#8b5cf6"
        sizeAttenuation
        transparent
        opacity={0.5} // Reduced from 0.6
        depthWrite={false}
      />
    </points>
  )
}

// Device detection for conditional rendering
function useDeviceOptimization() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Simplified Scene component without Environment
function Scene() {
  const isMobile = useDeviceOptimization()

  return (
    <>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.15} /> {/* Reduced intensity */}
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.4} /> {/* Reduced intensity */}
      <AudioWave position={[0, 0, -2]} color="#4f46e5" />
      {/* Only render one additional wave on desktop for better performance */}
      {!isMobile && <AudioWave position={[-3, 1, -4]} color="#8b5cf6" />}
      <ParticleField />
    </>
  )
}

export default function HeroBackground() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10">
      <ClientOnly fallback={<div className="w-full h-full bg-gradient-to-br from-indigo-900/20 via-gray-900/40 to-black" />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 2]}
          style={{ pointerEvents: "none" }}
        >
          <Suspense fallback={null}>
            <AudioWave position={[-2, 0, 0]} color="#4f46e5" />
            <AudioWave position={[2, 0, 0]} color="#8b5cf6" />
            <ParticleField />
            <AdaptiveDpr pixelated />
            <Preload all />
          </Suspense>
        </Canvas>
      </ClientOnly>
    </div>
  )
}