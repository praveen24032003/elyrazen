import React from 'react';
import {
  Mic,
  MicOff,
  Send,
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';

type RoomId = 'living-room' | 'kitchen' | 'master-bedroom' | 'guest-bedroom' | 'bathroom' | 'parking-area';
type LightingPreset = 'daylight' | 'evening';

const roomLayout: Array<{ id: RoomId; name: string }> = [
  { id: 'living-room', name: 'Living Room' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'master-bedroom', name: 'Master Bedroom' },
  { id: 'guest-bedroom', name: 'Guest Bedroom' },
  { id: 'bathroom', name: 'Bathroom' },
  { id: 'parking-area', name: 'Parking Area' },
];

const roomAliases: Array<{ id: RoomId; aliases: string[] }> = [
  { id: 'living-room', aliases: ['living room', 'living'] },
  { id: 'kitchen', aliases: ['kitchen'] },
  { id: 'master-bedroom', aliases: ['master bedroom', 'master', 'bedroom', 'bed room'] },
  { id: 'guest-bedroom', aliases: ['guest room', 'guest bedroom', 'small bedroom'] },
  { id: 'bathroom', aliases: ['bathroom', 'washroom', 'toilet'] },
  { id: 'parking-area', aliases: ['parking', 'parking area', 'garage', 'car park'] },
];

function RoomZone({
  position,
  size,
  title,
  tone,
  lightOn,
  onToggle,
  type,
}: {
  position: [number, number, number];
  size: [number, number, number];
  title: string;
  tone: string;
  lightOn: boolean;
  onToggle: () => void;
  type: 'living' | 'kitchen' | 'master' | 'guest' | 'bath';
}) {
  const wallColor = type === 'kitchen' ? '#f3f1ec' : type === 'bath' ? '#e9eef2' : '#f6f3ee';
  const floorColor = type === 'living' ? '#6a5a49' : type === 'kitchen' ? '#8f8577' : type === 'bath' ? '#7b838b' : '#847668';

  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[size[0], size[2]]} />
        <meshStandardMaterial color={floorColor} roughness={0.9} metalness={0.04} />
      </mesh>

      <mesh position={[0, 1.2, -size[2] / 2]} castShadow receiveShadow>
        <boxGeometry args={[size[0], 2.4, 0.18]} />
        <meshStandardMaterial color={wallColor} roughness={0.74} metalness={0.03} />
      </mesh>

      <mesh position={[-size[0] / 2, 1.2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[2], 2.4, 0.18]} />
        <meshStandardMaterial color={wallColor} roughness={0.74} metalness={0.03} />
      </mesh>

      <mesh position={[0, 1.5, -size[2] / 2 + 0.1]}>
        <planeGeometry args={[size[0] * 0.55, 1.05]} />
        <meshStandardMaterial
          color="#a7d3ef"
          transparent
          opacity={0.14}
          metalness={0.8}
          roughness={0.1}
          emissive={lightOn ? '#1d4ed8' : '#000000'}
          emissiveIntensity={lightOn ? 0.32 : 0}
        />
      </mesh>

      {type === 'master' && (
        <group>
          <mesh position={[0, 0.25, -size[2] * 0.22]} castShadow>
            <boxGeometry args={[size[0] * 0.62, 0.5, size[2] * 0.5]} />
            <meshStandardMaterial color="#6d4f37" roughness={0.72} metalness={0.04} />
          </mesh>
          <mesh position={[0, 0.52, -size[2] * 0.22]} castShadow>
            <boxGeometry args={[size[0] * 0.6, 0.16, size[2] * 0.48]} />
            <meshStandardMaterial color="#f2ece3" roughness={0.92} metalness={0} />
          </mesh>
          <mesh position={[size[0] * 0.35, 0.3, -size[2] * 0.35]} castShadow>
            <boxGeometry args={[0.55, 0.55, 0.55]} />
            <meshStandardMaterial color="#5a4636" roughness={0.8} metalness={0.05} />
          </mesh>
          <mesh position={[size[0] * 0.35, 0.9, -size[2] * 0.35]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.5, 12]} />
            <meshStandardMaterial color="#6b7280" roughness={0.45} metalness={0.42} />
          </mesh>
          <mesh position={[size[0] * 0.35, 1.2, -size[2] * 0.35]} castShadow>
            <cylinderGeometry args={[0.2, 0.24, 0.26, 14]} />
            <meshStandardMaterial
              color={lightOn ? '#fde68a' : '#d1d5db'}
              emissive={lightOn ? '#f59e0b' : '#000000'}
              emissiveIntensity={lightOn ? 0.46 : 0}
              roughness={0.52}
              metalness={0.08}
            />
          </mesh>
        </group>
      )}

      {type === 'kitchen' && (
        <group>
          <mesh position={[size[0] * 0.2, 0.45, 0]} castShadow>
            <boxGeometry args={[size[0] * 0.5, 0.9, size[2] * 0.72]} />
            <meshStandardMaterial color="#f5f1e8" roughness={0.75} metalness={0.02} />
          </mesh>
          <mesh position={[size[0] * 0.2, 0.95, 0]} castShadow>
            <boxGeometry args={[size[0] * 0.52, 0.08, size[2] * 0.74]} />
            <meshStandardMaterial color="#2a241f" roughness={0.22} metalness={0.14} />
          </mesh>

          <mesh position={[-size[0] * 0.45, 1.35, 0]} castShadow>
            <boxGeometry args={[0.45, 0.1, size[2] * 0.66]} />
            <meshStandardMaterial color="#7b5f45" roughness={0.7} metalness={0.05} />
          </mesh>
          <mesh position={[-size[0] * 0.45, 1.85, 0]} castShadow>
            <boxGeometry args={[0.45, 0.1, size[2] * 0.66]} />
            <meshStandardMaterial color="#7b5f45" roughness={0.7} metalness={0.05} />
          </mesh>
        </group>
      )}

      {type === 'living' && (
        <group>
          {/* Blue sectional sofa */}
          <mesh position={[-0.35, 0.32, size[2] * 0.2]} castShadow>
            <boxGeometry args={[size[0] * 0.48, 0.5, 1.2]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.65} metalness={0.03} />
          </mesh>
          <mesh position={[size[0] * 0.08, 0.56, size[2] * 0.31]} castShadow>
            <boxGeometry args={[size[0] * 0.24, 0.18, 0.9]} />
            <meshStandardMaterial color="#2563eb" roughness={0.62} metalness={0.02} />
          </mesh>

          {/* Center table */}
          <mesh position={[0.8, 0.23, size[2] * 0.1]} castShadow>
            <boxGeometry args={[1.4, 0.12, 0.8]} />
            <meshStandardMaterial color="#efefef" roughness={0.32} metalness={0.35} />
          </mesh>

          {/* TV wall */}
          <mesh position={[0, 1.3, -size[2] * 0.35]} castShadow>
            <boxGeometry args={[2.8, 1.5, 0.08]} />
            <meshStandardMaterial
              color="#090909"
              emissive={lightOn ? '#121212' : '#000000'}
              emissiveIntensity={0.18}
              roughness={0.18}
              metalness={0.64}
            />
          </mesh>

          {/* Decorative plant */}
          <mesh position={[-size[0] * 0.42, 0.22, size[2] * 0.4]} castShadow>
            <cylinderGeometry args={[0.18, 0.15, 0.4, 12]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.8} metalness={0.04} />
          </mesh>
          <mesh position={[-size[0] * 0.42, 0.62, size[2] * 0.4]} castShadow>
            <sphereGeometry args={[0.28, 14, 14]} />
            <meshStandardMaterial color="#14532d" roughness={0.78} metalness={0} />
          </mesh>
        </group>
      )}

      <Text position={[0, 0.05, size[2] * 0.38]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.22} color={tone}>
        {title.toUpperCase()}
      </Text>

      <pointLight position={[0, 2.1, 0]} intensity={lightOn ? 11.5 : 0} distance={14} decay={2} color="#fff5e8" castShadow />

      <group position={[0, 2.3, 0]} onClick={onToggle}>
        <mesh castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.1, 28]} />
          <meshStandardMaterial
            color="#242424"
            roughness={0.34}
            metalness={0.46}
            emissive={lightOn ? '#facc15' : '#020617'}
            emissiveIntensity={lightOn ? 0.86 : 0}
          />
        </mesh>
      </group>
    </group>
  );
}

