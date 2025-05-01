"use client"

import { Suspense, useRef, useState, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Mesh, Color, Points as ThreePoints } from "three"
import { useMouse } from "@/hooks/use-mouse"
import { ClientOnly } from "@/components/client-only"

// Simple sphere component (water droplet-like)
function WaveformSphere({ position = [0, 0, 0], color = "#4f46e5", scale = 1 }) {
  const mesh = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)
  const { mouse } = useMouse()

  // Create color objects once
  const baseColor = useMemo(() => new Color(color), [color])
  const hoverColor = useMemo(() => new Color("#6366f1"), [])

  // Frame skipping for performance
  const frameSkip = useRef(0)

  useFrame((state) => {
    if (!mesh.current) return

    // Skip frames for better performance
    frameSkip.current = (frameSkip.current + 1) % 2
    if (frameSkip.current !== 0) return

    const time = state.clock.getElapsedTime()
    mesh.current.rotation.x = time * 0.05
    mesh.current.rotation.y = time * 0.08
    mesh.current.position.x = position[0] + mouse.x * 0.05
    mesh.current.position.y = position[1] + mouse.y * 0.05
    const scale = 1 + Math.sin(time * 1.5) * 0.03
    mesh.current.scale.set(scale, scale, scale)

    // Smooth color transition
    if (mesh.current.material) {
      const material = mesh.current.material as any
      if (hovered) {
        material.color.lerp(hoverColor, 0.1)
      } else {
        material.color.lerp(baseColor, 0.1)
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
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  )
}

// Simple particle field
function ParticleField() {
  const particlesRef = useRef<ThreePoints>(null)
  const { mouse } = useMouse()
  const { size } = useThree()

  // Optimize particle count based on device
  const particleCount = useMemo(() => {
    const isMobile = size.width < 768
    return isMobile ? 500 : 800
  }, [size.width])

  // Create particles once with memoization
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      // Use a more clustered distribution
      const radius = Math.random() * Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      // Convert spherical to cartesian coordinates
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi) - 2

      // Varied sizes
      sizes[i] = Math.random() * 0.03 + 0.02
    }

    return [positions, sizes]
  }, [particleCount])

  // Frame skipping for performance
  const frameSkip = useRef(0)

  useFrame((state) => {
    if (!particlesRef.current) return

    // Skip frames for better performance
    frameSkip.current = (frameSkip.current + 1) % 3
    if (frameSkip.current !== 0) return

    const time = state.clock.getElapsedTime()

    // Smoother rotation with reduced frequency
    particlesRef.current.rotation.y = time * 0.02
    particlesRef.current.rotation.x = mouse.y * 0.01
    particlesRef.current.rotation.z = mouse.x * 0.01
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
        opacity={0.6}
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

function Scene() {
  const isMobile = useDeviceOptimization()

  return (
    <>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.6} />

      {/* Waveform spheres - reduced for mobile */}
      <WaveformSphere position={[0, 0, -2]} color="#4f46e5" scale={1.2} />
      {!isMobile && <WaveformSphere position={[-3, 1, -4]} color="#8b5cf6" scale={0.8} />}
      {!isMobile && <WaveformSphere position={[3, -1, -6]} color="#6366f1" scale={1} />}

      <ParticleField />
    </>
  )
}

export default function SimpleHeroBackground() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10">
      <ClientOnly fallback={<div className="w-full h-full bg-gradient-to-br from-indigo-900/20 via-gray-900/40 to-black" />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          dpr={[0.8, 1.5]} // Reduced DPR for better performance
          performance={{ min: 0.3 }} // More aggressive performance scaling
          frameloop="always" // Continuous rendering for smoother animation
          gl={{
            antialias: false, // Disable antialiasing for performance
            powerPreference: "high-performance",
            alpha: false,
            stencil: false,
            depth: true
          }}
          style={{ pointerEvents: "none" }}
        >
          <Scene />
        </Canvas>
      </ClientOnly>
    </div>
  )
}
