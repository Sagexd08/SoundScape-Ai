"use client"

import { Suspense, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, MeshDistortMaterial } from "@react-three/drei"
import type { Mesh, Points } from "three"
import { useMouse } from "@/hooks/use-mouse"

function AudioWave({ position = [0, 0, 0], color = "#4f46e5" }) {
  const mesh = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)
  const { mouse } = useMouse()

  useFrame((state) => {
    if (!mesh.current) return

    // Subtle rotation
    mesh.current.rotation.x = state.clock.getElapsedTime() * 0.1
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.15

    // Respond to mouse movement
    const targetX = mouse.x * 0.1
    const targetY = mouse.y * 0.1

    mesh.current.position.x = position[0] + targetX
    mesh.current.position.y = position[1] + targetY

    // Pulse effect
    const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05
    mesh.current.scale.set(scale, scale, scale)
  })

  return (
    <mesh
      ref={mesh}
      position={position as [number, number, number]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[1.5, 64, 64]} />
      <MeshDistortMaterial
        color={hovered ? "#6366f1" : color}
        attach="material"
        distort={0.4}
        speed={4}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  )
}

function ParticleField() {
  const particlesRef = useRef<Points>(null) // Changed from Mesh to Points
  const { mouse } = useMouse()
  const { viewport } = useThree()

  useFrame((state) => {
    if (!particlesRef.current) return

    // Rotate the entire particle field
    particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05

    // Respond to mouse movement
    particlesRef.current.rotation.x = mouse.y * 0.02
    particlesRef.current.rotation.z = mouse.x * 0.02
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={1000}
          array={new Float32Array(3000).map(() => (Math.random() - 0.5) * 15)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#8b5cf6" sizeAttenuation transparent opacity={0.6} />
    </points>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} />

      <AudioWave position={[0, 0, -2]} color="#4f46e5" />
      <AudioWave position={[-3, 1, -4]} color="#8b5cf6" />
      <AudioWave position={[3, -1, -6]} color="#6366f1" />

      <ParticleField />

      <Environment preset="night" />
    </>
  )
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0">
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          dpr={[1, 2]} // Optimize for device pixel ratio
          performance={{ min: 0.5 }} // Add performance optimization
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}
