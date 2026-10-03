/** One complete left/right cycle advances 52 world pixels. */
export const WALK_CYCLE_DISTANCE = 52;
const SCALE = .23, UPPER = 76, LOWER = 90;
const HALF_STRIDE = WALK_CYCLE_DISTANCE / (4 * SCALE);

/** Two-bone inverse kinematics: stance feet move backwards at ground speed;
 * recovery feet lift, bend at the knee, and return for the next contact. */
export function walkingLeg(cycle: number, leg: number) {
  const phase = ((cycle + leg * .5) % 1 + 1) % 1;
  const bob = Math.sin(cycle * Math.PI * 2) ** 2 * .5;
  const stance = phase < .5;
  const recovery = (phase - .5) * 2;
  const ease = recovery - Math.sin(recovery * Math.PI * 2) / (Math.PI * 2);
  const x = stance ? HALF_STRIDE * (1 - 4 * phase) : HALF_STRIDE * (2 * ease - 1);
  const y = 150 + bob / SCALE - (stance ? 0 : Math.sin(recovery * Math.PI) * 32);
  const distance = Math.hypot(x, y);
  const hipOffset = Math.acos(Math.max(-1, Math.min(1, (UPPER ** 2 + distance ** 2 - LOWER ** 2) / (2 * UPPER * distance))));
  const knee = Math.acos(Math.max(-1, Math.min(1, (distance ** 2 - UPPER ** 2 - LOWER ** 2) / (2 * UPPER * LOWER))));
  return { thigh: -Math.atan2(x, y) - hipOffset, shin: knee, bodyY: 15 * SCALE - bob, stance, foot: { x, y } };
}
