import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Updated prop name to 'setSelectedData' to match App.jsx
export default function CyberpunkSwarm({ count = 100, collisionThreshold = 0.5, setSelectedData }) {
  const meshRef = useRef();
  
  // Generate random initial orbital parameters and mock metadata
  const satellites = useMemo(() => {
    return new Array(count).fill().map((_, i) => ({
      // Math data for the simulation loop
      radius: 2.8 + Math.random() * 2.2, 
      speed: 0.005 + Math.random() * 0.015,
      offset: Math.random() * Math.PI * 2,
      inclination: (Math.random() - 0.5) * Math.PI * 0.5, // Realistic LEO tilt
      
      // Metadata for the HUD
      id: 64157 + i,
      altitude: Math.round(300 + Math.random() * 200),
      inclination_deg: Math.round(53 + Math.random() * 10),
      velocity: (7.5 + Math.random()).toFixed(2),
    }));
  }, [count]);

  const [collisionIndices, setCollisionIndices] = useState(new Set());

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const tempObject = new THREE.Object3D();
    const positions = [];
    const newCollisions = new Set();

    satellites.forEach((sat, i) => {
      const angle = t * sat.speed + sat.offset;
      
      // Calculate orbital position
      const x = Math.cos(angle) * sat.radius;
      const z = Math.sin(angle) * sat.radius;
      const y = Math.sin(angle * 0.5) * Math.sin(sat.inclination) * sat.radius;

      positions.push(new THREE.Vector3(x, y, z));

      tempObject.position.set(x, y, z);
      
      // Orient the "pods" to face their direction of travel
      tempObject.lookAt(0, 0, 0); 
      tempObject.rotateX(Math.PI / 2);
      
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    });

    // Proximity checks
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (positions[i].distanceTo(positions[j]) < collisionThreshold) {
          newCollisions.add(i);
          newCollisions.add(j);
        }
      }
    }

    // Update instance colors
    satellites.forEach((_, i) => {
      const color = newCollisions.has(i) ? new THREE.Color('#ff0055') : new THREE.Color('#00ffff');
      meshRef.current.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    
    setCollisionIndices(newCollisions);
  });

  return (
    <group>
        <instancedMesh 
            ref={meshRef} 
            args={[null, null, count]}
            // 1. CHANGED TO ONCLICK: This persists the data on the HUD
            onClick={(e) => {
                e.stopPropagation(); // Prevents clicking through to the Earth
                const satIndex = e.instanceId;
                const satData = satellites[satIndex];
                
                // Pass the selected satellite data back to App.jsx
                setSelectedData({
                    id: satData.id,
                    altitude: satData.altitude,
                    inclination: satData.inclination_deg,
                    velocity: satData.velocity,
                    isAtRisk: collisionIndices.has(satIndex)
                });
            }}
        >
            {/* Sleek rectangular pod geometry */}
            <boxGeometry args={[0.12, 0.03, 0.06]} />
            <meshStandardMaterial emissiveIntensity={2} /> 
        </instancedMesh>
    </group>
  );
}