'use client';
import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import City from '../City';
import { Boxes, Trees } from '../Architecture';
import type { Part, V3 } from '@/lib/architecture';
import type { SceneBlend } from './Tower';
export function Sunset({ dusk, white }: { dusk: boolean; white: MutableRefObject<SceneBlend> }) {
  const sky = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ zenith: { value: new THREE.Color(dusk ? '#8d9dbc' : '#8eafc4') }, horizon: { value: new THREE.Color(dusk ? '#e5b7bd' : '#e5dfc8') }, haze: { value: new THREE.Color(2.7, 2.7, 2.65) }, white: { value: 0 } }), [dusk]);
  useFrame(() => { uniforms.white.value = white.current.white; if (sky.current) sky.current.visible = white.current.white < .985; });
  return <mesh ref={sky} scale={1400} renderOrder={-10}>
    <sphereGeometry args={[1, 32, 16]}/><shaderMaterial side={THREE.BackSide} depthWrite={false} uniforms={uniforms}
      vertexShader={`varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
      fragmentShader={`varying vec3 vD;uniform vec3 zenith;uniform vec3 horizon;uniform vec3 haze;uniform float white;
      float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1.,0.)),f.x),mix(hsh(i+vec2(0.,1.)),hsh(i+vec2(1.,1.)),f.x),f.y);}
      void main(){vec3 d=normalize(vD);float h=max(0.,d.y);vec3 c=mix(horizon,zenith,smoothstep(0.,.6,h));vec2 q=d.xz/(h+.26)*2.8;float n=noise(q*1.8)+.45*noise(q*4.8);float cloud=smoothstep(.72,1.12,n)*smoothstep(.04,.23,h);c=mix(c,mix(horizon,vec3(.8,.68,.72),.3),cloud*.32);float sun=pow(max(0.,dot(d,normalize(vec3(-.6,.15,-1.)))),160.);c+=vec3(1.,.66,.32)*sun*.3;c=mix(c,haze,white);gl_FragColor=vec4(c,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`}/>
  </mesh>;
}
export function UrbanPark({ blend }: { blend: MutableRefObject<SceneBlend> }) {
  const root = useRef<THREE.Group>(null);
  const trees = useMemo<V3[]>(() => Array.from({ length: 46 }, (_, i) => { const a = i * 2.4; const r = 23 + i % 7 * 4; return [Math.cos(a) * r, 0, Math.sin(a) * r + 12]; }), []);
  const distant = useMemo(() => {
    const cores: Part[] = [], glass: Part[] = [], bands: Part[] = [];
    for (let i = 0; i < 68; i++) {
      const a = i * 2.399; const radius = 340 + i % 8 * 30; const x = Math.cos(a) * radius, z = Math.sin(a) * radius;
      const w = 10 + i % 7 * 2, d = 12 + i % 4 * 3, h = 20 + (i * 17 % 80);
      cores.push({ p: [x, h / 2, z], s: [w, h, d] });
      for (let y = 3; y < h; y += 3.4) {
        bands.push({ p: [x, y, z], s: [w + .2, .15, d + .2] });
        for (const side of [-1, 1]) {
          for (let col = 0; col < Math.floor(w / 2); col++) glass.push({ p: [x - w / 2 + 1 + col * 2, y + 1.25, z + side * (d / 2 + .03)], s: [1.05, 1.9, .05] });
          for (let col = 0; col < Math.floor(d / 2); col++) glass.push({ p: [x + side * (w / 2 + .03), y + 1.25, z - d / 2 + 1 + col * 2], s: [.05, 1.9, 1.05] });
        }
      }
    }
    return { cores, glass, bands };
  }, []);
  useFrame(() => { if (root.current) root.current.visible = blend.current.white < .98; });
  return <group ref={root}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.3, 0]} receiveShadow><planeGeometry args={[1500, 1500]}/><meshStandardMaterial color="#7a8868" roughness={1}/></mesh>
    <mesh position={[0, -.18, 31]} receiveShadow><boxGeometry args={[400, .12, 9]}/><meshStandardMaterial color="#626966" roughness={.93}/></mesh>
    <mesh position={[0, -.12, 24.5]} receiveShadow><boxGeometry args={[140, .18, 3.6]}/><meshStandardMaterial color="#b4b2a0" roughness={.86}/></mesh>
    <mesh position={[0, -.1, 10]} receiveShadow><boxGeometry args={[8, .13, 28]}/><meshStandardMaterial color="#aaa58e" roughness={.9}/></mesh>
    <mesh position={[0, -.07, 17]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><ringGeometry args={[16, 18.5, 80]}/><meshStandardMaterial color="#b8b39d" roughness={.9}/></mesh>
    <Trees positions={trees} scale={1.4}/>
    <group position={[0, 0, -55]}><City dusk/></group>
    <group position={[0, 0, 200]} rotation={[0, Math.PI, 0]}><City dusk/></group>
    <group position={[190, 0, 25]} rotation={[0, Math.PI / 2, 0]}><City dusk/></group>
    <Boxes parts={distant.cores} color="#979e9d" roughness={.8}/><Boxes parts={distant.glass} color="#778b95" metalness={.5} roughness={.25}/><Boxes parts={distant.bands} color="#828b8a"/>
    <Boxes color="#a2a498" parts={[-26, -20, 20, 26].map(x => ({ p: [x, .25, 22], s: [5, .5, .4] }))}/>
    <Boxes color="#c3c1ab" parts={Array.from({ length: 25 }, (_, i) => ({ p: [-58 + i * 5, -.09, 31], s: [2.5, .02, .1] }))}/>
  </group>;
}
