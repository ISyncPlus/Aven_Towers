'use client';
import { useEffect, useMemo, useRef, useState, type Dispatch, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { createJourney } from '@/lib/cinematic/journey';
import { RESIDENCE_Y } from '@/lib/cinematic/plan';
import type { Action, Navigation } from '@/lib/cinematic/navigation';
import type { SceneBlend } from './Tower';
type Rig = { x: number; y: number; z: number; tx: number; ty: number; tz: number; fov: number };
export default function CameraDirector({ navigation: nav, dispatch, reduced, ready, blend }: { navigation: Navigation; dispatch: Dispatch<Action>; reduced: boolean; ready: boolean; blend: MutableRefObject<SceneBlend> }) {
  const { camera, size, pointer } = useThree();
  const route = useMemo(createJourney, []);
  const cursor = useRef({ t: 0 });
  const rig = useRef<Rig>({ x: 112, y: 67, z: 178, tx: -6, ty: 45, tz: 0, fov: 37 });
  const [orbitReady, setOrbitReady] = useState(false);
  const mode = useRef<'rig' | 'path' | 'idle'>('rig');
  const moving = useRef(false);
  const lastStage = useRef(nav.stage);
  const lastActive = useRef(-1);
  const look = useMemo(() => new THREE.Vector3(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const drift = useRef(new THREE.Vector2());
  const mobile = size.width < 700;
  const compact = size.width < 1100;
  const overview = mobile ? { x: 40, y: RESIDENCE_Y + 43, z: 44, tx: 0, ty: RESIDENCE_Y + .3, tz: 0, fov: 43 } : { x: 18, y: RESIDENCE_Y + 20, z: 24, tx: 0, ty: RESIDENCE_Y + .3, tz: 0, fov: 43 };
  useEffect(() => {
    setOrbitReady(false);
    const previous = lastStage.current; lastStage.current = nav.stage;
    const tl = gsap.timeline();
    const speed = reduced ? 0 : 1;
    const capture = () => {
      camera.getWorldDirection(look); look.multiplyScalar(12).add(camera.position);
      Object.assign(rig.current, { x: camera.position.x, y: camera.position.y, z: camera.position.z, tx: look.x, ty: look.y, tz: look.z, fov: (camera as THREE.PerspectiveCamera).fov });
      mode.current = 'rig'; moving.current = true;
    };
    const settleRig = () => { const r = rig.current; camera.position.set(r.x, r.y, r.z); camera.lookAt(r.tx, r.ty, r.tz); (camera as THREE.PerspectiveCamera).fov = r.fov; camera.updateProjectionMatrix(); };
    const settlePath = () => { const p = route.position.getPoint(cursor.current.t), target = route.target.getPoint(cursor.current.t); camera.position.set(p.x, p.y + RESIDENCE_Y, p.z); camera.lookAt(target.x, target.y + RESIDENCE_Y - (mobile ? .4 : 0), target.z); (camera as THREE.PerspectiveCamera).fov = nav.target === 8 ? 43 : mobile ? 72 : 64; camera.updateProjectionMatrix(); };
    if (nav.stage === 'hero') {
      capture();
      const hero = mobile ? { x: 129, y: 72, z: 220, tx: -20, ty: 48, tz: 0, fov: 42 } : compact ? { x: 130, y: 70, z: 214, tx: -6, ty: 47, tz: 0, fov: 38 } : { x: 112, y: 67, z: 178, tx: -6, ty: 45, tz: 0, fov: 37 };
      if (previous !== 'hero') tl.to(rig.current, { x: 26, y: RESIDENCE_Y + 12, z: 40, tx: 0, ty: RESIDENCE_Y + 2, tz: 0, fov: 43, duration: 1.4 * speed, ease: 'power2.inOut' });
      tl.to(blend.current, { exterior: 1, white: 0, feature: 1, duration: 1.3 * speed }, previous === 'hero' ? 0 : .8 * speed);
      tl.to(rig.current, { ...hero, duration: (previous === 'hero' ? 1.4 : 2.8) * speed, ease: 'power2.inOut', onComplete: () => { moving.current = false; } }, previous === 'hero' ? 0 : 1.1 * speed);
    } else if (nav.stage === 'entering') {
      if (!ready) return;
      capture();
      tl.to(rig.current, { x: 13, y: RESIDENCE_Y + 2.6, z: 21, tx: 4.5, ty: RESIDENCE_Y + 1.5, tz: 5, fov: 43, duration: 2.5 * speed, ease: 'power2.inOut' });
      tl.to(blend.current, { feature: 0, duration: .65 * speed }, 1.9 * speed);
      tl.to(rig.current, { x: 5.4, y: RESIDENCE_Y + 1.8, z: 6.4, tx: 2, ty: RESIDENCE_Y + 1.4, tz: 2.2, fov: 52, duration: 1.5 * speed, ease: 'power1.inOut' }, 2.4 * speed);
      tl.to(blend.current, { exterior: 0, white: 1, duration: 1.5 * speed }, 3.2 * speed);
      tl.to(rig.current, { ...overview, duration: 2.7 * speed, ease: 'power2.inOut', onComplete: () => { settleRig(); mode.current = 'idle'; moving.current = false; dispatch({ type: 'ENTERED' }); } }, 3.7 * speed);
    } else if (nav.stage === 'cutaway') {
      capture();
      tl.to(blend.current, { exterior: 0, feature: 0, white: 1, duration: .7 * speed }, 0);
      tl.to(rig.current, { ...overview, duration: (previous === 'entering' ? 0 : 1.6) * speed, ease: 'power2.inOut', onComplete: () => { settleRig(); mode.current = 'idle'; moving.current = false; setOrbitReady(true); } }, 0);
    } else if (nav.stage === 'tour') {
      const end = route.stops[nav.target];
      const startPath = () => { mode.current = 'path'; moving.current = true; };
      if (previous === 'cutaway' || previous === 'entering' || previous === 'hero') {
        capture(); cursor.current.t = 0;
        const p = route.position.getPoint(0), target = route.target.getPoint(0);
        tl.to(rig.current, { x: p.x, y: p.y + RESIDENCE_Y, z: p.z, tx: target.x, ty: target.y + RESIDENCE_Y - (mobile ? .4 : 0), tz: target.z, fov: mobile ? 72 : 64, duration: 2.8 * speed, ease: 'power2.inOut' });
      } else if (previous === 'overview') {
        capture(); cursor.current.t = 1;
        tl.to(rig.current, { ...overview, duration: 1 * speed, ease: 'power2.inOut' });
      }
      tl.to(blend.current, { exterior: 0, feature: 0, white: 0, duration: 1.8 * speed }, 0);
      tl.call(startPath);
      const duration = Math.abs(end - cursor.current.t) * route.position.getLength() / 2.7;
      tl.to(cursor.current, { t: end, duration: Math.max(.75, Math.min(19, duration)) * speed, ease: 'power1.inOut', onComplete: () => { settlePath(); moving.current = false; mode.current = 'idle'; dispatch({ type: 'ACTIVE', index: nav.target }); dispatch({ type: 'ARRIVED' }); } });
    } else if (nav.stage === 'overview') {
      capture(); cursor.current.t = 1;
      tl.to(blend.current, { exterior: 0, white: 1, feature: 0, duration: 1 * speed }, 0);
      tl.to(rig.current, { ...overview, duration: 1 * speed, ease: 'power2.inOut', onComplete: () => { settleRig(); mode.current = 'idle'; moving.current = false; setOrbitReady(true); } }, 0);
    }
    return () => { tl.kill(); };
  // Only a navigation request or viewport class changes the director; active-room metadata never restarts it.
  }, [nav.stage, nav.request, ready, reduced, mobile, compact]);
  useFrame((_, delta) => {
    const perspective = camera as THREE.PerspectiveCamera;
    if (mode.current === 'path') {
      route.position.getPoint(cursor.current.t, position); route.target.getPoint(cursor.current.t, look);
      position.y += RESIDENCE_Y; look.y += RESIDENCE_Y - (mobile ? .4 : 0);
      camera.position.copy(position); camera.lookAt(look);
      perspective.fov = nav.target === 8 ? THREE.MathUtils.lerp(mobile ? 72 : 64, 43, THREE.MathUtils.smoothstep(cursor.current.t, route.stops[7], 1)) : mobile ? 72 : 64;
      let active = 0;
      for (let i = 0; i < route.stops.length; i++) if (cursor.current.t >= route.stops[i] - .004) active = i;
      if (active !== lastActive.current) { lastActive.current = active; dispatch({ type: 'ACTIVE', index: active }); }
    } else if (mode.current === 'rig') {
      const r = rig.current;
      if (nav.stage === 'hero' && !reduced && !mobile && !moving.current) drift.current.lerp(pointer, 1 - Math.exp(-delta * 2)); else drift.current.set(0, 0);
      camera.position.set(r.x + drift.current.x * .7, r.y + drift.current.y * .25, r.z); camera.lookAt(r.tx, r.ty, r.tz); perspective.fov = r.fov;
    }
    perspective.updateProjectionMatrix();
  });
  return (nav.stage === 'cutaway' || nav.stage === 'overview') ? <OrbitControls makeDefault target={[0, RESIDENCE_Y + .3, 0]} enablePan={false} enableDamping={!reduced} dampingFactor={.07} minDistance={mobile ? 42 : 22} maxDistance={mobile ? 80 : 55} minPolarAngle={.25} maxPolarAngle={1.18} minAzimuthAngle={-.9} maxAzimuthAngle={1.25} enabled={orbitReady}/> : null;
}
