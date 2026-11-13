import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createJourney } from '../lib/cinematic/journey.ts';
import { insideWall, RESIDENCE_Y, FEATURED_LEVEL, levelBase, rooms } from '../lib/cinematic/plan.ts';
import { initialNavigation, navigationReducer as reduce } from '../lib/cinematic/navigation.ts';
test('the continuous camera route clears walls and stays inside the apartment at eye level', () => {
  const { position, target, stops } = createJourney();
  assert.equal(stops.length, rooms.length + 1);
  assert.equal(RESIDENCE_Y, levelBase(FEATURED_LEVEL));
  assert.equal(stops[0], 0); assert.equal(stops.at(-1), 1);
  for (let i = 1; i < stops.length; i++) assert.ok(stops[i] > stops[i - 1]);
  for (let i = 0; i <= 5000; i++) {
    const p = position.getPoint(i / 5000), t = target.getPoint(i / 5000);
    assert.ok([p.x, p.y, p.z, t.x, t.y, t.z].every(Number.isFinite));
    if (p.y < 2.7) { assert.ok(!insideWall(p.x, p.z, .08), `wall collision at ${i}: ${p.toArray()}`); assert.ok(Math.abs(p.x) < 8.9 && Math.abs(p.z) < 6.9); }
  }
});
test('navigation supports bounded floor selection, interruption, reversal and safe exits', () => {
  assert.equal(reduce(initialNavigation, { type: 'FLOOR', floor: 26 }), initialNavigation);
  let state = reduce(initialNavigation, { type: 'FLOOR', floor: 9 });
  state = reduce(state, { type: 'ENTER' }); assert.equal(state.floor, 18);
  state = reduce(state, { type: 'ENTERED' }); assert.equal(state.stage, 'cutaway');
  state = reduce(state, { type: 'ROOM', index: 7 }); const request = state.request;
  state = reduce(state, { type: 'ROOM', index: 2 }); assert.ok(state.request > request); assert.equal(state.target, 2);
  state = reduce(state, { type: 'ARRIVED' }); assert.equal(state.active, 2); assert.equal(state.busy, false);
  state = reduce(state, { type: 'ROOM', index: 8 }); state = reduce(state, { type: 'ARRIVED' }); assert.equal(state.stage, 'overview');
  state = reduce(state, { type: 'TOWER' }); assert.equal(state.stage, 'hero');
  assert.equal(reduce(state, { type: 'ENTERED' }), state);
  assert.equal(reduce(state, { type: 'ARRIVED' }), state);
  assert.equal(reduce(state, { type: 'ROOM', index: -1 }), state);
});
