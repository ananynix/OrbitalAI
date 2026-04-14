import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function HighFiEarth() {
  const earthRef = useRef();

  // Load ONLY the Day Map
  const dayMap = useLoader(THREE.TextureLoader, '/earth_day.jpg');

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={earthRef}>
      {/* THE EARTH */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          map={dayMap} 
          roughness={0.4} // Makes it shiny/bright instead of matte/dark
          metalness={0.1} 
        />
      </mesh>
      
      {/* CYBER ATMOSPHERE */}
      <mesh>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshBasicMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}