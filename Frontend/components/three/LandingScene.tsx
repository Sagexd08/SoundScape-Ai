"use client"

import { Suspense, useRef, useState, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, MeshDistortMaterial, Points, Float, Trail, AdaptiveDpr, Preload } from "@react-three/drei"
import { Mesh, Vector3, Color, Points as ThreePoints } from "three"
import { useMouse } from "@/hooks/use-mouse"
import { CustomBvh } from "./utils/CustomBvh"

function WaveformSphere({ position = [0, 0, 0], color = "#4f46e5", scale = 1 }) {
  const mesh = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)
  const { mouse } = useMouse()

  // Create a gradient color effect
  const baseColor = useMemo(() => new Color(color), [color])
  const hoverColor = useMemo(() => new Color("#6366f1"), [])

  // Optimize by using less geometry detail
  const sphereDetail = useMemo(() => {
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    return isMobile ? [1.5, 32, 32] as [number, number, number] : [1.5, 48, 48] as [number, number, number]
  }, [])

  useFrame((state) => {
    if (!mesh.current) return

    // Smooth rotation - reduced frequency
    mesh.current.rotation.x = state.clock.getElapsedTime() * 0.05
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.08

    // Responsive movement based on mouse position - reduced intensity
    mesh.current.position.x = position[0] + mouse.x * 0.1
    mesh.current.position.y = position[1] + mouse.y * 0.1

    // Audio-like pulsing effect - simplified
    const time = state.clock.getElapsedTime()
    const pulseScale = scale * (1 + Math.sin(time) * 0.05)
    mesh.current.scale.set(pulseScale, pulseScale, pulseScale)

    // Color transition - smoother and more efficient
    if (mesh.current.material) {
      const material = mesh.current.material as any
      if (hovered) {
        material.color.lerp(hoverColor, 0.05)
      } else {
        material.color.lerp(baseColor, 0.05)
      }

      // Fixed distortion to avoid constant updates
      material.distort = 0.3
    }
  })

  return (
    <Float speed={1} rotationIntensity={0.8} floatIntensity={1.0}>
      <mesh
        ref={mesh}
        position={position as [number, number, number]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={sphereDetail} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  )
}

function ParticleCloud() {
  const particlesRef = useRef<ThreePoints>(null)
  const { mouse } = useMouse()
  const { size } = useThree()

  // Optimize particle count based on device - reduced for better performance
  const particleCount = useMemo(() => {
    const isMobile = size.width < 768
    return isMobile ? 500 : 1000
  }, [size.width])

  // Create particles with varied sizes
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      // Use a more clustered distribution for better visual effect with fewer particles
      const radius = Math.random() * Math.random() * 15 // Squared distribution for more central clustering
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      // Convert spherical to cartesian coordinates for more natural distribution
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi) - 5 // Push back in z-axis

      // Varied sizes with more small particles
      sizes[i] = Math.random() * Math.random() * 0.08 + 0.02
    }

    return [positions, sizes]
  }, [particleCount])

  // Use a less frequent update for performance
  const frameSkip = useRef(0)

  useFrame((state) => {
    if (!particlesRef.current) return

    // Skip frames for better performance
    frameSkip.current = (frameSkip.current + 1) % 2
    if (frameSkip.current !== 0) return

    const time = state.clock.getElapsedTime()

    // Smoother rotation with reduced frequency
    particlesRef.current.rotation.y = time * 0.03
    particlesRef.current.rotation.x = mouse.y * 0.02
    particlesRef.current.rotation.z = mouse.x * 0.02

    // Fixed material properties to avoid constant updates
    const material = particlesRef.current.material as any
    material.size = 0.06
    material.opacity = 0.6
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
        size={0.06}
        color="#8b5cf6"
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  )
}

// Music note component - optimized
function MusicNote({ position = [0, 0, 0], color = "#4f46e5", scale = 1, rotationSpeed = 1 }) {
  const mesh = useRef<Mesh>(null)
  const { mouse } = useMouse()

  // Optimize geometry detail
  const torusDetail = useMemo(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    return isMobile ? [0.6, 0.2, 8, 16] as [number, number, number, number] : [0.6, 0.2, 12, 24] as [number, number, number, number]
  }, [])

  // Skip frames for better performance
  const frameSkip = useRef(0)

  useFrame((state) => {
    if (!mesh.current) return

    // Skip frames for performance
    frameSkip.current = (frameSkip.current + 1) % 2
    if (frameSkip.current !== 0) return

    const time = state.clock.getElapsedTime()

    // Rotation and floating movement - reduced frequency
    mesh.current.rotation.y = time * 0.1 * rotationSpeed
    mesh.current.rotation.x = time * 0.05 * rotationSpeed

    // Position adjustment based on mouse - reduced intensity
    mesh.current.position.x = position[0] + mouse.x * 0.05
    mesh.current.position.y = position[1] + mouse.y * 0.05 + Math.sin(time * 0.5) * 0.05

    // Pulse effect - simplified
    const pulseScale = scale * (1 + Math.sin(time) * 0.03)
    mesh.current.scale.set(pulseScale, pulseScale, pulseScale)
  })

  return (
    <Trail
      width={0.8}
      color={color}
      length={3} // Reduced trail length
      decay={1}
      attenuation={(width) => width}
    >
      <mesh ref={mesh} position={position as [number, number, number]}>
        <torusGeometry args={torusDetail} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Trail>
  )
}

