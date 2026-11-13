'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Part, V3 } from '@/lib/architecture';

export function Boxes({ parts, color, metalness = 0, roughness = .8, transparent = false, opacity = 1, emissive = '#000000', emissiveIntensity = 0, texture, material, normalMap, roughnessMap, normalStrength = .15, clearcoat = 0 }: { parts: Part[]; color: string; metalness?: number; roughness?: number; transparent?: boolean; opacity?: number; emissive?: string; emissiveIntensity?: number; texture?: THREE.Texture; material?: THREE.Material; normalMap?: THREE.Texture; roughnessMap?: THREE.Texture; normalStrength?: number; clearcoat?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    parts.forEach((part, index) => {
      dummy.position.set(...part.p); dummy.scale.set(...part.s); dummy.rotation.set(...(part.r || [0, 0, 0]));
      dummy.updateMatrix(); ref.current!.setMatrixAt(index, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [parts]);
  if (!parts.length) return null;
  return <instancedMesh material={material} ref={ref} args={[undefined, undefined, parts.length]} castShadow={!transparent} receiveShadow>
    <boxGeometry args={[1, 1, 1]}/>
    {!material && <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} transparent={transparent} opacity={opacity} emissive={emissive} emissiveIntensity={emissiveIntensity} map={texture} normalMap={normalMap} normalScale={[normalStrength, normalStrength]} roughnessMap={roughnessMap} clearcoat={clearcoat} clearcoatRoughness={.12} depthWrite={!transparent}/>}
  </instancedMesh>;
}
function random(seed: number) { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
export function Trees({ positions, scale = 1 }: { positions: V3[]; scale?: number }) {
  const foliage = useRef<THREE.InstancedMesh>(null);
  const trunks = useMemo(() => positions.map(p => ({ p: [p[0], p[1] + 2 * scale, p[2]] as V3, s: [.22 * scale, 4 * scale, .22 * scale] as V3 })), [positions, scale]);
  useLayoutEffect(() => {
    if (!foliage.current) return;
    const dummy = new THREE.Object3D(); const color = new THREE.Color();
    positions.forEach((p, t) => {
      for (let i = 0; i < 420; i++) {
        const seed = t * 67 + i;
        const a = random(seed) * Math.PI * 2; const radius = Math.sqrt(random(seed + 21)) * 1.8 * scale;
        dummy.position.set(p[0] + Math.cos(a) * radius, p[1] + 4.6 * scale + (random(seed + 44) - .5) * 3.5 * scale * Math.sqrt(Math.max(0, 1 - (radius / (2 * scale)) ** 2)), p[2] + Math.sin(a) * radius);
        dummy.scale.set((.14 + random(seed + 4) * .24) * scale, (.2 + random(seed + 7) * .28) * scale, (.14 + random(seed + 5) * .25) * scale);
        dummy.rotation.set(random(seed) * 3, random(seed + 2) * 3, random(seed + 3) * 3); dummy.updateMatrix();
        foliage.current!.setMatrixAt(t * 420 + i, dummy.matrix);
        color.setHSL(.22 + random(seed + 8) * .055, .16 + random(seed + 9) * .2, .08 + random(seed + 10) * .085);
        foliage.current!.setColorAt(t * 420 + i, color);
      }
    });
    foliage.current.instanceMatrix.needsUpdate = true;
    if (foliage.current.instanceColor) foliage.current.instanceColor.needsUpdate = true;
    foliage.current.computeBoundingSphere();
  }, [positions, scale]);
  return <group><Boxes parts={trunks} color="#524d40"/><instancedMesh ref={foliage} args={[undefined, undefined, positions.length * 420]} castShadow receiveShadow><icosahedronGeometry args={[1, 0]}/><meshStandardMaterial color="#6f8558" roughness={1}/></instancedMesh></group>;
}
