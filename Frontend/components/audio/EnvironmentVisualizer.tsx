'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface EnvironmentVisualizerProps {
  environment: string;
  audioPlaying: boolean;
  audioData: number[];
}

export default function EnvironmentVisualizer({
  environment,
  audioPlaying,
  audioData
}: EnvironmentVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create environment-specific objects
    createEnvironment(environment);

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      // Animate objects based on audio data
      animateObjects();

      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      window.removeEventListener('resize', handleResize);
    };
  }, [environment]);

  // Create environment-specific objects
  const createEnvironment = (env: string) => {
    if (!sceneRef.current) return;

    // Clear existing objects
    objectsRef.current.forEach(obj => sceneRef.current?.remove(obj));
    objectsRef.current = [];

    // Create new objects based on environment
    switch (env) {
      case 'forest':
        createForestEnvironment();
        break;
      case 'ocean':
        createOceanEnvironment();
        break;
      case 'city':
        createCityEnvironment();
        break;
      case 'mountains':
        createMountainsEnvironment();
        break;
      case 'rain':
        createRainEnvironment();
        break;
      case 'cafe':
        createCafeEnvironment();
        break;
      default:
        createDefaultEnvironment();
        break;
    }
  };

  // Create forest environment
  const createForestEnvironment = () => {
    if (!sceneRef.current) return;

    // Create trees
    for (let i = 0; i < 20; i++) {
      const treeGeometry = new THREE.ConeGeometry(0.2, 1, 8);
      const treeMaterial = new THREE.MeshPhongMaterial({ color: 0x2d572c });
      const tree = new THREE.Mesh(treeGeometry, treeMaterial);

      tree.position.x = Math.random() * 10 - 5;
      tree.position.y = Math.random() * 2 - 1;
      tree.position.z = Math.random() * 10 - 10;

      sceneRef.current.add(tree);
      objectsRef.current.push(tree);

      // Create trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
      const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

      trunk.position.x = tree.position.x;
      trunk.position.y = tree.position.y - 0.75;
      trunk.position.z = tree.position.z;

      sceneRef.current.add(trunk);
      objectsRef.current.push(trunk);
    }

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x3a5f0b, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    ground.rotation.x = Math.PI / 2;
    ground.position.y = -1.5;
    ground.position.z = -5;

    sceneRef.current.add(ground);
    objectsRef.current.push(ground);
  };

  // Create ocean environment
  const createOceanEnvironment = () => {
    if (!sceneRef.current) return;

    // Create water
    const waterGeometry = new THREE.PlaneGeometry(20, 20, 50, 50);
    const waterMaterial = new THREE.MeshPhongMaterial({
      color: 0x0077be,
      side: THREE.DoubleSide,
      wireframe: true
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);

    water.rotation.x = Math.PI / 2;
    water.position.y = -1;
    water.position.z = -5;

    sceneRef.current.add(water);
    objectsRef.current.push(water);

    // Create sun
    const sunGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);

    sun.position.x = 3;
    sun.position.y = 2;
    sun.position.z = -8;

    sceneRef.current.add(sun);
    objectsRef.current.push(sun);
  };

  // Create city environment
  const createCityEnvironment = () => {
    if (!sceneRef.current) return;

    // Create buildings
    for (let i = 0; i < 15; i++) {
      const height = Math.random() * 3 + 1;
      const buildingGeometry = new THREE.BoxGeometry(0.5, height, 0.5);
      const buildingMaterial = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0x888888 : 0x555555
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

      building.position.x = Math.random() * 10 - 5;
      building.position.y = height / 2 - 1;
      building.position.z = Math.random() * 10 - 10;

      sceneRef.current.add(building);
      objectsRef.current.push(building);
    }

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    ground.rotation.x = Math.PI / 2;
    ground.position.y = -1;
    ground.position.z = -5;

    sceneRef.current.add(ground);
    objectsRef.current.push(ground);
  };

  // Create mountains environment
  const createMountainsEnvironment = () => {
    if (!sceneRef.current) return;

    // Create mountains
    for (let i = 0; i < 10; i++) {
      const height = Math.random() * 3 + 1;
      const mountainGeometry = new THREE.ConeGeometry(1, height, 4);
      const mountainMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);

      mountain.position.x = Math.random() * 20 - 10;
      mountain.position.y = height / 2 - 1;
      mountain.position.z = Math.random() * 10 - 15;

      sceneRef.current.add(mountain);
      objectsRef.current.push(mountain);
    }

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x7cfc00, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    ground.rotation.x = Math.PI / 2;
    ground.position.y = -1;
    ground.position.z = -10;

    sceneRef.current.add(ground);
    objectsRef.current.push(ground);
  };

  // Create rain environment
  const createRainEnvironment = () => {
    if (!sceneRef.current) return;

    // Create raindrops
    for (let i = 0; i < 200; i++) {
      const raindropGeometry = new THREE.SphereGeometry(0.03, 8, 8);
      const raindropMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaff });
      const raindrop = new THREE.Mesh(raindropGeometry, raindropMaterial);

      raindrop.position.x = Math.random() * 20 - 10;
      raindrop.position.y = Math.random() * 10;
      raindrop.position.z = Math.random() * 10 - 10;

      sceneRef.current.add(raindrop);
      objectsRef.current.push(raindrop);
    }

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    ground.rotation.x = Math.PI / 2;
    ground.position.y = -1;
    ground.position.z = -5;

    sceneRef.current.add(ground);
    objectsRef.current.push(ground);
  };

  // Create cafe environment
  const createCafeEnvironment = () => {
    if (!sceneRef.current) return;

    // Create tables
    for (let i = 0; i < 5; i++) {
      const tableGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
      const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);

      table.position.x = Math.random() * 8 - 4;
      table.position.y = -0.5;
      table.position.z = Math.random() * 8 - 8;

      sceneRef.current.add(table);
      objectsRef.current.push(table);

      // Create cups
      const cupGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
      const cupMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const cup = new THREE.Mesh(cupGeometry, cupMaterial);

      cup.position.x = table.position.x + Math.random() * 0.3 - 0.15;
      cup.position.y = -0.35;
      cup.position.z = table.position.z + Math.random() * 0.3 - 0.15;

      sceneRef.current.add(cup);
      objectsRef.current.push(cup);
    }

    // Create walls
    const wallGeometry = new THREE.BoxGeometry(10, 5, 0.1);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xd2b48c });
    
    // Back wall
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.z = -10;
    sceneRef.current.add(backWall);
    objectsRef.current.push(backWall);
    
    // Side walls
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -5;
    leftWall.position.z = -5;
    sceneRef.current.add(leftWall);
    objectsRef.current.push(leftWall);
    
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.position.x = 5;
    rightWall.position.z = -5;
    sceneRef.current.add(rightWall);
    objectsRef.current.push(rightWall);

    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    floor.rotation.x = Math.PI / 2;
    floor.position.y = -1;
    floor.position.z = -5;

    sceneRef.current.add(floor);
    objectsRef.current.push(floor);
  };

  // Create default environment
  const createDefaultEnvironment = () => {
    if (!sceneRef.current) return;

    // Create particles
    for (let i = 0; i < 100; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(Math.random(), Math.random(), Math.random())
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);

      particle.position.x = Math.random() * 10 - 5;
      particle.position.y = Math.random() * 10 - 5;
      particle.position.z = Math.random() * 10 - 10;

      sceneRef.current.add(particle);
      objectsRef.current.push(particle);
    }
  };

  // Animate objects based on audio data
  const animateObjects = () => {
    if (!sceneRef.current || !cameraRef.current || !audioPlaying) return;

    // Get average audio level
    const averageLevel = audioData.reduce((sum, value) => sum + value, 0) / audioData.length;

    // Animate objects based on environment
    switch (environment) {
      case 'forest':
        animateForest(averageLevel);
        break;
      case 'ocean':
        animateOcean(averageLevel);
        break;
      case 'city':
        animateCity(averageLevel);
        break;
      case 'mountains':
        animateMountains(averageLevel);
        break;
      case 'rain':
        animateRain(averageLevel);
        break;
      case 'cafe':
        animateCafe(averageLevel);
        break;
      default:
        animateDefault(averageLevel);
        break;
    }

    // Rotate camera slightly
    if (cameraRef.current) {
      cameraRef.current.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
      cameraRef.current.lookAt(0, 0, -5);
    }
  };

  // Animate forest environment
  const animateForest = (level: number) => {
    objectsRef.current.forEach((obj, index) => {
      if (index % 2 === 0) { // Trees
        obj.rotation.y += 0.01 * level;
        obj.scale.y = 1 + level * 0.5;
      }
    });
  };

  // Animate ocean environment
  const animateOcean = (level: number) => {
    objectsRef.current.forEach((obj, index) => {
      if (index === 0) { // Water
        const waterMesh = obj as THREE.Mesh;
        if (waterMesh.geometry instanceof THREE.PlaneGeometry) {
          const positions = waterMesh.geometry.attributes.position;
          
          for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const time = Date.now() * 0.001;
            
            // Create wave effect
            const z = Math.sin(x * 0.5 + time) * 0.5 * level + 
                     Math.cos(y * 0.5 + time) * 0.5 * level;
            
            positions.setZ(i, z);
          }
          
          positions.needsUpdate = true;
        }
      } else if (index === 1) { // Sun
        obj.scale.set(1 + level, 1 + level, 1 + level);
      }
    });
  };

  // Animate city environment
  const animateCity = (level: number) => {
    objectsRef.current.forEach((obj, index) => {
      if (index < objectsRef.current.length - 1) { // Buildings
        obj.scale.y = (obj.scale.y * 0.9) + (level * 0.5 + 0.5) * 0.1;
      }
    });
  };

  // Animate mountains environment
  const animateMountains = (level: number) => {
    objectsRef.current.forEach((obj, index) => {
      if (index < objectsRef.current.length - 1) { // Mountains
        obj.rotation.y += 0.01 * level;
      }
    });
  };

  // Animate rain environment
  const animateRain = (level: number) => {
    objectsRef.current.forEach((obj, index) => {
      if (index < objectsRef.current.length - 1) { // Raindrops
        obj.position.y -= 0.1 * (1 + level);
        
        // Reset position when raindrop reaches the ground
        if (obj.position.y < -1) {
          obj.position.y = 10;
          obj.position.x = Math.random() * 20 - 10;
          obj.position.z = Math.random() * 10 - 10;
        }
      }
    });
  };

  // Animate cafe environment
  const animateCafe = (level: number) => {
    objectsRef.current.forEach((obj, index) => {
      if (index % 2 === 1 && index < 10) { // Cups
        obj.position.y = -0.35 + level * 0.1;
        obj.rotation.y += 0.05 * level;
      }
    });
  };

  // Animate default environment
  const animateDefault = (level: number) => {
    objectsRef.current.forEach(obj => {
      obj.rotation.x += 0.01 * level;
      obj.rotation.y += 0.01 * level;
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
