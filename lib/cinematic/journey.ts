import { CatmullRomCurve3, Vector3 } from 'three';
import type { Vec3 } from './plan.ts';
export type Waypoint = { p: Vec3; target: Vec3 };
const w = (p: Vec3, target: Vec3): Waypoint => ({ p, target });
// Intermediate points keep the stabilized camera inside the actual door openings and circulation space.
export const journey: { room: number; points: Waypoint[] }[] = [
  { room: 0, points: [w([4.5, 1.6, 6.3], [3.3, 1.2, 3.5])] },
  { room: 1, points: [w([6.7, 1.6, 5.65], [9, 1.5, 7.1]), w([7.4, 1.6, 4.7], [9.2, 1.45, 7.2])] },
  { room: 2, points: [w([7.7, 1.6, 2.8], [5.8, 1.25, .1]), w([7.8, 1.6, 1.45], [5.5, 1.25, -.2])] },
  { room: 3, points: [w([7.8, 1.6, -2.0], [4, 1.3, -4.8]), w([7.6, 1.6, -4.6], [2, 1.2, -5.7]), w([5.6, 1.6, -4.5], [1.3, 1.25, -5.7])] },
  { room: 4, points: [w([7.5, 1.6, -3.9], [4, 1.4, -1]), w([7.7, 1.6, -2], [3, 1.4, -.3]), w([3.3, 1.6, -1], [-2, 1.5, 0]), w([1.2, 1.6, 0], [-5, 1.5, 0]), w([-2.1, 1.6, 0], [-6.8, 1.5, .1])] },
  { room: 5, points: [w([-4.8, 1.6, 0], [-5.8, 1.5, -2]), w([-5.8, 1.6, -.65], [-5.8, 1.5, -4]), w([-5.8, 1.6, -1.8], [-4.7, 1.4, -5.5]), w([-4.55, 1.6, -3.7], [-4.8, 1.3, -6.7])] },
  { room: 6, points: [w([-4.7, 1.6, -2.4], [-5.8, 1.5, -.5]), w([-5.8, 1.6, -1.8], [-5.8, 1.5, .3]), w([-5.8, 1.6, -.55], [-4.5, 1.5, 1.6]), w([-4.55, 1.6, .3], [-4.55, 1.5, 3.6]), w([-4.55, 1.6, 1.9], [-6.3, 1.3, 3.2]), w([-4.4, 1.6, 5.7], [-6.4, 1.2, 3.2]), w([-6.3, 1.6, 5.7], [-6.4, 1.2, 2.65])] },
  { room: 7, points: [w([-4.4, 1.6, 5.7], [-4.55, 1.5, 1.7]), w([-4.55, 1.6, 2], [-4.55, 1.5, .3]), w([-4.55, 1.6, .3], [-1.4, 1.5, .4]), w([-1.4, 1.6, .3], [-1.4, 1.5, 3.5]), w([-1.4, 1.6, 2.2], [-3, 1.5, 4.6]), w([-1.25, 1.6, 3.4], [-3.25, 1.4, 4.65])] },
  { room: 8, points: [w([-1.25, 3.7, 3.4], [-4, .8, 3.4]), w([7, 13, 17], [0, .4, 0]), w([23, 25, 30], [0, .4, 0])] },
];
export function createJourney() {
  const points = journey.flatMap(segment => segment.points);
  const position = new CatmullRomCurve3(points.map(point => new Vector3(...point.p)), false, 'centripetal');
  const target = new CatmullRomCurve3(points.map(point => new Vector3(...point.target)), false, 'centripetal');
  let count = 0;
  const stops = journey.map(segment => { count += segment.points.length; return (count - 1) / (points.length - 1); });
  position.arcLengthDivisions = 1500;
  return { position, target, stops };
}
