"use client";

import { Environment, Float, PresentationControls, RoundedBox, Text, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import * as THREE from "three";
import type { PublicCard } from "@/types/card";

function CardMesh({ card }: { card: PublicCard }) {
  const texture = useTexture(card.cardImageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  const [flipped, setFlipped] = useState(false);
  return (
    <Float speed={1.6} rotationIntensity={0.08} floatIntensity={0.28}>
      <group rotation-y={flipped ? Math.PI : 0} onClick={() => setFlipped((value) => !value)}>
        <RoundedBox args={[4.2, 2.15, 0.12]} radius={0.12} smoothness={8} position={[0, 0, 0.02]}>
          <meshStandardMaterial map={texture} roughness={0.24} metalness={0.12} />
        </RoundedBox>
        <RoundedBox args={[4.2, 2.15, 0.11]} radius={0.12} smoothness={8} position={[0, 0, -0.08]} rotation-y={Math.PI}>
          <meshStandardMaterial color={card.accent} roughness={0.36} metalness={0.35} />
        </RoundedBox>
        <group position={[0, 0.35, -0.16]} rotation-y={Math.PI}>
          <Text fontSize={0.22} color="#07111f" anchorX="center" maxWidth={3.4}>{card.brand}</Text>
          <Text position={[0, -0.34, 0]} fontSize={0.36} color="#020617" anchorX="center" fontWeight={800} maxWidth={3.5}>{card.name}</Text>
          <Text position={[0, -0.72, 0]} fontSize={0.16} color="#0f172a" anchorX="center" maxWidth={3.5}>{card.title || card.styleName}</Text>
          <Text position={[0, -1.0, 0]} fontSize={0.13} color="#1e293b" anchorX="center" maxWidth={3.5}>{[card.handle, card.website].filter(Boolean).join(" · ")}</Text>
        </group>
      </group>
    </Float>
  );
}

export function Card3D({ card }: { card: PublicCard }) {
  return (
    <div className="h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,.22),rgba(15,23,42,.9)_55%)]" data-testid="card-3d">
      <Canvas camera={{ position: [0, 0, 5.4], fov: 42 }} dpr={[1, 1.6]}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 5, 4]} intensity={2.2} />
        <Suspense fallback={null}>
          <PresentationControls global snap rotation={[0, 0, 0]} polar={[-0.25, 0.25]} azimuth={[-0.7, 0.7]}>
            <CardMesh card={card} />
          </PresentationControls>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
