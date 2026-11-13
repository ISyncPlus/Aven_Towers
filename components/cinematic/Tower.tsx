'use client';
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useCubeCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Boxes } from '../Architecture';
import { towerParts } from '@/lib/cinematic/tower';
import { levelBase } from '@/lib/cinematic/plan';
export type SceneBlend = { exterior: number; white: number; feature: number };
export default function Tower({ floor, dusk, blend, onFloor }: { floor: number; dusk: boolean; blend: MutableRefObject<SceneBlend>; onFloor: (floor: number) => void }) {
  const parts = useMemo(towerParts, []);
  const root = useRef<THREE.Group>(null);
  const baked = useRef(false);
  const { camera: reflectionCamera, fbo, update } = useCubeCamera({ resolution: 256, near: .5, far: 1200 });
  useEffect(() => { baked.current = false; }, [dusk]);
  const [hover, setHover] = useState<number | null>(null);
  const highlight = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const featured = useRef<THREE.Group>(null);
  const createMaterials = (lit: boolean): Record<string, THREE.MeshStandardMaterial> => ({
    stone: new THREE.MeshStandardMaterial({ color: '#a2a299', roughness: .85 }),
    metal: new THREE.MeshStandardMaterial({ color: '#394648', metalness: .72, roughness: .26 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#a3b7bc', metalness: .9, roughness: .09, clearcoat: 1, envMapIntensity: 1.15, envMap: fbo.texture }),
    warm: new THREE.MeshPhysicalMaterial({ color: '#766656', emissive: '#edbb82', emissiveIntensity: lit ? .12 : .025, metalness: .5, roughness: .22, clearcoat: .6 }),
    bronze: new THREE.MeshStandardMaterial({ color: '#886850', metalness: .65, roughness: .35, emissive: '#aa6a36', emissiveIntensity: lit ? .12 : 0 }),
    dark: new THREE.MeshStandardMaterial({ color: '#333b3a', roughness: .85 }),
  });
  const materials = useMemo(() => ({ shell: createMaterials(dusk), featured: createMaterials(dusk) }), [dusk, fbo]);
  useEffect(() => () => Object.values(materials).forEach(batch => Object.values(batch).forEach(material => material.dispose())), [materials]);
  useFrame((_, delta) => {
    const values = blend.current;
    if (!baked.current && root.current && values.exterior > .99 && values.white < .01) {
      root.current.visible = false; reflectionCamera.position.set(0, 45, 0); update(); root.current.visible = true; baked.current = true;
    }
    if (shell.current) shell.current.visible = values.exterior > .015;
    if (featured.current) featured.current.visible = values.exterior * values.feature > .015;
    for (const [key, batch] of Object.entries(materials)) for (const material of Object.values(batch)) {
      const opacity = values.exterior * (key === 'featured' ? values.feature : 1);
      material.transparent = opacity < .999; material.opacity = opacity; material.depthWrite = opacity > .98;
    }
    if (highlight.current) { highlight.current.visible = values.exterior > .9; highlight.current.position.y = THREE.MathUtils.damp(highlight.current.position.y, levelBase(hover || floor) + .12, 8, delta); }
  });
  return <group ref={root}>
    <group ref={shell}>{Object.entries(parts.shell).map(([name, batch]) => <Boxes key={name} parts={batch} material={materials.shell[name]} color="#999"/>)}</group>
    <group ref={featured}>{Object.entries(parts.featured).map(([name, batch]) => <Boxes key={name} parts={batch} material={materials.featured[name]} color="#999"/>)}</group>
    {Array.from({ length: 24 }, (_, i) => i + 2).map(level => <mesh key={level} position={[0, levelBase(level) + 1.7, 7.8]} onPointerOver={event => { event.stopPropagation(); setHover(level); }} onPointerOut={() => setHover(null)} onClick={event => { event.stopPropagation(); onFloor(level); }}>
      <boxGeometry args={[19.5, 3.25, .04]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </mesh>)}
    <group ref={highlight} position={[0, levelBase(floor) + .12, 7.84]}>
      <mesh><boxGeometry args={[19.5, .075, .05]}/><meshBasicMaterial color="#f5c58a" transparent opacity={.9} toneMapped={false}/></mesh>
      <mesh position={[0, 1.55, 0]}><planeGeometry args={[19.45, 3.1]}/><meshBasicMaterial color="#f3c78f" transparent opacity={.1} depthWrite={false}/></mesh>
    </group>
  </group>;
}
