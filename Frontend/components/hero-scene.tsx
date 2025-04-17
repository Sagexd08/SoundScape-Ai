"use client"

import { Suspense, useRef, useState, useEffect } from "react"
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

// Create a simpler water effect without custom shaders
function createWaterMaterial() {
  return (
    <MeshDistortMaterial
      color="#1e40af"
      attach="material"
      distort={0.4}
      speed={2}
      roughness={0.1}
      metalness={0.8}
      transparent
      opacity={0.9}
    />
  );
}

// Water surface component
function WaterSurface() {
  const waterRef = useRef<Mesh>(null);
  const { mouse } = useMouse();

  useFrame(({ clock }) => {
    if (!waterRef.current) return;

    // Animate the water surface
    const time = clock.getElapsedTime();
    waterRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    waterRef.current.rotation.z = Math.cos(time * 0.3) * 0.1;

    // Respond to mouse movement
    waterRef.current.position.x = mouse.x * 0.5;
    waterRef.current.position.y = mouse.y * 0.5;
  });

  return (
    <mesh ref={waterRef} position={[0, 0, -5]} rotation={[0, 0, 0]}>
      <planeGeometry args={[30, 30, 128, 128]} />
      {createWaterMaterial()}
    </mesh>
  );
}

function ParticleField() {
  const particlesRef = useRef<Points>(null);
  const { mouse } = useMouse();
  const { size } = useThree();
  const [particlePositions, setParticlePositions] = useState<Float32Array | null>(null);

  // Generate particles in a more interesting pattern
  useEffect(() => {
    // Adjust particle count based on screen size for performance
    const count = size.width < 768 ? 1000 : 2000;
    const positions = new Float32Array(count * 3);

    // Scale factor based on screen size
    const scaleFactor = Math.min(size.width, size.height) / 1000;
    const radiusScale = 15 * scaleFactor;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Create a spiral-like distribution
      const angle = (i / count) * Math.PI * 20;
      const radius = Math.pow(i / count, 0.5) * radiusScale;
      const height = (Math.random() - 0.5) * 5 * scaleFactor;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height + Math.sin(i / 50) * 2;
      positions[i3 + 2] = Math.sin(angle) * radius - 5; // Push back in z-axis
    }

    setParticlePositions(positions);
  }, [size.width, size.height]);

  useFrame((state) => {
    if (!particlesRef.current || !particlePositions) return;

    // Rotate the entire particle field
    particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;

    // Respond to mouse movement
    particlesRef.current.rotation.x = mouse.y * 0.02;
    particlesRef.current.rotation.z = mouse.x * 0.02;

    // Update particle positions for a flowing effect
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < posArray.length; i += 3) {
      // Add subtle wave motion
      posArray[i + 1] += Math.sin(state.clock.getElapsedTime() * 2 + posArray[i] / 2) * 0.01;

      // Reset particles that go too high or too low
      if (posArray[i + 1] > 5) posArray[i + 1] = -5;
      if (posArray[i + 1] < -5) posArray[i + 1] = 5;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!particlePositions) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlePositions, 3]}
          count={particlePositions.length / 3}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#a5b4fc"
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}

// Sound visualization component
function SoundVisualizer() {
  const visualizerRef = useRef<Mesh>(null);
  const [intensity, setIntensity] = useState(0.5);

  // Simulate audio reactivity with a pulsing effect
  useFrame(({ clock }) => {
    if (!visualizerRef.current) return;

    // Create a pulsing effect that simulates sound reactivity
    const t = clock.getElapsedTime();
    const pulse = Math.sin(t * 2) * 0.2 + 0.8;
    const fastPulse = Math.sin(t * 8) * 0.1 + 0.9;
    const combinedPulse = pulse * fastPulse;

    visualizerRef.current.scale.set(combinedPulse, combinedPulse, combinedPulse);
    setIntensity(0.5 + Math.sin(t * 3) * 0.2);
  });

  return (
    <mesh ref={visualizerRef} position={[0, 0, -10]}>
      <torusKnotGeometry args={[3, 0.6, 128, 32]} />
      <meshStandardMaterial
        color="#4f46e5"
        emissive="#2563eb"
        emissiveIntensity={intensity}
        metalness={0.8}
        roughness={0.2}
        wireframe
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#030712"]} />
      <fog attach="fog" args={["#030712", 5, 30]} />

      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={1} />

      {/* Background elements */}
      <SoundVisualizer />
      <WaterSurface />

      {/* Foreground elements */}
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
    <div className="absolute inset-0 overflow-hidden">
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          dpr={[1, 2]} // Optimize for device pixel ratio
          performance={{ min: 0.5 }} // Add performance optimization
          gl={{ antialias: true, alpha: false }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}
