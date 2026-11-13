'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type Dispatch } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Action, Navigation } from '@/lib/cinematic/navigation';
import { RESIDENCE_Y } from '@/lib/cinematic/plan';
import Tower, { type SceneBlend } from './Tower';
import { Sunset, UrbanPark } from './Environment';
import Residence from './Residence';
import CameraDirector from './CameraDirector';
import RenderPipeline from './RenderPipeline';
import { interiorTextures } from './Palette';
type Props = { navigation: Navigation; dispatch: Dispatch<Action>; reduced: boolean; dusk: boolean; onReady: () => void; onFailure: () => void; capture?: boolean };
function World({ navigation, dispatch, reduced, dusk, onReady, onFailure }: Props) {
  const blend = useRef<SceneBlend>({ exterior: 1, white: 0, feature: 1 });
  const root = useRef<THREE.Group>(null);
  const [loadInterior, setLoadInterior] = useState(false);
  const [ready, setReady] = useState(false);
  const { gl, scene, camera } = useThree();
  const lastStudio = useRef(false);
  const interiorSun = useMemo(() => { const target = new THREE.Object3D(); target.position.set(0, RESIDENCE_Y, 0); return target; }, []);
  const sunTarget = useMemo(() => { const target = new THREE.Object3D(); target.position.set(0, 45, 0); return target; }, []);
  const fogColor = useMemo(() => new THREE.Color('#c6bcbc'), []);
  const paper = useMemo(() => new THREE.Color('#f1eee7'), []);
  const onInteriorReady = useCallback(() => { setReady(true); onReady(); gl.shadowMap.needsUpdate = true; }, [onReady, gl]);
  useEffect(() => {
    const timer = window.setTimeout(() => { useGLTF.preload('/models/lounge-chair.glb'); useTexture.preload(interiorTextures); setLoadInterior(true); }, 1100);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    scene.fog = new THREE.Fog(fogColor, 130, 850);
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = .95;
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    const restored = () => { gl.shadowMap.needsUpdate = true; onReady(); };
    gl.domElement.addEventListener('webglcontextlost', lost); gl.domElement.addEventListener('webglcontextrestored', restored);
    return () => { gl.domElement.removeEventListener('webglcontextlost', lost); gl.domElement.removeEventListener('webglcontextrestored', restored); };
  }, [gl, scene, fogColor, onFailure, onReady]);
  useFrame(() => {
    const white = blend.current.white;
    scene.background = white > .985 ? paper : null;
    Object.assign(gl.domElement.dataset, { studio: white.toFixed(2), camera: camera.position.toArray().map(v => v.toFixed(1)).join(',') });
    if (scene.fog instanceof THREE.Fog) { scene.fog.color.copy(fogColor).lerp(paper, white); scene.fog.far = THREE.MathUtils.lerp(850, 170, white); }
    if (root.current) root.current.visible = navigation.stage !== 'hero' || blend.current.exterior < .98;
    const studio = white > .9;
    if (studio !== lastStudio.current) { lastStudio.current = studio; gl.shadowMap.needsUpdate = true; }
  });
  return <>
    <Sunset dusk={dusk} white={blend}/>
    <CameraDirector navigation={navigation} dispatch={dispatch} reduced={reduced} ready={ready} blend={blend}/>
    <ambientLight intensity={.15}/><hemisphereLight args={['#e3dfdc', '#9a937e', .45]}/>
    <primitive object={sunTarget}/>
    <directionalLight position={[-80, 135, 95]} target={sunTarget} color={dusk ? '#ffdfbd' : '#fff0d8'} intensity={3.2} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-75} shadow-camera-right={75} shadow-camera-top={75} shadow-camera-bottom={-75} shadow-camera-near={1} shadow-camera-far={400} shadow-normalBias={.025} shadow-bias={-.00005}/>
    <directionalLight position={[90, 75, -85]} color="#ccd8ea" intensity={.6}/>
    <Suspense fallback={null}><Environment files="/materials/v2/sunset.hdr" environmentIntensity={.6}/></Suspense>
    <Suspense fallback={null}><Tower floor={navigation.floor} dusk={dusk} blend={blend} onFloor={floor => dispatch({ type: 'FLOOR', floor })}/><UrbanPark blend={blend}/></Suspense>
    <group ref={root} visible={false}>
      <primitive object={interiorSun}/>
      <directionalLight position={[-15, RESIDENCE_Y + 19, 18]} target={interiorSun} color="#ffe6c9" intensity={1.6} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-camera-near={1} shadow-camera-far={65} shadow-normalBias={.012} shadow-bias={-.0001}/>

      {loadInterior && <Suspense fallback={null}><Residence visible hotspots={navigation.stage === 'cutaway' || navigation.stage === 'overview'} activeRoom={navigation.active} onRoom={index => dispatch({ type: 'ROOM', index })} onReady={onInteriorReady}/></Suspense>}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, RESIDENCE_Y - .31, 0]} receiveShadow><planeGeometry args={[23, 19]}/><shadowMaterial transparent opacity={.12} depthWrite={false}/></mesh>
    </group>
    <RenderPipeline interior={navigation.stage !== 'hero' && navigation.stage !== 'entering'} revision={navigation.stage + String(ready)}/>
  </>;
}
export default function CinematicScene(props: Props) {
  return <Canvas shadows dpr={[1, 1.5]} camera={{ position: [112, 67, 178], fov: 37, near: .08, far: 2200 }} onCreated={({ camera }) => camera.lookAt(-6, 45, 0)} gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }} fallback={<div className="scene-unavailable">Explore the residence through the architectural gallery.</div>}><World {...props}/></Canvas>;
}
