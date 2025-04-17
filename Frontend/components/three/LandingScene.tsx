"use client"

import { Suspense, useRef, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, MeshDistortMaterial, Points, Float, Text, Trail } from "@react-three/drei"
import { Mesh, Vector3, Color, MathUtils } from "three"
import { useMouse } from "@/hooks/use-mouse"

function WaveformSphere({ position = [0, 0, 0], color = "#4f46e5", scale = 1 }) {
  const mesh = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)
  const { mouse } = useMouse()
  
  // Create a gradient color effect
  const baseColor = useMemo(() => new Color(color), [color])
  const hoverColor = useMemo(() => new Color("#6366f1"), [])
  
  useFrame((state) => {
    if (!mesh.current) return
    
    // Smooth rotation
    mesh.current.rotation.x = state.clock.getElapsedTime() * 0.1
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.15
    
    // Responsive movement based on mouse position
    mesh.current.position.x = position[0] + mouse.x * 0.15
    mesh.current.position.y = position[1] + mouse.y * 0.15
    
    // Audio-like pulsing effect
    const time = state.clock.getElapsedTime()
    const pulseScale = scale * (1 + Math.sin(time * 2) * 0.08 + Math.sin(time * 3.5) * 0.04)
    mesh.current.scale.set(pulseScale, pulseScale, pulseScale)
    
    // Color transition
    if (mesh.current.material) {
      const material = mesh.current.material as any
      if (hovered) {
        material.color.lerp(hoverColor, 0.1)
      } else {
        material.color.lerp(baseColor, 0.1)
      }
      
      // Dynamic distortion based on time
      material.distort = 0.3 + Math.sin(time) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5}>
      <mesh
        ref={mesh}
        position={position as [number, number, number]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={4}
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
  const particlesRef = useRef<Points>(null)
  const { mouse } = useMouse()
  const { viewport } = useThree()
  
  // Create more particles with varied sizes
  const particleCount = 3000
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 25
      positions[i3 + 1] = (Math.random() - 0.5) * 25
      positions[i3 + 2] = (Math.random() - 0.5) * 25
    }
    return positions
  }, [])
  
  // Create varied particle sizes
  const sizes = useMemo(() => {
    const sizes = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      sizes[i] = Math.random() * 0.1 + 0.03
    }
    return sizes
  }, [])

  useFrame((state) => {
    if (!particlesRef.current) return
    const time = state.clock.getElapsedTime()
    
    // Smoother rotation with delta time
    const delta = Math.min(0.1, state.clock.getDelta())
    particlesRef.current.rotation.y += delta * 0.05
    particlesRef.current.rotation.x = mouse.y * 0.03 + time * 0.01
    particlesRef.current.rotation.z = mouse.x * 0.03
    
    // More stable particle pulsing
    const material = particlesRef.current.material as any
    material.size = 0.08 + Math.sin(time * 0.3) * 0.02
    material.opacity = MathUtils.lerp(
      material.opacity, 
      0.6 + Math.sin(time * 0.2) * 0.1, 
      delta * 10
    )
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute 
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#8b5cf6"
        sizeAttenuation
        transparent
        opacity={0.7}
        blending={2}
      />
    </points>
  )
}

// Music note component
function MusicNote({ position = [0, 0, 0], color = "#4f46e5", scale = 1, rotationSpeed = 1 }) {
  const mesh = useRef<Mesh>(null)
  const { mouse } = useMouse()
  
  useFrame((state) => {
    if (!mesh.current) return
    const time = state.clock.getElapsedTime()
    
    // Rotation and floating movement
    mesh.current.rotation.y = time * 0.2 * rotationSpeed
    mesh.current.rotation.x = time * 0.1 * rotationSpeed
    
    // Position adjustment based on mouse
    mesh.current.position.x = position[0] + mouse.x * 0.1
    mesh.current.position.y = position[1] + mouse.y * 0.1 + Math.sin(time) * 0.1
    
    // Pulse effect
    const pulseScale = scale * (1 + Math.sin(time * 1.5) * 0.05)
    mesh.current.scale.set(pulseScale, pulseScale, pulseScale)
  })
  
  return (
    <Trail
      width={1}
      color={color}
      length={5}
      decay={1}
      attenuation={(width) => width}
    >
      <mesh ref={mesh} position={position as [number, number, number]}>
        <torusGeometry args={[0.6, 0.2, 16, 32]} />
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

// Audio wave component
function AudioWave({ position = [0, 0, 0], color = "#6366f1", width = 3, height = 1 }) {
  const mesh = useRef<Mesh>(null)
  const { mouse } = useMouse()
  
  useFrame((state) => {
    if (!mesh.current) return
    const time = state.clock.getElapsedTime()
    
    // Subtle rotation
    mesh.current.rotation.z = Math.sin(time * 0.3) * 0.1
    
    // Position adjustment based on mouse
    mesh.current.position.x = position[0] + mouse.x * 0.05
    mesh.current.position.y = position[1] + mouse.y * 0.05
    
    // Wave effect on the geometry
    const geometry = mesh.current.geometry
    const positions = geometry.attributes.position.array
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      positions[i + 1] = Math.sin(time * 2 + x * 2) * 0.2
    }
    
    geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <mesh ref={mesh} position={position as [number, number, number]}>
      <planeGeometry args={[width, height, 32, 1]} />
      <meshStandardMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={0.8} 
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#000"]} />
      <fog attach="fog" args={["#000", 5, 30]} />
      
      {/* Enhanced lighting */}
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.7} />
      <spotLight position={[-10, -10, -10]} angle={0.3} penumbra={1} intensity={0.4} color="#4f46e5" />
      
      {/* Waveform spheres */}
      <WaveformSphere position={[0, 0, -2]} color="#4f46e5" scale={1.2} />
      <WaveformSphere position={[-3, 1, -4]} color="#8b5cf6" scale={0.8} />
      <WaveformSphere position={[3, -1, -6]} color="#6366f1" scale={1} />
      
      {/* Music notes */}
      <MusicNote position={[-2, -2, -3]} color="#a855f7" scale={0.7} rotationSpeed={1.2} />
      <MusicNote position={[2, 2, -5]} color="#7c3aed" scale={0.9} rotationSpeed={0.8} />
      <MusicNote position={[-1, 3, -4]} color="#8b5cf6" scale={0.6} rotationSpeed={1.5} />
      
      {/* Audio waves */}
      <AudioWave position={[0, -2, -3]} color="#6366f1" width={4} height={0.5} />
      <AudioWave position={[2, 0, -4]} color="#a855f7" width={3} height={0.4} />
      <AudioWave position={[-2, 1, -5]} color="#4f46e5" width={2.5} height={0.3} />
      
      <ParticleCloud />
      <Environment preset="night" />
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
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}