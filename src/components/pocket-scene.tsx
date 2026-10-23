"use client";

import { Sparkles, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { DoubleSide, type Group, type Object3D } from "three";
import type { FaceStyle } from "@/lib/personality";

useGLTF.preload("/models/coin.glb");
useGLTF.preload("/models/candy-bar.glb");
useGLTF.preload("/models/cupcake.glb");
useGLTF.preload("/models/soda-bottle.glb");

function Prop({
  url,
  position,
  scale = 0.35,
  rotation = [0, 0, 0],
}: {
  url: string;
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={clone as Object3D} position={position} scale={scale} rotation={rotation} />;
}

function HeartEye({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={0.16}>
      <mesh position={[-0.38, 0.25, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#ff3d7a" />
      </mesh>
      <mesh position={[0.38, 0.25, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#ff3d7a" />
      </mesh>
      <mesh position={[0, -0.28, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.72, 0.95, 16]} />
        <meshStandardMaterial color="#ff3d7a" />
      </mesh>
    </group>
  );
}

function Eyes({ face }: { face: FaceStyle }) {
  if (face.eye === "heart") {
    return (
      <group position={[0, 0.28, 0.62]}>
        <HeartEye position={[-0.28, 0, 0]} />
        <HeartEye position={[0.28, 0, 0]} />
      </group>
    );
  }
  if (face.eye === "laser") {
    return (
      <group position={[0, 0.22, 0.55]}>
        {[-0.22, 0.22].map((x) => (
          <mesh key={x} position={[x, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.09, 0.85, 12]} />
            <meshStandardMaterial color="#ffe56a" emissive="#ffb703" emissiveIntensity={1.4} />
          </mesh>
        ))}
      </group>
    );
  }
  if (face.eye === "sad") {
    return (
      <group position={[0, 0.28, 0.66]}>
        {[-0.24, 0.24].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh scale={[1, 0.35, 0.6]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#2a2140" />
            </mesh>
            <mesh position={[x > 0 ? 0.08 : -0.08, -0.16, 0.02]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial color="#d7ecff" />
            </mesh>
          </group>
        ))}
      </group>
    );
  }
  return (
    <group position={[0, 0.26, 0.68]}>
      {[-0.24, 0.24].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.13, 18, 18]} />
            <meshStandardMaterial color="#fffaf6" />
          </mesh>
          <mesh position={[0, 0, 0.07]}>
            <sphereGeometry args={[0.07, 14, 14]} />
            <meshStandardMaterial color="#241820" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Mouth({ face }: { face: FaceStyle }) {
  if (face.mouth === "bubble") {
    return (
      <mesh position={[0.05, -0.05, 0.78]}>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshStandardMaterial color="#ff9ec4" transparent opacity={0.85} roughness={0.15} />
      </mesh>
    );
  }
  if (face.mouth === "grit") {
    return (
      <mesh position={[0, -0.08, 0.72]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.28, 0.08, 0.06]} />
        <meshStandardMaterial color="#ffe56a" />
      </mesh>
    );
  }
  if (face.mouth === "sad") {
    return (
      <mesh position={[0, -0.12, 0.7]} rotation={[0.4, 0, Math.PI]}>
        <torusGeometry args={[0.1, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#3a2458" />
      </mesh>
    );
  }
  return (
    <mesh position={[0, -0.08, 0.7]} rotation={[0.5, 0, 0]}>
      <torusGeometry args={[0.12, 0.028, 8, 16, Math.PI]} />
      <meshStandardMaterial color="#5a3048" />
    </mesh>
  );
}

function Chog({ face }: { face: FaceStyle }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group) return;
    const t = clock.getElapsedTime();
    group.position.y = Math.sin(t * 2.2) * 0.06;
    group.rotation.y = Math.sin(t * 0.7) * 0.18;
  });
  return (
    <group ref={ref} position={[-0.55, -0.15, 0]} scale={face.flip ? [-1, 1, 1] : [1, 1, 1]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <sphereGeometry args={[0.72, 32, 32]} />
        <meshStandardMaterial color={face.skin} roughness={0.45} />
      </mesh>
      <mesh position={[0, -0.05, 0.42]}>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial color={face.belly} roughness={0.55} />
      </mesh>
      <mesh position={[-0.38, 0.72, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={face.skin} />
      </mesh>
      <mesh position={[0.38, 0.72, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={face.skin} />
      </mesh>
      {face.dressed ? (
        <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[0.62, 0.12, 12, 24]} />
          <meshStandardMaterial color={face.eye === "laser" ? "#241c33" : "#ffd0b0"} />
        </mesh>
      ) : null}
      {face.crown && face.eye === "laser" ? (
        <mesh position={[0, 1.05, 0]}>
          <coneGeometry args={[0.34, 0.62, 18]} />
          <meshStandardMaterial color="#2a2140" />
        </mesh>
      ) : null}
      {face.crown && face.eye !== "laser" ? (
        <group position={[0, 0.95, 0]}>
          {Array.from({ length: 5 }, (_, index) => {
            const angle = (index / 5) * Math.PI * 2;
            return (
              <mesh key={index} position={[Math.sin(angle) * 0.22, 0.12, Math.cos(angle) * 0.22]}>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshStandardMaterial color="#f2c14e" metalness={0.6} roughness={0.25} />
              </mesh>
            );
          })}
          <mesh>
            <torusGeometry args={[0.24, 0.05, 10, 20]} />
            <meshStandardMaterial color="#f2c14e" metalness={0.55} roughness={0.3} />
          </mesh>
        </group>
      ) : null}
      <Eyes face={face} />
      <Mouth face={face} />
    </group>
  );
}

function Jar({ fill }: { fill: number }) {
  const level = Math.max(0.04, Math.min(1, fill / 100));
  return (
    <group position={[0.95, -0.45, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.42, 0.36, 1.15, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#fffaf6"
          transparent
          opacity={0.16}
          roughness={0.08}
          metalness={0}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.08, 32]} />
        <meshStandardMaterial color="#f6d7c4" />
      </mesh>
      <mesh position={[0, 0.08 + (level * 0.9) / 2, 0]}>
        <cylinderGeometry args={[0.3, 0.28, Math.max(0.05, level * 0.9), 32]} />
        <meshStandardMaterial color="#f2b43a" roughness={0.32} metalness={0.45} emissive="#e39b16" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.045, 10, 24]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
}

function FlyingCoin({ index }: { index: number }) {
  const ref = useRef<Group>(null);
  const { scene } = useGLTF("/models/coin.glb");
  const clone = useMemo(() => scene.clone(true), [scene]);
  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group) return;
    const t = Math.min(1, Math.max(0, clock.getElapsedTime() * 0.85 - index * 0.08));
    const arc = Math.sin(t * Math.PI) * 0.8;
    group.position.set(-0.4 + t * 1.3, -0.1 + arc, 0.2);
    group.rotation.z = t * 8;
    group.scale.setScalar(0.85);
  });
  return (
    <group ref={ref}>
      <primitive object={clone as Object3D} />
    </group>
  );
}

function CelebrationCoins() {
  return (
    <group>
      {Array.from({ length: 6 }, (_, index) => (
        <FlyingCoin key={index} index={index} />
      ))}
    </group>
  );
}

function Treats() {
  return (
    <group>
      <Prop url="/models/candy-bar.glb" position={[-1.05, -0.72, 0.25]} scale={1.15} rotation={[0, 0.5, 0.4]} />
      <Prop url="/models/cupcake.glb" position={[-1.25, -0.78, 0.55]} scale={1.35} rotation={[0, -0.3, 0]} />
      <Prop url="/models/soda-bottle.glb" position={[1.55, -0.35, -0.15]} scale={1.55} rotation={[0, -0.4, 0]} />
      <Prop url="/models/coin.glb" position={[0.95, 0.15, 0.42]} scale={1.1} rotation={[0.6, 0.2, 0.4]} />
    </group>
  );
}

function Stage({
  face,
  fill,
  celebrate,
  showPet,
}: {
  face: FaceStyle;
  fill: number;
  celebrate: number;
  showPet: boolean;
}) {
  return (
    <>
      <color attach="background" args={[face.stage]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} />
      <pointLight position={[-2, 1.2, 2]} intensity={0.7} color={face.blush} />
      {showPet ? <Chog face={face} /> : null}
      <Jar fill={fill} />
      <Suspense fallback={null}>
        <Treats />
        {celebrate > 0 ? <CelebrationCoins key={celebrate} /> : null}
      </Suspense>
      <Sparkles
        count={celebrate > 0 ? 48 : 14}
        scale={[3.2, 2.2, 1.4]}
        size={celebrate > 0 ? 6 : 3}
        speed={0.45}
        color={face.blush}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
        <circleGeometry args={[2.4, 40]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.08} />
      </mesh>
    </>
  );
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function PocketScene({
  face,
  fill,
  celebrate,
  showPet,
  label,
}: {
  face: FaceStyle;
  fill: number;
  celebrate: number;
  showPet: boolean;
  label: string;
}) {
  return (
    <SceneBoundary
      fallback={<div className="grid h-full place-items-center text-sm text-[#6d5360]">The 3D pocket is resting.</div>}
    >
      <Canvas
        aria-label={label}
        camera={{ position: [0, 0.35, 4.4], fov: 34 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Stage face={face} fill={fill} celebrate={celebrate} showPet={showPet} />
      </Canvas>
    </SceneBoundary>
  );
}
