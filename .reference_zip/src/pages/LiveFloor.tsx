import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Power, Lightbulb, Car, Zap, Tv, Thermometer, Joystick as JoystickIcon, Maximize2, Minimize2 } from 'lucide-react';
import nipplejs from 'nipplejs';

// Component to handle custom glTF models with naming conventions
function SmartHomeModel({ url, lights }: { url: string, lights: any }) {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Example of custom naming convention support:
        // If a mesh name starts with 'Light_', toggle its emissive material
        if (child.name.startsWith('Light_Living')) {
          child.material.emissiveIntensity = lights.living ? 2 : 0;
        }
        if (child.name.startsWith('Light_Kitchen')) {
          child.material.emissiveIntensity = lights.kitchen ? 2 : 0;
        }
      }
    });
  }, [scene, lights]);

  return <primitive object={scene} />;
}

function Room({ position, size, color, name, lightOn, onToggle, type = 'living' }: { position: [number, number, number], size: [number, number, number], color: string, name: string, lightOn: boolean, onToggle: () => void, type?: string }) {
  // Softer wall colors for better contrast with lights
  const wallColor = type === 'bedroom' ? '#f1f5f9' : type === 'kitchen' ? '#f8fafc' : type === 'bathroom' ? '#eaeff5' : '#fcfcfc';
  
  // Floor mat-like color (darker, textured feel)
  const floorColor = type === 'bedroom' ? '#475569' : type === 'living' ? '#334155' : type === 'kitchen' ? '#64748b' : color;

  return (
    <group position={position}>
      {/* Floor with 'mat' texture look (Higher roughness, darker color) */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[size[0], size[2]]} />
        <meshStandardMaterial color={floorColor} roughness={1} metalness={0} />
      </mesh>
      
      {/* Walls - Selective walls for depth view */}
      {/* Back Wall */}
      <mesh position={[0, 1.25, -size[2] / 2]} castShadow receiveShadow>
        <boxGeometry args={[size[0], 2.5, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>
      {/* Side Wall (Left) */}
      <mesh position={[-size[0] / 2, 1.25, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[2], 2.5, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>
      
      {/* Windows with glow if lights are on */}
      <mesh position={[0, 1.5, -size[2] / 2 + 0.11]}>
        <planeGeometry args={[size[0] * 0.6, 1.2]} />
        <meshStandardMaterial 
          color="#88ccff" 
          transparent 
          opacity={0.2} 
          metalness={1} 
          roughness={0} 
          emissive={lightOn ? "#44aaff" : "#000"} 
          emissiveIntensity={1}
        />
      </mesh>

      {/* Advanced Furniture */}
      {type === 'bedroom' && (
        <group position={[0, 0, 0]}>
          {/* Bed Frame */}
          <mesh position={[0, 0.25, -size[2]/4]} castShadow>
            <boxGeometry args={[size[0]*0.7, 0.5, size[2]*0.65]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Mattress / Duve */}
          <mesh position={[0, 0.55, -size[2]/4]} castShadow>
            <boxGeometry args={[size[0]*0.68, 0.2, size[2]*0.63]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Pillows */}
          <mesh position={[-size[0]*0.18, 0.68, -size[2]*0.48]} castShadow>
            <boxGeometry args={[1.2, 0.18, 0.7]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[size[0]*0.18, 0.68, -size[2]*0.48]} castShadow>
            <boxGeometry args={[1.2, 0.18, 0.7]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          {/* Side Tables */}
          <mesh position={[-size[0]*0.42, 0.3, -size[2]*0.42]} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[size[0]*0.42, 0.3, -size[2]*0.42]} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      )}

      {type === 'living' && (
        <group position={[0, 0, 0]}>
          {/* Modern L-Sofa */}
          <group position={[0, 0, size[2]/4]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[size[0]*0.8, 0.6, 1.4]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-size[0]*0.35, 0.7, 0.5]} castShadow>
              <boxGeometry args={[0.6, 0.9, 1.4]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>

          {/* TV Unit with Stand */}
          <group position={[0, 0, -size[2]/2 + 0.6]}>
            <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[4, 0.8, 0.6]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* Screen */}
            <mesh position={[0, 1.4, 0.1]}>
              <boxGeometry args={[3.2, 1.8, 0.1]} />
              <meshStandardMaterial 
                color="#000" 
                emissive={lightOn ? "#111" : "#000"} 
                metalness={1} 
                roughness={0}
              />
            </mesh>
          </group>

          {/* Detailed Colorful Plants */}
          <group position={[-size[0]/2 + 1.2, 0, size[2]/2 - 1.2]}>
            {/* Pot */}
            <mesh position={[0, 0.4, 0]} castShadow>
              <cylinderGeometry args={[0.4, 0.3, 0.8, 16]} />
              <meshStandardMaterial color="#b45309" />
            </mesh>
            {/* Main Plant Bush */}
            <mesh position={[0, 1.1, 0]} castShadow>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#14532d" />
            </mesh>
            {/* Colorful Flowers */}
            {[...Array(6)].map((_, i) => (
              <mesh 
                key={i} 
                position={[
                  Math.sin(i) * 0.5, 
                  1.2 + Math.cos(i) * 0.2, 
                  Math.cos(i) * 0.5
                ]} 
                castShadow
              >
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial color={['#ef4444', '#f59e0b', '#ec4899', '#8b5cf6'][i % 4]} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {type === 'kitchen' && (
        <group position={[0, 0, 0]}>
          {/* Main Counter Hub */}
          <group position={[size[0]/4, 0, 0]}>
            {/* Bottom Cabinets */}
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[size[0]/2, 0.9, size[2]*0.8]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            {/* Counter Top */}
            <mesh position={[0, 0.95, 0]} receiveShadow>
              <boxGeometry args={[size[0]/2 + 0.1, 0.1, size[2]*0.8 + 0.1]} />
              <meshStandardMaterial color="#0f172a" roughness={0.05} metalness={0.2} />
            </mesh>
            {/* Kitchen Stuff (Appliances) */}
            <mesh position={[-0.5, 1.15, 0]} castShadow>
              <boxGeometry args={[0.6, 0.4, 0.6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>
            <mesh position={[0.5, 1.1, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
          </group>
          
          {/* Upper Wall Shelves with Props */}
          <group position={[-size[0]/2 + 0.4, 1.8, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.6, 0.1, size[2]*0.8]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            {/* Plates/Stuff on shelf */}
            {[ -1, 0, 1 ].map(z => (
              <mesh key={z} position={[0, 0.2, z]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
                <meshStandardMaterial color="#fff" />
              </mesh>
            ))}
          </group>
          
          <group position={[-size[0]/2 + 0.4, 2.3, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.6, 0.1, size[2]*0.8]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>
        </group>
      )}
      
      {/* Label */}
      <Text
        position={[0, 0.05, size[2]/2 - 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.25}
        color="#94a3b8"
      >
        {name.toUpperCase()}
      </Text>

      {/* Main Room Light - High intensity for clear brightness */}
      <pointLight 
        position={[0, 2.3, 0]} 
        intensity={lightOn ? 18 : 0} 
        distance={20}
        decay={1.8}
        color="#fff9f0" 
        castShadow 
      />
      
      {/* Visual Modern Light Fixture */}
      <group position={[0, 2.45, 0]} onClick={onToggle}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial 
            color="#1e293b" 
            emissive={lightOn ? "#fcd34d" : "#020617"} 
            emissiveIntensity={lightOn ? 2 : 0} 
          />
        </mesh>
        {lightOn && (
           <mesh position={[0, -0.1, 0]}>
             <sphereGeometry args={[0.2, 24, 24]} />
             <meshBasicMaterial color="#fff" />
           </mesh>
        )}
      </group>
    </group>
  );
}

function Parking({ position, lightOn }: { position: [number, number, number], lightOn: boolean }) {
  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>
      
      {/* Parking Grid Lines */}
      {[ -4, 0, 4].map(x => (
        <mesh key={x} position={[x, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Detailed Lamborghini-style Car (Sharp, low, aggressive profile) */}
      <group position={[0, 0, 0]} scale={1.2}>
        {/* Chassis - Sharp wedge shape */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[2.5, 0.35, 5.0]} />
          <meshStandardMaterial color="#020617" roughness={0.05} metalness={0.95} />
        </mesh>
        
        {/* Front Bonnet - Angled down */}
        <mesh position={[0, 0.28, 1.8]} rotation={[-0.35, 0, 0]} castShadow>
           <boxGeometry args={[2.45, 0.25, 1.8]} />
           <meshStandardMaterial color="#020617" roughness={0.05} metalness={1} />
        </mesh>
        
        {/* Cockpit / Glass area - Tiny and sleek */}
        <mesh position={[0, 0.6, -0.3]} rotation={[-0.15, 0, 0]} castShadow>
          <boxGeometry args={[2.1, 0.5, 2.5]} />
          <meshStandardMaterial color="#000" roughness={0} metalness={1} transparent opacity={0.95} />
        </mesh>

        {/* Rear Diffuser / Grille */}
        <mesh position={[0, 0.45, -2.4]} castShadow>
           <boxGeometry args={[2.5, 0.6, 0.6]} />
           <meshStandardMaterial color="#0a0a0a" roughness={0.3} />
        </mesh>

        {/* Headlights (Aggressive LEDs) */}
        <mesh position={[0.95, 0.35, 2.5]}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshStandardMaterial emissive={lightOn ? "#60a5fa" : "#111"} emissiveIntensity={8} color="#60a5fa" />
        </mesh>
        <mesh position={[-0.95, 0.35, 2.5]}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshStandardMaterial emissive={lightOn ? "#60a5fa" : "#111"} emissiveIntensity={8} color="#60a5fa" />
        </mesh>
        
        {/* Rear Tail Lights (Lamborghini Y-shape style) */}
        <mesh position={[1, 0.55, -2.71]}>
           <boxGeometry args={[0.5, 0.08, 0.05]} />
           <meshStandardMaterial emissive={lightOn ? "#ef4444" : "#450a0a"} emissiveIntensity={5} color="#ef4444" />
        </mesh>
        <mesh position={[-1, 0.55, -2.71]}>
           <boxGeometry args={[0.5, 0.08, 0.05]} />
           <meshStandardMaterial emissive={lightOn ? "#ef4444" : "#450a0a"} emissiveIntensity={5} color="#ef4444" />
        </mesh>

        {/* Large Rims and Tires */}
        {[-1.25, 1.25].map(x => [ -1.6, 1.6 ].map(z => (
          <group key={`${x}-${z}`} position={[x, 0.35, z]}>
            <mesh rotation={[0, 0, Math.PI/2]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.5, 24]} />
              <meshStandardMaterial color="#0a0a0a" roughness={1} />
            </mesh>
            {/* Rim Detail */}
            <mesh position={[x > 0 ? 0.26 : -0.26, 0, 0]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.3, 0.3, 0.02, 12]} />
              <meshStandardMaterial color="#475569" metalness={1} roughness={0.1} />
            </mesh>
          </group>
        )))}
      </group>
      
      {/* Dramatic Parking Spotlight */}
      <rectAreaLight
        width={8}
        height={8}
        intensity={lightOn ? 35 : 0}
        color="#60a5fa"
        position={[0, 6, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      
      <Text
        position={[0, 0.05, 4.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.25}
        color="#f8fafc"
      >
        ELYRA PRESTIGE - PARKING 01
      </Text>
    </group>
  );
}

// --- Main Page Component ---

export default function LiveFloor() {
  const [lights, setLights] = useState({
    living: true,
    kitchen: false,
    masterBedroom: true,
    smallBedroom: false,
    bathroom: false,
    parking: false,
  });
  
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [joystickData, setJoystickData] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const joystickRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const toggleLight = (room: keyof typeof lights) => {
    setLights(prev => ({ ...prev, [room]: !prev[room] }));
  };

  // Voice Command Setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      setLastCommand(command);
      
      if (command.includes('living room on')) setLights(l => ({...l, living: true}));
      if (command.includes('living room off')) setLights(l => ({...l, living: false}));
      if (command.includes('kitchen on')) setLights(l => ({...l, kitchen: true}));
      if (command.includes('kitchen off')) setLights(l => ({...l, kitchen: false}));
      if (command.includes('master bedroom on')) setLights(l => ({...l, masterBedroom: true}));
      if (command.includes('master bedroom off')) setLights(l => ({...l, masterBedroom: false}));
      if (command.includes('small bedroom on')) setLights(l => ({...l, smallBedroom: true}));
      if (command.includes('small bedroom off')) setLights(l => ({...l, smallBedroom: false}));
      if (command.includes('parking on')) setLights(l => ({...l, parking: true}));
      if (command.includes('parking off')) setLights(l => ({...l, parking: false}));
      if (command.includes('all lights on')) setLights({living: true, kitchen: true, masterBedroom: true, smallBedroom: true, bathroom: true, parking: true});
      if (command.includes('all lights off')) setLights({living: false, kitchen: false, masterBedroom: false, smallBedroom: false, bathroom: false, parking: false});
    };

    if (isListening) recognition.start();
    else recognition.stop();

    return () => recognition.stop();
  }, [isListening]);

  // Joystick Setup
  useEffect(() => {
    if (!joystickRef.current) return;
    
    const manager = nipplejs.create({
      zone: joystickRef.current,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'black',
      size: 100
    });

    // @ts-ignore
    manager.on('move', (evt, data) => {
      const force = data.force;
      const angle = data.angle.radian;
      setJoystickData({
        x: Math.cos(angle) * force,
        y: Math.sin(angle) * force
      });
    });

    // @ts-ignore
    manager.on('end', () => {
      setJoystickData({ x: 0, y: 0 });
    });

    return () => manager.destroy();
  }, []);

  return (
    <div className={`relative w-full h-[calc(100vh-5rem)] bg-[#f8f9fa] overflow-hidden ${isFullscreen ? 'fixed inset-0 z-[100] h-screen' : ''}`}>
      {/* 3D Canvas */}
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera ref={cameraRef} makeDefault position={[12, 12, 12]} fov={35} />
        <OrbitControls 
          enablePan={true} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={8} 
          maxDistance={40} 
          makeDefault
        />
        
        <ambientLight intensity={0.6} />
        <Environment preset="apartment" />
        
        <Suspense fallback={<Text position={[0, 0, 0]} color="black">Loading Home...</Text>}>
          <group position={[0, 0, 0]}>
            {/* The Home Model Layout - Typical 2BHK Structure */}
            
            {/* Living Area (Core) */}
            <Room 
              position={[-1.5, 0, 1.5]} 
              size={[7, 3, 7]} 
              color="#ffffff" 
              name="Living Space" 
              lightOn={lights.living} 
              onToggle={() => toggleLight('living')}
              type="living"
            />
            
            {/* Kitchen (Connected to Living) */}
            <Room 
              position={[4.5, 0, 3]} 
              size={[5, 3, 4]} 
              color="#ffffff" 
              name="Kitchen" 
              lightOn={lights.kitchen} 
              onToggle={() => toggleLight('kitchen')}
              type="kitchen"
            />
            
            {/* Master Bedroom */}
            <Room 
              position={[-2, 0, -4.5]} 
              size={[6, 3, 5]} 
              color="#fcfcfc" 
              name="Master Suite" 
              lightOn={lights.masterBedroom} 
              onToggle={() => toggleLight('masterBedroom')}
              type="bedroom"
            />

            {/* Private Bathroom */}
            <Room 
              position={[2.5, 0, -4.5]} 
              size={[3, 3, 5]} 
              color="#f0f4f8" 
              name="Bath" 
              lightOn={lights.bathroom} 
              onToggle={() => toggleLight('bathroom')}
              type="bathroom"
            />

            {/* Small Bedroom */}
            <Room 
              position={[5.5, 0, -3.5]} 
              size={[3, 3, 7]} 
              color="#ffffff" 
              name="Guest" 
              lightOn={lights.smallBedroom} 
              onToggle={() => toggleLight('smallBedroom')}
              type="bedroom"
            />
            
            {/* Parking Area */}
            <Parking 
              position={[10, 0, 0]} 
              lightOn={lights.parking} 
            />
          </group>
          
          {/* Ground / Estate */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
            <circleGeometry args={[30, 64]} />
            <meshStandardMaterial color="#eeeeee" roughness={1} />
          </mesh>
          
          <ContactShadows opacity={0.3} scale={30} blur={2.5} far={10} color="#000000" />
        </Suspense>
      </Canvas>

      {/* UI Overlay - Left Side (Status) */}
      <div className="absolute top-8 left-8 flex flex-col gap-4 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-xl pointer-events-auto"
        >
          <h2 className="text-xl font-bold mb-4">Floor Integrity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${lights.living ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest leading-none">
                Living <br /> {lights.living ? 'Active' : 'Offline'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${lights.parking ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                <Car className="w-5 h-5" />
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest leading-none">
                Parking <br /> {lights.parking ? 'On' : 'Off'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Console / Voice Command Display */}
        <AnimatePresence>
          {lastCommand && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 max-w-xs"
            >
              <Zap className="w-3 h-3 text-yellow-400" />
              Cmd: {lastCommand}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* UI Overlay - Right Side (Quick Controls) */}
      <div className="absolute top-8 right-8 flex flex-col gap-4">
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:bg-white transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={() => setIsListening(!isListening)}
          className={`p-6 rounded-[24px] shadow-2xl transition-all duration-500 flex items-center justify-center ${isListening ? 'bg-red-500 text-white scale-110' : 'bg-white text-black'}`}
        >
          {isListening ? <Mic className="w-8 h-8 animate-pulse" /> : <MicOff className="w-8 h-8" />}
        </button>
      </div>

      {/* UI Overlay - Bottom (Toggle Grid) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 p-4 bg-white/20 backdrop-blur-xl rounded-[40px] border border-white/30 shadow-2xl overflow-x-auto max-w-[90vw]">
        {[
          { icon: Power, label: 'Living', key: 'living' },
          { icon: Lightbulb, label: 'Kitchen', key: 'kitchen' },
          { icon: Tv, label: 'Master', key: 'masterBedroom' },
          { icon: JoystickIcon, label: 'Guest', key: 'smallBedroom' },
          { icon: Thermometer, label: 'Bath', key: 'bathroom' },
          { icon: Car, label: 'Parking', key: 'parking' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => toggleLight(item.key as any)}
            className={`flex flex-col items-center gap-2 p-4 rounded-[32px] transition-all duration-500 min-w-[90px] ${lights[item.key as keyof typeof lights] ? 'bg-black text-white' : 'bg-white/80 text-gray-400 hover:bg-white shadow-sm'}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Joystick Container */}
      <div className="absolute bottom-12 left-12 w-32 h-32 opacity-50 hover:opacity-100 transition-opacity">
        <div ref={joystickRef} className="w-full h-full" />
      </div>

      {/* Voice Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
        Say "Kitchen On" or "All Lights Off"
      </div>
    </div>
  );
}
