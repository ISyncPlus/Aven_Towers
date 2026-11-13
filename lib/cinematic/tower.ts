import type { Parts, V3 } from '../architecture.ts';
import { levelBase } from './plan.ts';
export function towerParts(): { shell: Parts; featured: Parts } {
  const create = (): Parts => ({ stone: [], metal: [], glass: [], warm: [], bronze: [], dark: [] });
  const shell = create(), featured = create();
  for (let floor = 2; floor <= 25; floor++) {
    const parts = floor === 18 ? featured : shell;
    const add = (mat: string, p: V3, s: V3) => parts[mat].push({ p, s });
    const y = levelBase(floor);
    add('metal', [0, y, 0], [19.4, .18, 15.3]);
    if (floor !== 18) add('dark', [0, y + 1.58, -.35], [18.7, 3.12, 13.2]);
    for (let bay = 0; bay < 14; bay++) {
      const x = -9.05 + bay * 1.39;
      const recessed = Math.abs(x) < 3;
      const z = recessed ? 7.15 : 7.6;
      add(recessed ? 'warm' : 'glass', [x, y + 1.65, z], [1.33, 3.12, .04]);
      add('metal', [x - .69, y + 1.65, z + .025], [.045, 3.25, .1]);
      add('metal', [x, y + 2.43, z + .025], [1.4, .035, .075]);
    }
    add('bronze', [0, y + .13, 7.2], [6.1, .2, .95]);
    if (floor % 7 === 1 || floor === 25) {
      add('bronze', [0, y + 2.98, 7.25], [6.1, .27, 1]);
      add('dark', [0, y + 1.65, 7.12], [5.95, 2.45, .045]);
      for (let fin = 0; fin < 11; fin++) add('bronze', [0, y + .45 + fin * .24, 7.28], [6, .055, .16]);
    }
    for (let bay = 0; bay < 10; bay++) {
      const z = -6.6 + bay * 1.45;
      add('glass', [9.62, y + 1.65, z], [.035, 3.12, 1.39]);
      add('metal', [9.66, y + 1.65, z - .72], [.08, 3.25, .045]);
      add('metal', [9.66, y + 2.43, z], [.075, .035, 1.46]);
      add('stone', [-9.62, y + 1.62, z], [.16, 3.18, 1.39]);
    }
    for (let bay = 0; bay < 4; bay++) add('glass', [-8.25 + bay * 1.4, y + 1.65, -7.13], [1.34, 3.12, .035]);
    add('metal', [2.6, y + 1.65, -7.13], [12.6, 3.12, .06]);
    if (floor % 7 === 1) add('bronze', [0, y - .14, 0], [19.6, .45, 15.6]);
  }
  const add = (mat: string, p: V3, s: V3) => shell[mat].push({ p, s });
  add('stone', [0, .35, 0], [22, .7, 18]);
  add('dark', [0, 2.6, -.6], [18.5, 4.5, 13]);
  add('glass', [0, 2.65, 7.15], [19, 4.4, .05]);
  for (let x = -9; x <= 9; x += 3) add('bronze', [x, 2.6, 7.4], [.17, 5.1, .5]);
  add('metal', [0, 5, 7.8], [21, .3, 3]);
  add('bronze', [0, 4.8, 8.9], [20.8, .055, .15]);
  add('metal', [0, 89.15, 0], [19.5, .3, 15.4]);
  add('glass', [0, 91, 0], [19, 3.4, 15]);
  add('bronze', [0, 92.8, 0], [19.6, .22, 15.6]);
  add('dark', [0, 93.5, -1.5], [8, 1.2, 6]);
  for (const x of [-3.1, 3.1]) add('bronze', [x, 47, 7.32], [.12, 84, .28]);
  for (let fin = 0; fin < 15; fin++) add('metal', [-9.1 + fin * 1.3, 91, 7.55], [.055, 3.4, .12]);
  return { shell, featured };
}
