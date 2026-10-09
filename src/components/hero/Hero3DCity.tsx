import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export interface MarkerInfo {
  id: string;
  name: string;
  category: string;
  position: [number, number, number];
  color: string;
  tag: string;
}

interface Hero3DCityProps {
  isPaused?: boolean;
  onSelectMarker?: (marker: MarkerInfo) => void;
  selectedMarkerId?: string | null;
  resetSignal?: number;
}

// 1. Floating Island Base & Grid Ground
function IslandBase() {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Upper island podium */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[3.4, 3.1, 0.4, 48]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Island lower bevel/foundation */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[3.1, 2.2, 0.4, 48]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.15} />
      </mesh>

      {/* Tech Edge Rim Ring */}
      <mesh position={[0, 0.21, 0]}>
        <ringGeometry args={[3.32, 3.42, 64]} />
        <meshBasicMaterial color="#6344e7" side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>

      {/* Under-Island Glowing Energy Ring */}
      <mesh position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.6, 0.05, 16, 64]} />
        <meshBasicMaterial color="#0d9488" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Buildings() {
  // Generate varied modern smart city buildings
  const buildingsData = useMemo(() => {
    const list: { pos: [number, number, number]; size: [number, number, number]; color: string; roofColor: string }[] = [];
    
    // Core high-rises
    const heights = [
      { x: -0.6, z: -0.5, h: 2.2, color: '#eef2ff', rColor: '#6344e7' },
      { x: 0.5, z: -0.4, h: 2.6, color: '#f8fafc', rColor: '#3b82f6' },
      { x: -0.2, z: 0.4, h: 1.8, color: '#f1f5f9', rColor: '#0d9488' },
      { x: 0.8, z: 0.3, h: 2.0, color: '#faf5ff', rColor: '#8b5cf6' },
      { x: -1.2, z: 0.2, h: 1.4, color: '#f8fafc', rColor: '#6344e7' },
      { x: 1.2, z: -0.7, h: 1.6, color: '#f1f5f9', rColor: '#0d9488' },
      { x: -0.8, z: -1.3, h: 1.5, color: '#eef2ff', rColor: '#3b82f6' },
      { x: 0.2, z: -1.2, h: 1.9, color: '#f8fafc', rColor: '#6344e7' },
      { x: -1.4, z: -0.6, h: 1.1, color: '#f1f5f9', rColor: '#0d9488' },
      { x: 1.4, z: 0.6, h: 1.3, color: '#faf5ff', rColor: '#6344e7' },
      { x: 0.6, z: 1.2, h: 1.2, color: '#f8fafc', rColor: '#3b82f6' },
      { x: -0.7, z: 1.1, h: 1.0, color: '#eef2ff', rColor: '#0d9488' },
    ];

    heights.forEach(b => {
      list.push({
        pos: [b.x, b.h / 2 - 0.4, b.z],
        size: [0.45, b.h, 0.45],
        color: b.color,
        roofColor: b.rColor
      });
    });

    return list;
  }, []);

  return (
    <group>
      {buildingsData.map((b, i) => (
        <group key={i} position={b.pos}>
          {/* Building Main Tower */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={b.color} roughness={0.15} metalness={0.2} />
          </mesh>
          {/* Glass Windows Accent Stripes */}
          <mesh position={[0, 0, b.size[2] / 2 + 0.005]}>
            <planeGeometry args={[b.size[0] * 0.8, b.size[1] * 0.85]} />
            <meshBasicMaterial color="#93c5fd" transparent opacity={0.35} />
          </mesh>
          {/* Roof Feature / Antenna / Garden */}
          <mesh position={[0, b.size[1] / 2 + 0.04, 0]}>
            <boxGeometry args={[b.size[0] * 0.6, 0.08, b.size[2] * 0.6]} />
            <meshStandardMaterial color={b.roofColor} roughness={0.3} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Historic Heritage Dome Structure (Shaniwar Wada / Temple motif) */}
      <group position={[-0.1, -0.15, -0.8]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.4, 0.7]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.5} />
        </mesh>
      </group>

      {/* Green Tech Park Area & Trees */}
      <group position={[-1.1, -0.38, 0.9]}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 0.04, 24]} />
          <meshStandardMaterial color="#dcfce7" roughness={0.8} />
        </mesh>
        {/* Miniature Trees */}
        {[[-0.2, 0.1], [0.15, -0.15], [-0.05, 0.25], [0.25, 0.1]].map((tp, idx) => (
          <group key={idx} position={[tp[0], 0.05, tp[1]]}>
            <mesh position={[0, 0.12, 0]}>
              <coneGeometry args={[0.08, 0.22, 8]} />
              <meshStandardMaterial color="#10b981" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.06, 6]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// 3. Animated Roads & Traffic Vehicles
function RoadsAndTraffic({ isPaused = false }: { isPaused?: boolean }) {
  const carsRef = useRef<THREE.Group>(null);
  const pulseRef1 = useRef<THREE.Mesh>(null);
  const pulseRef2 = useRef<THREE.Mesh>(null);

  // Road paths (Ring road + intersecting arteries)
  const ringRadius = 2.4;

  // Animate vehicles and light pulses
  useFrame((state) => {
    if (isPaused) return;
    const time = state.clock.getElapsedTime();

    // Pulse 1 moving along primary road
    if (pulseRef1.current) {
      const angle1 = (time * 0.8) % (Math.PI * 2);
      pulseRef1.current.position.x = Math.cos(angle1) * ringRadius;
      pulseRef1.current.position.z = Math.sin(angle1) * ringRadius;
    }

    // Pulse 2 moving reverse
    if (pulseRef2.current) {
      const angle2 = (-time * 0.6) % (Math.PI * 2);
      pulseRef2.current.position.x = Math.cos(angle2) * (ringRadius * 0.7);
      pulseRef2.current.position.z = Math.sin(angle2) * (ringRadius * 0.7);
    }

    // Move cars smoothly along ring road
    if (carsRef.current) {
      carsRef.current.children.forEach((car, index) => {
        const speed = 0.45 + (index % 3) * 0.12;
        const initialOffset = (index * Math.PI) / 3;
        const currentAngle = (time * speed + initialOffset) % (Math.PI * 2);
        
        car.position.x = Math.cos(currentAngle) * ringRadius;
        car.position.z = Math.sin(currentAngle) * ringRadius;
        
        // Orient vehicle tangentially to the circle
        car.rotation.y = -currentAngle + Math.PI / 2;
      });
    }
  });

  return (
    <group position={[0, -0.38, 0]}>
      {/* Outer Ring Road Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[2.28, 2.52, 64]} />
        <meshBasicMaterial color="#e2e8f0" side={THREE.DoubleSide} />
      </mesh>

      {/* Luminous Purple Centerline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[2.39, 2.41, 64]} />
        <meshBasicMaterial color="#7957FF" transparent opacity={0.8} />
      </mesh>

      {/* Cross Arterial Road (West to East) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[4.6, 0.24]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>
      {/* Cyan Arterial Route Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[4.6, 0.03]} />
        <meshBasicMaterial color="#20D6B5" />
      </mesh>

      {/* Cross Arterial Road (North to South) */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.003, 0]}>
        <planeGeometry args={[4.6, 0.24]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.006, 0]}>
        <planeGeometry args={[4.6, 0.03]} />
        <meshBasicMaterial color="#7957FF" />
      </mesh>

      {/* Moving Light Pulses */}
      <mesh ref={pulseRef1} position={[ringRadius, 0.03, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#20D6B5" />
      </mesh>

      <mesh ref={pulseRef2} position={[ringRadius * 0.7, 0.03, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#7957FF" />
      </mesh>

      {/* Vehicles Group */}
      <group ref={carsRef}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <group key={i} position={[0, 0.04, 0]}>
            {/* Miniature Car Body */}
            <mesh castShadow>
              <boxGeometry args={[0.11, 0.05, 0.06]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#6344e7' : '#0d9488'}
                roughness={0.2}
                metalness={0.6}
              />
            </mesh>
            {/* Front Headlights glow */}
            <mesh position={[0.06, 0.01, 0]}>
              <boxGeometry args={[0.01, 0.02, 0.04]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// 4. Floating 3D City Markers (Interactive)
const MARKERS: MarkerInfo[] = [
  { id: 'm-food', name: 'FC Road Food Trail', category: 'Food & Dining', position: [-0.9, 0.8, 0.6], color: '#f59e0b', tag: 'Street Food • 4.7★' },
  { id: 'm-heritage', name: 'Shaniwar Wada Fort', category: 'Heritage & Culture', position: [-0.1, 1.1, -0.8], color: '#6344e7', tag: 'Historic 1732 • Accessible' },
  { id: 'm-hotel', name: 'Koregaon Park Suites', category: 'Hotels & Living', position: [1.1, 0.9, -0.5], color: '#3b82f6', tag: 'Boutique Stays' },
  { id: 'm-traffic', name: 'Deccan Corridor', category: 'Traffic Flow', position: [1.4, 0.7, 0.7], color: '#0d9488', tag: 'Smooth • 0 Delays' },
  { id: 'm-safety', name: 'FC Road Pothole Log', category: 'Citizen Safety', position: [-1.4, 0.6, -0.2], color: '#ef4444', tag: 'Hazard Alert • Verified' },
  { id: 'm-weather', name: 'Shivajinagar Station', category: 'Weather & AQI', position: [0.3, 1.2, 0.8], color: '#10b981', tag: '28°C • AQI 72' },
  { id: 'm-nav', name: 'Pune Central Hub', category: 'Smart Nav', position: [0.0, 1.4, 0.0], color: '#8b5cf6', tag: 'Optimal Junction' },
];

function InteractiveMarkers({
  onSelectMarker,
  selectedMarkerId,
  isPaused
}: {
  onSelectMarker?: (m: MarkerInfo) => void;
  selectedMarkerId?: string | null;
  isPaused?: boolean;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <group>
      {MARKERS.map((m, idx) => {
        const isHovered = hoveredId === m.id;
        const isSelected = selectedMarkerId === m.id;

        return (
          <MarkerItem
            key={m.id}
            marker={m}
            index={idx}
            isHovered={isHovered}
            isSelected={isSelected}
            isPaused={isPaused}
            onPointerOver={() => setHoveredId(m.id)}
            onPointerOut={() => setHoveredId(null)}
            onClick={() => onSelectMarker && onSelectMarker(m)}
          />
        );
      })}
    </group>
  );
}

function MarkerItem({
  marker,
  index,
  isHovered,
  isSelected,
  isPaused,
  onPointerOver,
  onPointerOut,
  onClick
}: {
  marker: MarkerInfo;
  index: number;
  isHovered: boolean;
  isSelected: boolean;
  isPaused?: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || isPaused) return;
    const time = state.clock.getElapsedTime();
    // Unique gentle vertical floating for each marker
    const offset = Math.sin(time * 1.8 + index * 1.1) * 0.08;
    groupRef.current.position.y = marker.position[1] + offset + (isHovered || isSelected ? 0.15 : 0);
    // Slight continuous spin
    groupRef.current.rotation.y = time * 0.8 + index;
  });

  return (
    <group
      ref={groupRef}
      position={[marker.position[0], marker.position[1], marker.position[2]]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerOut();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Glowing Outer Beacon Disc */}
      <mesh scale={isHovered || isSelected ? [1.4, 1.4, 1.4] : [1, 1, 1]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={marker.color}
          emissive={marker.color}
          emissiveIntensity={isHovered || isSelected ? 1.0 : 0.4}
          roughness={0.2}
        />
      </mesh>

      {/* Orbiting Halo Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[0.11, 0.13, 24]} />
        <meshBasicMaterial color={marker.color} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>

      {/* Pin Pointer Stem to Island */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.4, 8]} />
        <meshBasicMaterial color={marker.color} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// 5. Ambient Glowing Particles
function CityParticles({ count = 30 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r1 = Math.sin(i * 12.9898) * 43758.5453;
      const r2 = Math.sin(i * 78.233) * 43758.5453;
      const r3 = Math.sin(i * 45.164) * 43758.5453;
      pos[i * 3] = ((r1 - Math.floor(r1)) - 0.5) * 6;
      pos[i * 3 + 1] = (r2 - Math.floor(r2)) * 3.5;
      pos[i * 3 + 2] = ((r3 - Math.floor(r3)) - 0.5) * 6;
    }
    return [pos];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      // Float upward gently
      positions[i * 3 + 1] += delta * 0.15;
      if (positions[i * 3 + 1] > 3.5) {
        positions[i * 3 + 1] = 0;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#a78bfa"
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

// 6. Master City Island Scene with mouse parallax and smooth rotation
function SceneContent({
  isPaused,
  onSelectMarker,
  selectedMarkerId,
  resetSignal
}: Hero3DCityProps) {
  const islandGroupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  // Mouse Parallax coordinates
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle camera reset signal
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetSignal]);

  useFrame((state, delta) => {
    if (!islandGroupRef.current) return;
    const time = state.clock.getElapsedTime();

    if (!isPaused) {
      // 1. Gentle vertical floating motion
      islandGroupRef.current.position.y = Math.sin(time * 0.9) * 0.12;

      // 2. Slow continuous rotation
      islandGroupRef.current.rotation.y += delta * 0.12;
    }

    // 3. Subtle mouse parallax tilt (Smooth inertia lerp)
    const targetTiltX = mouseRef.current.y * 0.08;
    const targetTiltZ = -mouseRef.current.x * 0.08;
    islandGroupRef.current.rotation.x = THREE.MathUtils.lerp(islandGroupRef.current.rotation.x, targetTiltX, 0.04);
    islandGroupRef.current.rotation.z = THREE.MathUtils.lerp(islandGroupRef.current.rotation.z, targetTiltZ, 0.04);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[6, 9, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Accent Point Lights in Electric Violet & Teal */}
      <pointLight position={[-3, 2, -2]} color="#7957FF" intensity={2.5} distance={8} />
      <pointLight position={[3, 1.5, 3]} color="#20D6B5" intensity={2.0} distance={8} />

      {/* Main Floating Island Container */}
      <group ref={islandGroupRef} position={[0, 0, 0]}>
        <IslandBase />
        <Buildings />
        <RoadsAndTraffic isPaused={isPaused} />
        <InteractiveMarkers
          onSelectMarker={onSelectMarker}
          selectedMarkerId={selectedMarkerId}
          isPaused={isPaused}
        />
      </group>

      <CityParticles count={25} />

      {/* Orbit Controls with controlled limits */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
        rotateSpeed={0.5}
      />
    </>
  );
}

export const Hero3DCity: React.FC<Hero3DCityProps> = ({
  isPaused = false,
  onSelectMarker,
  selectedMarkerId,
  resetSignal = 0
}) => {
  const [hasWebGl] = useState<boolean>(() => {
    try {
      const canvas = document.createElement('canvas');
      return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  if (!hasWebGl) {
    // Graceful static fallback if WebGL is unavailable
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-3xl border border-slate-200">
        <div className="w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center text-[#6344e7] font-black text-2xl mb-3 shadow-md">
          3D
        </div>
        <h4 className="text-sm font-bold text-slate-800">CITYPULSE 3D Smart Island</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Interactive WebGL preview unavailable on this device. Essential map features remain fully accessible.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      <Canvas
        camera={{ position: [0, 4.2, 5.8], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <SceneContent
          isPaused={isPaused}
          onSelectMarker={onSelectMarker}
          selectedMarkerId={selectedMarkerId}
          resetSignal={resetSignal}
        />
      </Canvas>
    </div>
  );
};
