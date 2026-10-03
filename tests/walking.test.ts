import assert from 'node:assert/strict';
import { WALK_CYCLE_DISTANCE, walkingLeg } from '../src/world/walking.ts';
for (let i = 0; i < 200; i++) for (const side of [0, 1]) {
  const cycle = i / 200, pose = walkingLeg(cycle, side);
  const x = -Math.sin(pose.thigh) * 76 - Math.sin(pose.thigh + pose.shin) * 90;
  const y = Math.cos(pose.thigh) * 76 + Math.cos(pose.thigh + pose.shin) * 90;
  assert.ok(Math.abs(x - pose.foot.x) < 1e-8 && Math.abs(y - pose.foot.y) < 1e-8, 'knees must reach the registered foot');
  if (pose.stance) assert.ok(Math.abs(pose.bodyY + (-165 + y) * .23) < 1e-8, 'stance sole must stay on ground');
}
for (const cycle of [.05,.15,.25,.35]) {
 const first = walkingLeg(cycle,0), next = walkingLeg(cycle+.01,0);
 assert.ok(Math.abs((next.foot.x-first.foot.x)*.23 + WALK_CYCLE_DISTANCE*.01) < 1e-8, 'stance foot must cancel forward travel');
 assert.notEqual(first.stance,walkingLeg(cycle,1).stance,'legs must alternate support');
}
for (const boundary of [.5,1]) {
 const before=walkingLeg(boundary-1e-7,0), after=walkingLeg(boundary+1e-7,0);
 assert.ok(Math.hypot(before.foot.x-after.foot.x,before.foot.y-after.foot.y)<.001,'cycle must not snap at contact or wrap');
}
console.log('Walking: registered joints, planted feet, alternating support and continuous cycle passed.');