function StairCore() {
  return (
    <group position={[1.6, 0, -0.2]}>
      {/* Stair base */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[2.1, 0.3, 1.2]} />
        <meshStandardMaterial color="#a58a70" roughness={0.72} metalness={0.02} />
      </mesh>

      {/* Steps */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`step-${i}`} position={[0, 0.28 + i * 0.09, -0.45 + i * 0.15]} castShadow>
          <boxGeometry args={[2.05, 0.08, 0.24]} />
          <meshStandardMaterial color="#b08b64" roughness={0.68} metalness={0.03} />
        </mesh>
      ))}

      {/* Railing */}
      <mesh position={[0.88, 0.82, -0.02]} castShadow>
        <boxGeometry args={[0.06, 1.05, 1.18]} />
        <meshStandardMaterial color="#d4d4d8" roughness={0.36} metalness={0.62} />
      </mesh>
    </group>
  );
}

function Scooter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.85, 0.12, 0.22]} />
        <meshStandardMaterial color="#991b1b" roughness={0.45} metalness={0.32} />
      </mesh>
      <mesh position={[0.34, 0.3, 0]} castShadow>
        <boxGeometry args={[0.1, 0.28, 0.08]} />
        <meshStandardMaterial color="#4b5563" roughness={0.5} metalness={0.44} />
      </mesh>
      {[-0.3, 0.3].map((x) => (
        <mesh key={`scooter-wheel-${x}`} position={[x, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.92} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

function ParkingZone({ position, lightOn, onToggle }: { position: [number, number, number]; lightOn: boolean; onToggle: () => void }) {
  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[9, 6.8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={1} metalness={0.02} />
      </mesh>

      {[-2.5, 0, 2.5].map((x) => (
        <mesh key={`park-line-${x}`} position={[x, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.16, 5.4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      ))}

      <group position={[0.2, 0.3, 0]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[2.4, 0.35, 4.2]} />
          <meshStandardMaterial color="#0f1724" roughness={0.22} metalness={0.82} />
        </mesh>
        {[-1.1, 1.1].flatMap((x) => [-1.45, 1.45].map((z) => ({ x, z }))).map((wheel) => (
          <mesh key={`wheel-${wheel.x}-${wheel.z}`} position={[wheel.x, -0.02, wheel.z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.45, 20]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.95} metalness={0.04} />
          </mesh>
        ))}
      </group>

      <Scooter position={[2.7, 0, 2.2]} />

      <group position={[-3.3, 0, -1.9]} onClick={onToggle}>
        <mesh position={[0, 1.25, 0]} castShadow>
          <boxGeometry args={[0.16, 2.5, 0.16]} />
          <meshStandardMaterial color="#5b6774" roughness={0.42} metalness={0.54} />
        </mesh>
        <mesh position={[0, 2.6, 0]} castShadow>
          <boxGeometry args={[0.45, 0.28, 0.45]} />
          <meshStandardMaterial
            color={lightOn ? '#fde68a' : '#9ca3af'}
            emissive={lightOn ? '#f59e0b' : '#000000'}
            emissiveIntensity={lightOn ? 0.68 : 0}
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
        <pointLight position={[0, 2.6, 0]} intensity={lightOn ? 19 : 0} distance={16} decay={1.9} color="#dbeafe" castShadow />
      </group>

      <Text position={[0, 0.05, 2.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.21} color="#f8fafc">
        PARKING AREA
      </Text>
    </group>
  );
}

type SpeechRecognitionType = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionType;

export default function LiveFloorExperience() {
  const controlsRef = React.useRef<any>(null);
  const [lightingPreset, setLightingPreset] = React.useState<LightingPreset>('daylight');
  const [lights, setLights] = React.useState<Record<RoomId, boolean>>({
    'living-room': true,
    kitchen: false,
    'master-bedroom': true,
    'guest-bedroom': false,
    bathroom: false,
    'parking-area': false,
  });
  const [voiceInput, setVoiceInput] = React.useState('');
  const [transcript, setTranscript] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);

  const lighting =
    lightingPreset === 'daylight'
      ? {
          ambient: 0.42,
          hemisphere: 0.38,
          hemisphereSky: '#fff9f2',
          hemisphereGround: '#cfd4da',
          directional: 0.95,
          directionalColor: '#ffffff',
          directionalPosition: [11, 12, 6] as [number, number, number],
          environment: 'apartment' as const,
          ground: '#d8d8d8',
        }
      : {
          ambient: 0.26,
          hemisphere: 0.24,
          hemisphereSky: '#ffd7b0',
          hemisphereGround: '#7f6f62',
          directional: 0.78,
          directionalColor: '#ffd2a3',
          directionalPosition: [8, 10, 4] as [number, number, number],
          environment: 'sunset' as const,
          ground: '#b8aea2',
        };

  const setAllLights = (value: boolean) => {
    setLights((prev) => {
      const next = { ...prev };
      (Object.keys(next) as RoomId[]).forEach((roomId) => {
        next[roomId] = value;
      });
      return next;
    });
  };

  const parseVoiceCommand = (rawCommand: string): string => {
    const command = rawCommand
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!command) return 'Please say a command.';

    const hasOn = /\b(on|enable|start)\b/.test(command);
    const hasOff = /\b(off|disable|stop)\b/.test(command);

    if ((command.includes('turn on all') || command.includes('all lights on') || (command.includes('all') && hasOn))) {
      setAllLights(true);
      return 'All lights turned on.';
    }

    if ((command.includes('turn off all') || command.includes('all lights off') || (command.includes('all') && hasOff))) {
      setAllLights(false);
      return 'All lights turned off.';
    }

    const targetRoom = roomAliases.find((room) => room.aliases.some((alias) => command.includes(alias)));

    if (!targetRoom) {
      return 'Room not recognized. Try: turn on kitchen light.';
    }

    if (hasOn) {
      setLights((prev) => ({ ...prev, [targetRoom.id]: true }));
      return `${roomLayout.find((room) => room.id === targetRoom.id)?.name || 'Room'} light turned on.`;
    }

    if (hasOff) {
      setLights((prev) => ({ ...prev, [targetRoom.id]: false }));
      return `${roomLayout.find((room) => room.id === targetRoom.id)?.name || 'Room'} light turned off.`;
    }

    setLights((prev) => ({ ...prev, [targetRoom.id]: !prev[targetRoom.id] }));
    return `${roomLayout.find((room) => room.id === targetRoom.id)?.name || 'Room'} light toggled.`;
  };

  const toggleRoom = (roomId: RoomId) => {
    setLights((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  const executeTypedCommand = () => {
    const result = parseVoiceCommand(voiceInput);
    setTranscript(result);
    setVoiceInput('');
  };

  const startVoiceCapture = () => {
    const maybeWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Recognition = maybeWindow.SpeechRecognition || maybeWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setTranscript('Voice not supported in this browser. Use command input.');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsListening(true);

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      const result = parseVoiceCommand(command);
      setTranscript(`Heard: ${command}. ${result}`);
    };

    recognition.onerror = () => {
      setTranscript('Voice command failed. Please try again.');
      setIsListening(false);
    };

    recognition.start();
    setTimeout(() => {
      recognition.stop();
      setIsListening(false);
    }, 5000);
  };

  return (
    <section id="live-floor" className="rounded-[34px] border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] gold-text">Live 3D Floor Experience</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">3D house model with room-wise light control + voice command</h2>
        </div>
        <div className="rounded-full border gold-border bg-[#faf8ef] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest gold-text">
          Voice Enabled
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-[28px] border gold-border bg-[#f8f8f8] p-4 sm:p-6">
          <div className="relative w-full aspect-[16/9] rounded-2xl border border-gray-300 bg-gradient-to-b from-white to-gray-100 overflow-hidden">
            <Canvas shadows dpr={[1, 1.8]}>
              <PerspectiveCamera makeDefault position={[15.5, 12.8, 14.2]} fov={29} />
              <ambientLight intensity={lighting.ambient} />
              <hemisphereLight intensity={lighting.hemisphere} color={lighting.hemisphereSky} groundColor={lighting.hemisphereGround} />
              <directionalLight
                castShadow
                intensity={lighting.directional}
                color={lighting.directionalColor}
                position={lighting.directionalPosition}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={0.5}
                shadow-camera-far={65}
                shadow-bias={-0.0002}
                shadow-normalBias={0.04}
                shadow-radius={3}
              />

              <React.Suspense fallback={null}>
                <Environment preset={lighting.environment} />

                <group position={[0, 0, 0]}>
                  <RoomZone
                    position={[-1.2, 0, 1.3]}
                    size={[7, 3, 6.8]}
                    title="Living"
                    tone="#64748b"
                    lightOn={lights['living-room']}
                    onToggle={() => toggleRoom('living-room')}
                    type="living"
                  />

                  <RoomZone
                    position={[4.8, 0, 2.8]}
                    size={[5, 3, 4.1]}
                    title="Kitchen"
                    tone="#64748b"
                    lightOn={lights.kitchen}
                    onToggle={() => toggleRoom('kitchen')}
                    type="kitchen"
                  />

                  <RoomZone
                    position={[-2, 0, -4.3]}
                    size={[6, 3, 5]}
                    title="Master"
                    tone="#64748b"
                    lightOn={lights['master-bedroom']}
                    onToggle={() => toggleRoom('master-bedroom')}
                    type="master"
                  />

                  <RoomZone
                    position={[5.5, 0, -3.4]}
                    size={[3.2, 3, 6.6]}
                    title="Guest"
                    tone="#64748b"
                    lightOn={lights['guest-bedroom']}
                    onToggle={() => toggleRoom('guest-bedroom')}
                    type="guest"
                  />

                  <RoomZone
                    position={[2.5, 0, -4.2]}
                    size={[3, 3, 5]}
                    title="Bath"
                    tone="#64748b"
                    lightOn={lights.bathroom}
                    onToggle={() => toggleRoom('bathroom')}
                    type="bath"
                  />

                  <ParkingZone position={[10.2, 0, 0]} lightOn={lights['parking-area']} onToggle={() => toggleRoom('parking-area')} />
                  <StairCore />
                </group>

                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.13, 0]}>
                  <circleGeometry args={[30, 56]} />
                  <meshStandardMaterial color={lighting.ground} roughness={0.98} metalness={0.02} />
                </mesh>

                <ContactShadows opacity={0.2} scale={32} blur={3.4} far={12} color="#000000" />

                <OrbitControls
                  ref={controlsRef}
                  makeDefault
                  enablePan
                  enableDamping
                  dampingFactor={0.07}
                  target={[2.2, 0.92, 0.4]}
                  maxPolarAngle={Math.PI / 2.22}
                  minPolarAngle={Math.PI / 4.7}
                  minDistance={10}
                  maxDistance={27}
                  maxAzimuthAngle={Math.PI / 2.8}
                  minAzimuthAngle={-Math.PI / 2.8}
                />
              </React.Suspense>
            </Canvas>
            <div className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-[10px] uppercase tracking-wider text-white">
              Tap room lights for smart control
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-[28px] border border-gray-200 bg-white p-5">
          <div className="mb-4 rounded-xl border gold-border bg-[#faf8ef] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] gold-text mb-2">Scene Preset</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLightingPreset('daylight')}
                className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${
                  lightingPreset === 'daylight' ? 'gold-bg border gold-border text-black' : 'border border-gray-300 bg-white text-black hover:bg-gray-100'
                }`}
              >
                Daylight Neutral
              </button>
              <button
                onClick={() => setLightingPreset('evening')}
                className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${
                  lightingPreset === 'evening' ? 'gold-bg border gold-border text-black' : 'border border-gray-300 bg-white text-black hover:bg-gray-100'
                }`}
              >
                Warm Evening
              </button>
            </div>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-[0.2em] gold-text mb-3">Voice Command</h3>
          <p className="text-sm text-gray-600 mb-3">Try: turn on kitchen light, turn off guest bedroom, turn on parking light, turn on all lights.</p>

          <div className="flex gap-2 mb-3">
            <button
              onClick={startVoiceCapture}
              className="flex-1 rounded-xl gold-bg border gold-border px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:brightness-95 inline-flex items-center justify-center gap-2"
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isListening ? 'Listening...' : 'Start Voice'}
            </button>
          </div>

          <div className="flex gap-2">
            <input
              value={voiceInput}
              onChange={(event) => setVoiceInput(event.target.value)}
              placeholder="Type command..."
              className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
            />
            <button
              onClick={executeTypedCommand}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-black hover:bg-gray-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500 min-h-5">{transcript}</p>

          <div className="mt-5 space-y-2 text-xs text-gray-700">
            {roomLayout.map((room) => (
              <div key={`status-${room.id}`} className="flex items-center justify-between rounded-xl border border-gray-200 bg-[#faf8ef] px-3 py-2">
                <div>
                  <span>{room.name}</span>
                  <p className="text-[10px] text-gray-500">{room.id === 'parking-area' ? 'Controls parking area light' : 'Room lighting control'}</p>
                </div>
                <button
                  onClick={() => toggleRoom(room.id)}
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    lights[room.id] ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {lights[room.id] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setAllLights(true)}
              className="rounded-xl gold-bg border gold-border px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-black hover:brightness-95"
            >
              All On
            </button>
            <button
              onClick={() => setAllLights(false)}
              className="rounded-xl border gold-border bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-black hover:bg-gray-100"
            >
              All Off
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

