import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SatelliteSwarm({ count = 100, collisionThreshold = 0.5 }) {
  const meshRef = useRef();
  
  // Generate random initial orbital parameters for the swarm
  const satellites = useMemo(() => {
    return new Array(count).fill().map(() => ({
      radius: 2.5 + Math.random() * 2, // Altitude above Earth
      speed: 0.01 + Math.random() * 0.02,
      offset: Math.random() * Math.PI * 2, // Starting position
      inclination: Math.random() * Math.PI, // Orbital tilt
    }));
  }, [count]);

  const [collisionIndices, setCollisionIndices] = useState(new Set());

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const tempObject = new THREE.Object3D();
    const positions = [];
    const newCollisions = new Set();

    // 1. Calculate new positions for all satellites
    satellites.forEach((sat, i) => {
      const angle = t * sat.speed + sat.offset;
      const x = Math.cos(angle) * sat.radius;
      const z = Math.sin(angle) * sat.radius;
      
      // Apply inclination (tilt)
      const y = x * Math.sin(sat.inclination);
      const adjustedX = x * Math.cos(sat.inclination);

      positions.push(new THREE.Vector3(adjustedX, y, z));

      tempObject.position.set(adjustedX, y, z);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    });

    // 2. Perform Proximity / Collision Checks (O(N^2) complexity)
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        if (dist < collisionThreshold) {
          newCollisions.add(i);
          newCollisions.add(j);
        }
      }
    }

    // 3. Update colors based on collision status
    satellites.forEach((_, i) => {
      const color = newCollisions.has(i) ? new THREE.Color('red') : new THREE.Color('cyan');
      meshRef.current.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
    }
    
    setCollisionIndices(newCollisions);
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
}