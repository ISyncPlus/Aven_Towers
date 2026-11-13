'use client';
import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useFinishes } from '../Materials';
export const interiorTextures = ['/materials/v2/floor-color.jpg', '/materials/v2/floor-normal.jpg', '/materials/v2/floor-rough.jpg', '/materials/v2/veneer-color.jpg', '/materials/v2/veneer-normal.jpg', '/materials/v2/veneer-rough.jpg'];
function veinedStone() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#eeeae0'; context.fillRect(0, 0, 1024, 1024);
  let seed = 1818; const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let vein = 0; vein < 28; vein++) {
    const start = random() * 1700 - 400, phase = random() * 8, breadth = random() * 30 + 5;
    for (const halo of [true, false]) {
      context.beginPath(); context.strokeStyle = halo ? '#aaa28c18' : '#74736848'; context.lineWidth = halo ? 7 : random() * 1.5 + .25;
      for (let y = -20; y < 1050; y += 4) {
        const x = start - y * .52 + Math.sin(y * .008 + phase) * breadth + Math.sin(y * .043 + phase) * 4 + Math.sin(y * .16) * 1.7;
        if (y === -20) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.stroke();
    }
  }
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 8;
  return map;
}
export function usePalette() {
  const base = useFinishes();
  const source = useTexture(interiorTextures);
  const extra = useMemo(() => {
    const maps = source.map((texture, index) => { const map = texture.clone(); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 8; if (index === 0 || index === 3) map.colorSpace = THREE.SRGBColorSpace; map.needsUpdate = true; return map; });
    const [floorMap, floorNormal, floorRough, veneerMap, veneerNormal, veneerRough] = maps;
    const map = veinedStone(); maps.push(map);
    for (const texture of [floorMap, veneerMap]) texture.colorSpace = THREE.SRGBColorSpace;
    for (const texture of [floorMap, floorNormal, floorRough]) texture.repeat.set(1, 1);
    for (const texture of [veneerMap, veneerNormal, veneerRough]) texture.repeat.set(.8, 1);
    base.oak.map = veneerMap; base.oak.normalMap = veneerNormal; base.oak.roughnessMap = veneerRough;
    base.oak.color.set('#fff3df'); base.oak.roughness = .62; base.oak.normalScale.set(.07, .07);
    base.walnut.map = veneerMap; base.walnut.normalMap = veneerNormal; base.walnut.roughnessMap = veneerRough;
    base.wall.color.set('#edeae3'); base.wall.normalScale.set(.035, .035);
    base.walnut.color.set('#bd9e76'); base.walnut.roughness = .65;
    base.cream.color.set('#f3eee4'); base.linen.color.set('#e4ded1');
    base.linen.side = THREE.DoubleSide; base.linen.normalScale.set(.12, .12); base.cream.normalScale.set(.12, .12);
    base.glass.opacity = .075; base.glass.roughness = .055; base.glass.color.set('#c4d1d1');
    const materials = {
      floor: new THREE.MeshStandardMaterial({ color: '#d4bd96', map: floorMap, normalMap: floorNormal, normalScale: new THREE.Vector2(.09, .09), roughnessMap: floorRough, roughness: .62 }),
      marble: new THREE.MeshPhysicalMaterial({ color: '#f4f0e8', map, normalMap: base.stone.normalMap, normalScale: new THREE.Vector2(.025, .025), roughness: .28, clearcoat: .25 }),
      travertine: new THREE.MeshStandardMaterial({ color: '#ccbea3', map, normalMap: base.stone.normalMap, normalScale: new THREE.Vector2(.06, .06), roughness: .8 }),
      boucle: new THREE.MeshPhysicalMaterial({ color: '#e4ddce', normalMap: base.linen.normalMap, normalScale: new THREE.Vector2(.12, .12), roughness: .95, sheen: .85, sheenColor: new THREE.Color('#eee7da'), sheenRoughness: .8 }),
      sand: new THREE.MeshPhysicalMaterial({ color: '#d8d1bf', roughness: .42, clearcoat: .12 }),
      ceiling: new THREE.MeshStandardMaterial({ color: '#efede6', transparent: true, side: THREE.DoubleSide, roughness: .95 }),
      light: new THREE.MeshBasicMaterial({ color: '#ffe5b1', toneMapped: false }),
    };
    for (const [name, material] of [['veneer', base.oak], ['walnut', base.walnut], ['floor', materials.floor]] as const) {
      material.onBeforeCompile = shader => { shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#ifdef USE_MAP
        vec4 sampleGrain=texture2D(map,vMapUv);float grain=dot(sampleGrain.rgb,vec3(.2126,.7152,.0722));
        vec3 timber=mix(vec3(.33,.23,.135),vec3(.72,.57,.37),pow(clamp(grain*3.,0.,1.),.38));
        diffuseColor*=vec4(timber,sampleGrain.a);
        #endif`); };
      material.customProgramCacheKey = () => 'aven-natural-' + name;
    }
    return { materials, maps };
  }, [base, source]);
  useEffect(() => () => { Object.values(extra.materials).forEach(material => material.dispose()); extra.maps.forEach(map => map.dispose()); }, [extra]);
  return { ...base, ...extra.materials };
}
export type Palette = ReturnType<typeof usePalette>;
