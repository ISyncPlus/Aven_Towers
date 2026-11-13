'use client';
import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Vec3 } from '@/lib/cinematic/plan';
import { Block, Pipe } from '../Furniture';
import type { Palette } from './Palette';
export function Soft({ p, s, material, r = [0, 0, 0] }: { p: Vec3; s: Vec3; material: THREE.Material; r?: Vec3 }) {
  const geometry = useMemo(() => {
    const g = new RoundedBoxGeometry(1, 1, 1, 4, .16);
    const a = g.getAttribute('position');
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i), y = a.getY(i), z = a.getZ(i);
      const ripple = Math.sin(x * 23 + z * 8) * Math.sin(z * 17 - y * 5) * .006;
      a.setXYZ(i, x + ripple, y + ripple * .7, z + ripple * .6);
    }
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh position={p} scale={s} rotation={r} geometry={geometry} material={material} castShadow receiveShadow/>;
}
export function LoungeChair({ p, r = 0, f }: { p: Vec3; r?: number; f: Palette }) {
  const { scene } = useGLTF('/models/lounge-chair.glb');
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = object.receiveShadow = true; const name = (object.material as THREE.Material).name.toLowerCase(); if (name.includes('fabric')) object.material = f.boucle; } });
    const bounds = new THREE.Box3().setFromObject(copy); const size = bounds.getSize(new THREE.Vector3()); const center = bounds.getCenter(new THREE.Vector3());
    const scale = 1 / size.y; copy.scale.setScalar(scale); copy.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    return copy;
  }, [scene, f.boucle]);
  return <group position={p} rotation={[0, r, 0]}><primitive object={model} dispose={null}/></group>;
}
export function CoutureSofa({ p, r = 0, f }: { p: Vec3; r?: number; f: Palette }) {
  return <group position={p} rotation={[0, r, 0]}>
    <Block p={[0, .17, .08]} s={[3.7, .22, 1.17]} material={f.walnut} radius={.08}/>
    <Soft p={[0, .4, .06]} s={[3.9, .48, 1.37]} material={f.boucle}/>
    {[-1.16, 0, 1.16].map((x, i) => <group key={x}><Soft p={[x, .67, -.05]} s={[1.12, .23, 1.14]} material={f.boucle}/><Soft p={[x, 1.02, .52]} s={[1.17, .8, .34]} material={f.boucle} r={[.1, 0, 0]}/><Soft p={[x + .13, 1.0, .28]} s={[.55, .53, .2]} material={i === 1 ? f.olive : f.cream} r={[.08, .05, i % 2 ? -.12 : .1]}/></group>)}
    {[-1, 1].map(side => <Soft key={side} p={[side * 1.91, .77, 0]} s={[.34, .84, 1.45]} material={f.boucle}/>)}
    <Soft p={[-1.13, .55, -.92]} s={[1.32, .48, 1.2]} material={f.boucle}/>
  </group>;
}
export function DrapedBed({ p, width = 2.15, f }: { p: Vec3; width?: number; f: Palette }) {
  const blanket = useMemo(() => {
    const g = new THREE.PlaneGeometry(width + .28, 2.6, 36, 42); const a = g.getAttribute('position');
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i), z = a.getY(i);
      const edge = Math.max(0, Math.abs(x) - width * .43);
      const end = Math.max(0, z - .92);
      const fold = Math.sin(x * 19 + z * 4) * .017 + Math.sin(z * 23 + x * 6) * .012;
      a.setXYZ(i, x, -.04 - edge * .8 - end * .5 + fold, -z);
    }
    g.computeVertexNormals(); return g;
  }, [width]);
  useEffect(() => () => blanket.dispose(), [blanket]);
  return <group position={p}>
    <Block p={[0, .22, 0]} s={[width + .2, .33, 2.45]} material={f.walnut} radius={.08}/>
    <Soft p={[0, .5, 0]} s={[width, .33, 2.36]} material={f.cream}/>
    <mesh position={[0, .79, .05]} geometry={blanket} material={f.cream} castShadow receiveShadow/>
    <Soft p={[0, 1.11, -1.3]} s={[width + .4, 1.4, .18]} material={f.boucle}/>
    {[-1, 1].map(side => <group key={side}><Soft p={[side * width * .23, .82, -.86]} s={[width * .45, .26, .62]} material={f.cream} r={[-.08, 0, side * .04]}/><Soft p={[side * width * .23, .98, -.98]} s={[width * .41, .46, .25]} material={f.linen} r={[-.05, 0, side * -.05]}/><Block p={[side * (width / 2 + .5), .42, -.97]} s={[.65, .72, .65]} material={f.sand} radius={.045}/><mesh position={[side * (width / 2 + .5), .9, -.97]} material={f.brass}><cylinderGeometry args={[.035, .06, .35, 12]}/></mesh><mesh position={[side * (width / 2 + .5), 1.16, -.97]} material={f.linen} castShadow><cylinderGeometry args={[.22, .31, .3, 32]}/></mesh></group>)}
    <Soft p={[0, .775, .6]} s={[width + .12, .055, .62]} material={f.linen}/>
  </group>;
}
export function Vessel({ p, scale = 1, f, branches = false }: { p: Vec3; scale?: number; f: Palette; branches?: boolean }) {
  const points = useMemo(() => [.0, .03, .13, .35, .56, .7, .75].map((y, i) => new THREE.Vector2([.14, .2, .27, .28, .17, .115, .115][i], y)), []);
  return <group position={p} scale={scale}><mesh material={f.ceramic} castShadow><latheGeometry args={[points, 32]}/></mesh>{branches && [0, 1, 2, 3].map(i => <group key={i} rotation={[0, i * 1.8, .12]}><Pipe points={[[0, .5, 0], [.03, 1.1, .06], [.2, 1.8 + i * .1, .12]]} radius={.008} material={f.walnut}/>{[0, 1, 2].map(n => <mesh key={n} position={[.09 + n * .04, 1.0 + n * .23, .08]} scale={[.1, .2, .02]} rotation={[.1, .4, -.7]}><sphereGeometry args={[1, 10, 6]}/><meshStandardMaterial color="#657856" roughness={.85}/></mesh>)}</group>)}</group>;
}
export function Artwork({ kind = 'orange' }: { kind?: 'orange' | 'ink' }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024; const c = canvas.getContext('2d')!;
    c.fillStyle = kind === 'orange' ? '#5b2821' : '#e5dcc8'; c.fillRect(0, 0, 768, 1024);
    if (kind === 'orange') {
      const glow = c.createLinearGradient(0, 0, 0, 1024); glow.addColorStop(0, '#b45727'); glow.addColorStop(.4, '#dc601d'); glow.addColorStop(.75, '#b33424'); glow.addColorStop(1, '#552225'); c.fillStyle = glow; c.fillRect(70, 62, 628, 890);
      c.fillStyle = '#e87b25'; c.fillRect(115, 115, 540, 475); c.fillStyle = '#af3425'; c.fillRect(110, 675, 545, 205);
      for (let i = 0; i < 180; i++) { c.fillStyle = `rgba(71,27,20,${.01 + (i % 6) * .003})`; c.fillRect(75, 65 + i * 4.9, 620, 2); }
    } else { c.strokeStyle = '#34372f'; c.lineWidth = 65; c.lineCap = 'round'; c.beginPath(); c.moveTo(170, 240); c.bezierCurveTo(650, 90, 110, 700, 550, 770); c.stroke(); c.strokeStyle = '#9f7952'; c.lineWidth = 35; c.beginPath(); c.moveTo(160, 840); c.bezierCurveTo(130, 440, 640, 470, 620, 250); c.stroke(); }
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, [kind]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh><planeGeometry args={[1.38, 2.02]}/><meshStandardMaterial map={texture} roughness={.8}/></mesh>;
}
