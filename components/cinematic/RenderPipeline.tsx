'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { WebGLRenderTarget, HalfFloatType } from 'three';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
export default function RenderPipeline({ interior, revision }: { interior: boolean; revision: string }) {
  const { gl, scene, camera, size, setDpr } = useThree();
  const samples = useRef({ elapsed: 0, frames: 0, total: 0, lowWindows: 0, reduced: false });
  const pipeline = useMemo(() => {
    const composer = new EffectComposer(gl, new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: Math.min(4, gl.capabilities.maxSamples) }));
    const render = new RenderPass(scene, camera);
    const ao = new SSAOPass(scene, camera, 512, 512, 12); ao.kernelRadius = .45; ao.minDistance = .002; ao.maxDistance = .22;
    composer.addPass(render); composer.addPass(ao); composer.addPass(new OutputPass());
    return { composer, render, ao };
  }, [gl, scene, camera]);
  useEffect(() => { pipeline.composer.setSize(size.width, size.height); pipeline.composer.setPixelRatio(Math.min(gl.getPixelRatio(), 1.5)); }, [pipeline, size, gl]);
  useEffect(() => { gl.shadowMap.autoUpdate = false; gl.shadowMap.needsUpdate = true; }, [gl, revision]);
  useEffect(() => () => { pipeline.composer.dispose(); pipeline.render.dispose(); pipeline.ao.dispose(); }, [pipeline]);
  useFrame((_, delta) => {
    const ao = interior && size.width >= 1000 && !samples.current.reduced;
    pipeline.ao.enabled = ao; pipeline.render.enabled = true;
    pipeline.ao.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);
    pipeline.ao.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
    gl.info.autoReset = false; gl.info.reset();
    pipeline.composer.render(delta);
    const sample = samples.current; sample.elapsed += delta; sample.total += delta; sample.frames++;
    if (sample.elapsed >= 2) {
      const fps = sample.frames / sample.elapsed;
      // Renderer timing is exposed only as DOM data for the requested performance verification.
      Object.assign(gl.domElement.dataset, { fps: fps.toFixed(1), draws: String(gl.info.render.calls), triangles: String(gl.info.render.triangles), geometries: String(gl.info.memory.geometries), textures: String(gl.info.memory.textures), quality: ao ? 'ambient-occlusion' : 'standard' });
      sample.lowWindows = sample.total > 15 && fps < 34 ? sample.lowWindows + 1 : 0;
      if (sample.lowWindows >= 3 && !sample.reduced) { sample.reduced = true; setDpr(1); pipeline.composer.setPixelRatio(1); }
      sample.elapsed = 0; sample.frames = 0;
    }
  }, 1);
  return null;
}
