'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { APARTMENT, RESIDENCE_Y, walls, rooms, type RoomId, type Vec3 } from '@/lib/cinematic/plan';
import { Boxes } from '../Architecture';
import { Block, Chair, Pipe, Plant } from '../Furniture';
import { usePalette, type Palette } from './Palette';
import { Artwork, CoutureSofa, DrapedBed, LoungeChair, Soft, Vessel } from './Objects';

export default function Residence({ visible, hotspots, activeRoom, onRoom, onReady }: { visible: boolean; hotspots: boolean; activeRoom: number; onRoom: (index: number) => void; onReady: () => void }) {
  const f = usePalette();
  const roof = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const floor = useMemo(() => { const g = new THREE.PlaneGeometry(18, 14); const uv = g.getAttribute('uv'); for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 7, uv.getY(i) * 6); return g; }, []);
  const frames = useMemo(() => {
    const parts: { p: Vec3; s: Vec3 }[] = [];
    for (let x = -9; x <= 9; x += 1.5) parts.push({ p: [x, 1.6, 7], s: [.04, 3.2, .08] });
    for (let z = -7; z <= 7; z += 1.4) parts.push({ p: [9, 1.6, z], s: [.08, 3.2, .04] });
    for (let x = -9; x <= -3.5; x += 1.35) parts.push({ p: [x, 1.6, -7], s: [.04, 3.2, .08] });
    parts.push({ p: [0, .09, 7], s: [18, .1, .1] }, { p: [0, 3.1, 7], s: [18, .12, .1] }, { p: [9, 3.1, 0], s: [.1, .12, 14] }, { p: [9, .09, 0], s: [.1, .1, 14] });
    return parts;
  }, []);
  const skirting = useMemo(() => walls.map(wall => ({ p: [wall.x, .11, wall.z] as Vec3, s: [wall.w + .06, .2, wall.d + .06] as Vec3 })), []);
  useEffect(() => { onReady(); return () => floor.dispose(); }, [floor, onReady]);
  useFrame(() => {
    if (!roof.current) return;
    const opacity = THREE.MathUtils.clamp((RESIDENCE_Y + 3.05 - camera.position.y) / .7, 0, 1);
    f.ceiling.opacity = opacity; roof.current.visible = visible && opacity > .01; f.ceiling.depthWrite = opacity > .95;
  });
  return <group visible={visible} position={[0, RESIDENCE_Y, 0]}>
    <Block p={[0, -.15, 0]} s={[18.3, .3, 14.3]} material={f.stone} radius={.035}/>
    <mesh geometry={floor} material={f.floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, .017, 0]} receiveShadow/>
    {walls.map((wall, index) => <Block key={index} p={[wall.x, APARTMENT.height / 2, wall.z]} s={[wall.w, APARTMENT.height, wall.d]} material={f.wall} radius={.012}/>)}
    <Block p={[-9, 1.6, 0]} s={[.18, 3.2, 14]} material={f.wall}/>
    <Boxes parts={skirting} color="#eee9df" material={f.cream}/>
    <Boxes parts={frames} color="#333d3b" material={f.metal}/>
    <Block p={[0, 1.6, 7.025]} s={[18, 3.1, .02]} material={f.glass}/>
    <Block p={[9.025, 1.6, 0]} s={[.02, 3.1, 14]} material={f.glass}/>
    <Block p={[-6.25, 1.6, -7.02]} s={[5.5, 3.1, .02]} material={f.glass}/>
    <mesh ref={roof} rotation={[Math.PI / 2, 0, 0]} position={[0, 3.22, 0]} material={f.ceiling}><planeGeometry args={[18.1, 14.1]}/></mesh>
    <Doors f={f}/>
    <group position={[-8.88, 1.75, .05]} rotation={[0, Math.PI / 2, 0]} scale={[.8, .7, 1]}><Artwork kind="ink"/></group>
    <Block p={[-8.55, .4, .05]} s={[.6, .55, 1.6]} material={f.walnut} radius={.06}/>
    <Vessel p={[-8.55, .7, .45]} scale={.45} f={f}/>
    <Boxes material={f.sand} color="#d8d1bf" parts={Array.from({ length: 4 }, (_, i) => ({ p: [-2.9 + i * .55, 1.5, -1.15], s: [.53, 2.9, .035] }))}/>

    <Living f={f}/><Dining f={f}/><Kitchen f={f}/><PrivateRooms f={f}/><GuestBathroom f={f}/><Bathroom f={f} reflected={activeRoom === 7}/>
    {[[3.8, 3.13, 2.1], [3.8, 3.13, 6.45], [-4.6, 3.13, .1]].map((p, i) => <Block key={i} p={p as Vec3} s={[i === 2 ? 7.8 : 6.8, .025, .035]} material={f.light}/>)}
    {hotspots && rooms.filter(room => room.id !== 'panorama').map(room => <Html key={room.id} position={room.hotspot} center zIndexRange={[12, 8]}><button className="room-hotspot" onClick={() => onRoom(rooms.findIndex(item => item.id === room.id))} aria-label={`Explore ${room.name}`}><span/>{room.name}</button></Html>)}
  </group>;
}
function Doors({ f }: { f: Palette }) {
  return <>
    {[{ x: -5.8, z: -1.25 }, { x: -4.6, z: 1.4 }, { x: -1.4, z: 1.4 }, { x: -1.85, z: -1.25 }].map(({ x, z }) => <group key={`${x}${z}`}>
      <Boxes material={f.walnut} color="#806d53" parts={[{ p: [x - .61, 1.5, z], s: [.055, 3, .2] }, { p: [x + .61, 1.5, z], s: [.055, 3, .2] }, { p: [x, 3.015, z], s: [1.3, .07, .2] }]}/>
    </group>)}
    <group position={[-6.4, 0, -1.25]} rotation={[0, 1.48, 0]}><Block p={[.56, 1.48, 0]} s={[1.12, 2.92, .055]} material={f.sand}/><Block p={[1, 1.1, .05]} s={[.12, .025, .04]} material={f.brass}/></group>
    <group position={[-4, 0, 1.4]} rotation={[0, 1.48, 0]}><Block p={[-.56, 1.48, 0]} s={[1.12, 2.92, .055]} material={f.sand}/><Block p={[-1, 1.1, -.05]} s={[.12, .025, .04]} material={f.brass}/></group>
    <group position={[-.8, 0, 1.4]} rotation={[0, 1.48, 0]}><Block p={[-.56, 1.48, 0]} s={[1.12, 2.92, .055]} material={f.sand}/></group>
  </>;
}
function Living({ f }: { f: Palette }) {
  const slats = useMemo(() => Array.from({ length: 48 }, (_, i) => ({ p: [-.07, 1.6, 2.05 + i * .1] as Vec3, s: [.055, 3.2, .065] as Vec3 })), []);
  return <>
    <Block p={[3.8, .045, 4.3]} s={[6.7, .045, 4.3]} material={f.rug} radius={.04}/>
    <CoutureSofa p={[5.9, .025, 3.4]} r={Math.PI / 2} f={f}/>
    <LoungeChair p={[2.7, .025, 2.2]} r={.15} f={f}/><LoungeChair p={[7.7, .025, 2.6]} r={-.8} f={f}/>
    <Block p={[2.8, .39, 4.3]} s={[1.8, .13, .95]} material={f.travertine} radius={.2}/>
    {[-.55, .55].map(x => <mesh key={x} position={[2.8 + x, .19, 4.3]} material={f.travertine} castShadow><cylinderGeometry args={[.2, .24, .36, 24]}/></mesh>)}
    <mesh position={[3.8, .49, 3.4]} material={f.walnut} castShadow><cylinderGeometry args={[.48, .48, .08, 40]}/></mesh>
    <mesh position={[3.8, .27, 3.4]} material={f.walnut}><cylinderGeometry args={[.13, .2, .42, 24]}/></mesh>
    {[0, 1, 2].map(i => <Block key={i} p={[2.55, .5 + i * .04, 4.24]} s={[.48, .035, .34]} color={['#79816c', '#dbcfb7', '#a8987c'][i]} r={[0, i * .07, 0]}/>)}
    <Vessel p={[3.15, .48, 4.35]} scale={.3} f={f}/>
    <Boxes parts={slats} color="#9c8463" material={f.oak}/>
    <Block p={[.03, 1.8, 4.5]} s={[.1, 2.18, 1.55]} material={f.metal}/>
    <group position={[.095, 1.8, 4.5]} rotation={[0, Math.PI / 2, 0]}><Artwork/></group>
    <Block p={[.43, .55, 4.5]} s={[.65, .9, 2.4]} material={f.walnut}/>
    <Block p={[.43, 1.025, 4.5]} s={[.73, .06, 2.5]} material={f.marble}/>
    <Vessel p={[.45, 1.07, 3.7]} scale={.6} f={f}/><Vessel p={[.45, 1.07, 5.1]} scale={.35} f={f}/>
    <Plant position={[8.2, .025, 3.45]} scale={1.6} finishes={f}/><Plant position={[1.4, .025, 6.35]} scale={1.25} finishes={f}/>
    <pointLight position={[.5, 2.3, 4.5]} color="#eda86b" intensity={2.3} distance={4}/>
    <Curtain p={[6.9, 1.6, 6.8]} f={f}/>
  </>;
}
function Dining({ f }: { f: Palette }) {
  return <>
    <Block p={[5.4, .79, -.2]} s={[2.8, .13, 1.16]} material={f.oak} radius={.12}/>
    <Boxes color="#8f795b" material={f.walnut} parts={[-1, 1].flatMap(x => [-1, 1].map(z => ({ p: [5.4 + x * 1.08, .39, -.2 + z * .35] as Vec3, s: [.09, .75, .09] as Vec3 })))}/>
    {[4.45, 5.4, 6.35].map(x => <group key={x}><Chair position={[x, .025, .85]} rotation={Math.PI} finishes={f}/><Chair position={[x, .025, -1.25]} finishes={f}/></group>)}
    <Vessel p={[5.4, .86, -.2]} scale={.65} f={f} branches/>
    <Vessel p={[6.25, .86, -.15]} scale={.28} f={f}/>
    <Pipe points={[[5.4, 3.2, -.2], [5.4, 2.5, -.2]]} radius={.01} material={f.metal}/>
    <mesh position={[5.4, 2.45, -.2]} material={f.ceramic} castShadow><sphereGeometry args={[.27, 32, 16]}/></mesh>
    <Plant position={[8.15, .025, -.1]} scale={1.3} finishes={f}/>
  </>;
}
function Kitchen({ f }: { f: Palette }) {
  return <>
    <Block p={[3.1, 1.38, -6.87]} s={[5.1, .7, .06]} material={f.marble}/>
    {[1, 2, 3, 4, 5].map((x, i) => <group key={x}>
      <Block p={[x, .48, -6.38]} s={[.98, .9, 1.06]} material={f.sand}/>
      <Block p={[x, .5, -5.835]} s={[.94, .8, .03]} material={i === 3 ? f.blackGlass : f.sand}/>
      <Block p={[x, .83, -5.8]} s={[.48, .02, .035]} material={f.brass}/>
      <Block p={[x, 2.22, -6.65]} s={[.98, 1.03, .52]} material={f.walnut}/>
      <Block p={[x + .3, 2.18, -6.365]} s={[.018, .2, .035]} material={f.brass}/>
    </group>)}
    <Block p={[3, .99, -6.38]} s={[5.12, .1, 1.14]} material={f.marble}/>
    <Block p={[4, 1.05, -6.35]} s={[.95, .025, .75]} material={f.blackGlass}/>
    {[-.23, .23].flatMap(x => [-.2, .2].map(z => <mesh key={`${x}${z}`} position={[4 + x, 1.069, -6.35 + z]} rotation={[-Math.PI / 2, 0, 0]} material={f.metal}><torusGeometry args={[.12, .012, 6, 28]}/></mesh>))}
    <Block p={[6.2, 1.48, -6.4]} s={[1.05, 2.9, 1.08]} material={f.sand}/>
    <Block p={[6.2, 1.55, -5.83]} s={[.95, .68, .045]} material={f.blackGlass}/>
    <Block p={[6.2, 1.8, -5.79]} s={[.67, .03, .045]} material={f.brass}/>
    <Block p={[4, .48, -3]} s={[3.9, .91, .95]} material={f.sand}/>
    <Block p={[4, .99, -3]} s={[4.1, .11, 1.08]} material={f.marble}/>
    <Block p={[3.3, 1.055, -3]} s={[.78, .025, .58]} material={f.brass}/>
    <Block p={[3.3, 1.068, -3]} s={[.67, .02, .48]} material={f.blackGlass}/>
    <Pipe points={[[3.3, 1.04, -3.38], [3.3, 1.49, -3.38], [3.3, 1.61, -3.1], [3.3, 1.4, -3.01]]} radius={.02} material={f.metal}/>
    <Chair position={[4.3, .025, -2.04]} rotation={Math.PI} finishes={f}/><Chair position={[5.3, .025, -2.04]} rotation={Math.PI} finishes={f}/>
    <Block p={[3.7, 2.92, -3]} s={[4.7, .055, .055]} material={f.metal}/>
    {[2.5, 3.7, 4.9].map(x => <group key={x}><mesh position={[x, 2.84, -3]} material={f.metal}><cylinderGeometry args={[.055, .055, .2, 16]}/></mesh><mesh position={[x, 2.73, -3]} rotation={[-Math.PI / 2, 0, 0]} material={f.light}><circleGeometry args={[.042, 16]}/></mesh></group>)}
    <Block p={[3, 1.68, -6.36]} s={[4.85, .025, .045]} material={f.light}/>
    <Vessel p={[1.1, 1.05, -6.35]} scale={.4} f={f} branches/>
    <Block p={[5.1, 1.28, -6.4]} s={[.35, .45, .35]} material={f.blackGlass}/>
    <pointLight position={[3, 1.75, -6.1]} color="#eed2a8" intensity={1.8} distance={5}/>
  </>;
}
function PrivateRooms({ f }: { f: Palette }) {
  return <>
    <Block p={[-6.5, .045, 3.7]} s={[4.4, .045, 4.5]} material={f.rug}/>
    <DrapedBed p={[-6.5, .025, 3.25]} f={f}/>
    <Block p={[-6.5, 1.95, 1.51]} s={[2.2, 1.13, .05]} material={f.walnut}/>
    <group position={[-6.5, 1.96, 1.55]} scale={[1.5, .48, 1]}><Artwork kind="ink"/></group>
    <Curtain p={[-7.5, 1.6, 6.8]} f={f}/>
    <Plant position={[-4.2, .025, 6.2]} scale={1.1} finishes={f}/>
    <Block p={[-6.8, .045, -4.3]} s={[3.8, .04, 3.4]} material={f.rug}/>
    <DrapedBed p={[-7.1, .025, -3.95]} width={1.65} f={f}/>
    <Block p={[-4.8, .79, -6.35]} s={[2.15, .08, .7]} material={f.oak}/>
    <Boxes color="#8c785a" material={f.walnut} parts={[-5.65, -3.95].map(x => ({ p: [x, .4, -6.35], s: [.07, .76, .6] }))}/>
    <Chair position={[-4.8, .025, -5.5]} finishes={f}/>
    <Vessel p={[-4.1, .84, -6.35]} scale={.27} f={f} branches/>
    <Block p={[-5, .86, -6.35]} s={[.45, .035, .32]} material={f.linen}/>
    {[1.3, 1.85, 2.4].map((y, i) => <group key={y}><Block p={[-8.7, y, -3.4]} s={[.55, .06, 2]} material={f.oak}/>{Array.from({ length: 7 }, (_, n) => <Block key={n} p={[-8.7, y + .18, -4.1 + n * .18]} s={[.3, .3 + (n % 3) * .04, .12]} color={['#ddd0b3', '#697361', '#af9875'][n % 3]}/>)}</group>)}
    <Plant position={[-4.15, .025, -2.9]} scale={.8} finishes={f}/>
    {[[-3.95, -.5, -2.1], [-3.95, -.5, 3.8]].map(([x, , z], i) => <group key={i}><Block p={[x, 1.45, z]} s={[.6, 2.85, 1.65]} material={f.sand}/>{[-.4, .4].map(offset => <Block key={offset} p={[x - .32, 1.45, z + offset]} s={[.025, 2.8, .78]} material={f.walnut}/>)}</group>)}
    <pointLight position={[-6.5, 1.3, 2.05]} color="#f0c99d" intensity={1.3} distance={4}/>
  </>;
}
function GuestBathroom({ f }: { f: Palette }) {
  return <>
    <Block p={[-1.86, .055, -4.2]} s={[3.1, .06, 5.4]} material={f.travertine}/>
    <Block p={[-2.95, .62, -3.1]} s={[.75, .82, 1.5]} material={f.walnut}/>
    <Block p={[-2.95, 1.06, -3.1]} s={[.84, .08, 1.6]} material={f.marble}/>
    <mesh position={[-2.9, 1.15, -3.1]} material={f.ceramic}><cylinderGeometry args={[.26, .2, .15, 32]}/></mesh>
    <Block p={[-3.39, 1.95, -3.1]} s={[.04, 1.25, 1.5]} material={f.light}/>
    <Block p={[-3.36, 1.95, -3.1]} s={[.045, 1.15, 1.4]} material={f.blackGlass}/>
    <Pipe points={[[-3.27, 1.08, -3.1], [-3.27, 1.49, -3.1], [-2.96, 1.49, -3.1]]} radius={.018} material={f.brass}/>
    <Block p={[-1.8, .1, -6.1]} s={[2.85, .13, 1.5]} material={f.marble}/>
    <Block p={[-1.8, 1.55, -5.35]} s={[2.85, 2.9, .025]} material={f.glass}/>
    <Pipe points={[[-.4, .5, -6.3], [-.4, 2.65, -6.3], [-.9, 2.65, -6.3]]} radius={.02} material={f.brass}/>
    <mesh position={[-.96, 2.63, -6.3]} material={f.brass}><cylinderGeometry args={[.16, .16, .03, 24]}/></mesh>
    <mesh position={[-.85, .4, -2.4]} scale={[.27, .37, .4]} material={f.ceramic}><sphereGeometry args={[1, 24, 16]}/></mesh>
    <Block p={[-.85, .7, -2.72]} s={[.5, .5, .15]} material={f.ceramic} radius={.07}/>
    <Soft p={[-2.92, 1.16, -3.65]} s={[.4, .1, .3]} material={f.cream}/>
  </>;
}
function Bathroom({ f, reflected }: { f: Palette; reflected: boolean }) {
  return <>
    <Block p={[-1.86, .045, 4.23]} s={[3.12, .055, 5.4]} material={f.travertine}/>
    <Block p={[-3.44, 1.6, 4.25]} s={[.035, 3.12, 5.4]} material={f.travertine}/>
    <Block p={[-3.11, .61, 4.7]} s={[.7, .8, 2.05]} material={f.walnut}/>
    <Block p={[-3.08, 1.045, 4.7]} s={[.81, .1, 2.15]} material={f.marble}/>
    <mesh position={[-3.05, 1.14, 4.7]} scale={[.8, 1, 1]} material={f.ceramic} castShadow><cylinderGeometry args={[.3, .2, .16, 32, 1, true]}/></mesh>
    <mesh position={[-3.05, 1.105, 4.7]} rotation={[-Math.PI / 2, 0, 0]} material={f.metal}><circleGeometry args={[.12, 24]}/></mesh>
    <Pipe points={[[-3.38, 1.06, 4.7], [-3.38, 1.48, 4.7], [-3.06, 1.48, 4.7]]} radius={.019} material={f.metal}/>
    <Block p={[-3.4, 1.96, 4.7]} s={[.045, 1.2, 2.08]} material={f.light}/>
    <mesh position={[-3.36, 1.96, 4.7]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[1.98, 1.1]}/>{reflected ? <MeshReflectorMaterial resolution={256} mirror={.85} mixStrength={.4} color="#c9cfca" metalness={.8} roughness={.07}/> : <meshStandardMaterial color="#b2bcb5" metalness={1} roughness={.1}/>}</mesh>
    <Vessel p={[-3.08, 1.1, 5.47]} scale={.3} f={f} branches/>
    <Soft p={[-3.03, 1.13, 3.92]} s={[.4, .12, .3]} material={f.cream}/>
    <Block p={[-1.79, .1, 6.1]} s={[2.9, .13, 1.5]} material={f.marble}/>
    <Block p={[-1.79, 1.55, 5.36]} s={[2.9, 2.9, .025]} material={f.glass}/>
    <Boxes color="#a28b64" material={f.brass} parts={[{ p: [-.38, 1.55, 6.1], s: [.03, 2.9, .03] }, { p: [-1.79, 2.99, 5.36], s: [2.9, .03, .03] }]}/>
    <Pipe points={[[-.38, .4, 6.3], [-.38, 2.65, 6.3], [-.85, 2.65, 6.3]]} radius={.02} material={f.metal}/>
    <mesh position={[-.94, 2.63, 6.3]} material={f.metal}><cylinderGeometry args={[.17, .17, .03, 32]}/></mesh>
    <mesh position={[-.8, .39, 2.35]} scale={[.27, .37, .4]} material={f.ceramic}><sphereGeometry args={[1, 24, 16]}/></mesh>
    <Block p={[-.8, .7, 2.04]} s={[.5, .5, .15]} material={f.ceramic} radius={.07}/>
    <pointLight position={[-3.1, 2.1, 4.7]} color="#f1d9af" intensity={1.5} distance={4}/>
  </>;
}
function Curtain({ p, rotation = 0, f }: { p: Vec3; rotation?: number; f: Palette }) {
  const geometry = useMemo(() => { const g = new THREE.PlaneGeometry(1.45, 3.12, 40, 4); const a = g.getAttribute('position'); for (let i = 0; i < a.count; i++) a.setZ(i, Math.sin(a.getX(i) * 31) * .065); g.computeVertexNormals(); return g; }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <group position={p} rotation={[0, rotation, 0]}><mesh geometry={geometry} material={f.linen} castShadow/><mesh geometry={geometry} rotation={[0, Math.PI, 0]} material={f.linen}/></group>;
}
