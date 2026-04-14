import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import HighFiEarth from './HighFiEarth';
import CyberpunkSwarm from './CyberpunkSwarm';
import './App.css'; 

export default function App() {
  const [selectedData, setSelectedData] = useState(null);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', margin: 0, padding: 0 }}>
      
      {/* CYBER HUD */}
      <div style={{ position: 'absolute', top: 30, left: 30, zIndex: 10, pointerEvents: 'none' }}>
        <h2 className="cyber-glow" style={{ fontSize: '2em', margin: 0, color: '#00ffff' }}>
          ORBITAL_DETECTOR_v1.0
        </h2>
        <p style={{ fontFamily: 'monospace', color: '#00ffff', opacity: 0.8 }}>SYSTEM_STATUS: SCANNING_LEO</p>
      </div>

      {/* DATA PANEL */}
      {selectedData && (
        <div className="data-panel-glitch" style={{
          position: 'absolute', bottom: 40, right: 40,
          width: '280px', padding: '20px',
          border: '1px solid #00ffff', background: 'rgba(0, 15, 25, 0.9)',
          color: '#ffffff', fontFamily: 'monospace', zIndex: 15
        }}>
          <button onClick={() => setSelectedData(null)} style={{ float: 'right', color: '#00ffff', background: 'none', border: 'none', cursor: 'pointer' }}>[X]</button>
          <h3 style={{ color: '#00ffff', margin: '0 0 10px 0' }}>ID_{selectedData.id}</h3>
          <p>ALTITUDE: {selectedData.altitude} KM</p>
          <p>INC: {selectedData.inclination}°</p>
          <p style={{ color: selectedData.isAtRisk ? '#ff0055' : '#00ffff' }}>
            STATUS: {selectedData.isAtRisk ? "WARNING" : "NOMINAL"}
          </p>
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        {/* BRIGHTNESS BOOST: Ambient light for base visibility */}
        <ambientLight intensity={1.5} /> 
        
        {/* MAIN SUN: Strong light from the front */}
        <directionalLight position={[10, 10, 10]} intensity={2.5} />
        
        {/* FILL LIGHT: Prevents the "Dark Side" from being pitch black */}
        <pointLight position={[-10, -5, -5]} intensity={1.5} color="#44aaff" />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
          <HighFiEarth />
          <CyberpunkSwarm count={120} collisionThreshold={0.5} setSelectedData={setSelectedData} />
        </Suspense>
        
        <OrbitControls enablePan={false} minDistance={3} maxDistance={15} />
      </Canvas>
    </div>
  );
}