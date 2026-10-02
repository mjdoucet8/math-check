import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StoneChallenge } from '../src/domain/stones.ts';

test('edits are not submissions; five stones restore the light independently', () => {
  const c = new StoneChallenge();
  for (let i = 0; i < 5; i++) c.toggle(i);
  c.toggle(0); c.toggle(0); c.toggle(-1); c.toggle(8);
  assert.equal(c.progress.attempts.length, 0);
  assert.equal(c.confirm(), 'correct'); assert.equal(c.confirm(), 'unchanged');
  assert.equal(c.progress.outcome?.kind, 'independent-first-response');
  c.toggle(5); assert.equal(c.selected.size, 5);
});
test('incorrect submission preserves stones and duplicate Confirm is not another failure', () => {
  const c = new StoneChallenge(); c.toggle(2);
  assert.equal(c.confirm(), 'incorrect'); assert.deepEqual([...c.selected], [2]);
  assert.equal(c.confirm(), 'unchanged'); assert.equal(c.helpAvailable, false);
  for (const id of [0,1,3,4]) c.toggle(id);
  assert.equal(c.confirm(), 'correct'); assert.equal(c.progress.outcome?.kind, 'independent-retry');
});
test('help is optional after two submitted failures; practice is separate and assistance is sticky', () => {
  const c = new StoneChallenge(); c.demonstrate(); assert.equal(c.phase, 'task');
  c.confirm(); c.toggle(7); c.confirm(); assert.equal(c.helpAvailable, true);
  c.demonstrate(); assert.equal(c.progress.support, 'assisted');
  c.toggle(4); assert.deepEqual([...c.selected], [7]);
  c.returnToTask(); assert.equal(c.phase, 'demo');
  for (let i = 0; i < 5; i++) c.nextPracticeStone();
  assert.equal(c.demoStep, 3); assert.equal(c.progress.attempts.length, 2);
  c.returnToTask(); assert.equal(c.confirm(), 'unchanged');
  for (const id of [0,1,2,3]) c.toggle(id);
  c.confirm(); assert.equal(c.progress.outcome?.kind, 'assisted');
});
test('declining the demonstration preserves independent evidence', () => {
  const c = new StoneChallenge(); c.confirm(); c.toggle(7); c.confirm();
  for (const id of [0,1,2,3]) c.toggle(id);
  c.confirm(); assert.equal(c.progress.outcome?.kind, 'independent-retry');
});
test('one new incorrect submission after demonstration offers guided placement', () => {
  const c = new StoneChallenge(); c.confirm(); c.toggle(7); c.confirm(); c.demonstrate();
  for (let i = 0; i < 3; i++) c.nextPracticeStone(); c.returnToTask();
  assert.equal(c.guidedAvailable, false); c.confirm(); assert.equal(c.guidedAvailable, false);
  c.toggle(6); c.confirm(); assert.equal(c.guidedAvailable, true);
  c.guide(); assert.equal(c.selected.size, 0);
  for (let i = 0; i < 8; i++) c.placeGuidedStone();
  assert.equal(c.selected.size, 5); c.confirm();
  assert.equal(c.progress.outcome?.kind, 'guided'); assert.equal(c.progress.attempts.length, 4);
});