// Audio wave component - optimized
function AudioWave({ position = [0, 0, 0], color = "#6366f1", width = 3, height = 1 }) {
  const mesh = useRef<Mesh>(null)
  const { mouse } = useMouse()

  // Optimize geometry detail
  const planeDetail = useMemo(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    return [width, height, isMobile ? 16 : 24, 1] as [number, number, number, number]
  }, [width, height])

  // Skip frames for better performance
  const frameSkip = useRef(0)
  const updateRate = useRef(0)

  useFrame((state) => {
    if (!mesh.current) return

    // Skip frames for performance
    frameSkip.current = (frameSkip.current + 1) % 3
    if (frameSkip.current !== 0) return

    const time = state.clock.getElapsedTime()

    // Subtle rotation - reduced frequency
    mesh.current.rotation.z = Math.sin(time * 0.2) * 0.05

    // Position adjustment based on mouse - reduced intensity
    mesh.current.position.x = position[0] + mouse.x * 0.03
    mesh.current.position.y = position[1] + mouse.y * 0.03

    // Only update geometry every 10 frames for better performance
    updateRate.current = (updateRate.current + 1) % 10
    if (updateRate.current === 0) {
      // Wave effect on the geometry
      const geometry = mesh.current.geometry
      const positions = geometry.attributes.position.array

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        positions[i + 1] = Math.sin(time * 0.5 + x) * 0.1 // Slower, less intense wave
      }

      geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <mesh ref={mesh} position={position as [number, number, number]}>
      <planeGeometry args={planeDetail} />
      <meshStandardMaterial
        color={color}
        wireframe
        transparent
        opacity={0.7}
        emissive={color}
        emissiveIntensity={0.4}
      />
    </mesh>
  )
}

// Device detection for conditional rendering
function useIsMobile() {
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
  const isMobile = useIsMobile()

  return (
    <>
      <color attach="background" args={["#000"]} />
      <fog attach="fog" args={["#000", 5, 30]} />

      {/* Optimized lighting */}
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.6} />

      {/* Waveform spheres - reduced for mobile */}
      <WaveformSphere position={[0, 0, -2]} color="#4f46e5" scale={1.2} />
      {!isMobile && <WaveformSphere position={[-3, 1, -4]} color="#8b5cf6" scale={0.8} />}
      {!isMobile && <WaveformSphere position={[3, -1, -6]} color="#6366f1" scale={1} />}

      {/* Music notes - reduced for mobile */}
      <MusicNote position={[-2, -2, -3]} color="#a855f7" scale={0.7} rotationSpeed={1.2} />
      {!isMobile && <MusicNote position={[2, 2, -5]} color="#7c3aed" scale={0.9} rotationSpeed={0.8} />}
      {!isMobile && <MusicNote position={[-1, 3, -4]} color="#8b5cf6" scale={0.6} rotationSpeed={1.5} />}

      {/* Audio waves - reduced for mobile */}
      <AudioWave position={[0, -2, -3]} color="#6366f1" width={4} height={0.5} />
      {!isMobile && <AudioWave position={[2, 0, -4]} color="#a855f7" width={3} height={0.4} />}
      {!isMobile && <AudioWave position={[-2, 1, -5]} color="#4f46e5" width={2.5} height={0.3} />}

      <ParticleCloud />
      <Environment preset="night" />

      {/* Performance optimizations */}
      <CustomBvh />
      <Preload all />
    </>
  )
}

export default function LandingScene() {
  return (
    <div className="absolute inset-0">
      <Suspense fallback={<div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-indigo-500 text-2xl font-montserrat animate-pulse-slow">Loading Experience...</div>
      </div>}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{
            antialias: false, // Disable antialiasing for performance
            powerPreference: "high-performance",
            alpha: false,
            stencil: false,
            depth: true
          }}
          performance={{ min: 0.3 }} // Less aggressive performance scaling
          frameloop="always" // Continuous rendering for smoother animation
        >
          <AdaptiveDpr pixelated /> {/* Automatically adjust resolution based on device performance */}
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}