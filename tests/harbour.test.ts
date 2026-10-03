import { test } from 'node:test';
import assert from 'node:assert/strict';
import { approach, BUILDINGS, INTERACTABLES, key, neighbours, project, route, START, unproject, walkable } from '../src/world/harbour.ts';

test('every walkable harbour cell is reachable without crossing obstacles or corners', () => {
  for (let x = 1; x <= 18; x++) for (let y = 1; y <= 14; y++) {
    const end = { x, y }; if (!walkable(end)) continue;
    const path = route(START, end); assert.ok(path);
    let previous = START;
    for (const step of path) {
      assert.ok(walkable(step));
      assert.equal(Math.abs(previous.x - step.x) + Math.abs(previous.y - step.y), 1);
      previous = step;
    }
    assert.equal(key(previous), key(end));
    assert.deepEqual(unproject(project(end)), end);
  }
});
test('buildings, objects, props and sea cannot be movement destinations', () => {
  for (const b of BUILDINGS) assert.equal(route(START, b), null);
  for (const object of INTERACTABLES) assert.equal(route(START, object), null);
  assert.equal(route(START, { x: 10, y: 10 }), null);
  assert.equal(route(START, { x: 0, y: 15 }), null);
  assert.equal(route(START, { x: NaN, y: 9 }), null);
});
test('object approach selects a reachable neighbouring cell and can already be in range', () => {
  for (const object of INTERACTABLES) {
    const path = approach(START, object); assert.ok(path?.length);
    const end = path.at(-1)!;
    assert.ok(neighbours(object).some(cell => key(cell) === key(end)));
    assert.deepEqual(approach(end, object), []);
  }
});
