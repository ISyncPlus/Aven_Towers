'use client';
import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { V3 } from '@/lib/architecture';
import type { Finishes } from './Materials';
export function Block({ p, s, color = '#e9e2d5', material, radius = .025, r }: { p: V3; s: V3; color?: string; material?: THREE.Material; radius?: number; r?: V3 }) {
  return <RoundedBox position={p} rotation={r} args={s} radius={Math.min(radius, ...s.map(n => n / 3))} smoothness={2} castShadow receiveShadow material={material}>{!material && <meshStandardMaterial color={color} roughness={.78}/>}</RoundedBox>;
}
export function Pipe({ points, radius = .018, material }: { points: V3[]; radius?: number; material: THREE.Material }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point))), [points]);
  return <mesh material={material} castShadow><tubeGeometry args={[curve, 20, radius, 6, false]}/></mesh>;
}
export function Chair({ position, rotation = 0, finishes: f, outdoor = false }: { position: V3; rotation?: number; finishes: Finishes; outdoor?: boolean }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Block p={[0, .51, 0]} s={[.65, .14, .65]} material={outdoor ? f.walnut : f.linen} radius={.08}/>
    <mesh position={[0, .79, -.07]} rotation={[0, -Math.PI / 2, 0]} material={outdoor ? f.walnut : f.linen} castShadow><cylinderGeometry args={[.36, .35, .45, 20, 1, true, 0, Math.PI]}/></mesh>
    {[-1, 1].flatMap(x => [-1, 1].map(z => <mesh key={`${x}${z}`} position={[x * .23, .24, z * .23]} rotation={[z * .08, 0, -x * .08]} material={f.walnut} castShadow><cylinderGeometry args={[.035, .025, .48, 6]}/></mesh>))}
  </group>;
}
export function Plant({ position, scale = 1, finishes: f }: { position: V3; scale?: number; finishes: Finishes }) {
  const leaves = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ a: i * 2.4, h: .48 + (i % 4) * .15 })), []);
  return <group position={position} scale={scale}>
    <mesh position={[0, .2, 0]} material={f.stone} castShadow><cylinderGeometry args={[.25, .18, .4, 20]}/></mesh>
    <mesh position={[0, .405, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.22, 20]}/><meshStandardMaterial color="#403c2e"/></mesh>
    {leaves.map(({ a, h }, i) => <group key={i} rotation={[0, a, 0]}><mesh position={[0, .42 + h / 2, .12]} rotation={[.35, 0, 0]} material={f.walnut}><cylinderGeometry args={[.008, .012, h, 4]}/></mesh><mesh position={[0, h + .38, .27]} rotation={[.55 + i % 3 * .2, 0, .1]} scale={[.13, .35, .027]} castShadow><sphereGeometry args={[1, 10, 6]}/><meshStandardMaterial color={i % 3 ? '#425c3b' : '#64774b'} roughness={.8}/></mesh></group>)}
  </group>;
}
