import { Journey, SATCHEL_COLOURS, type Area, type SatchelColour } from './journey.ts';
import { StoneChallenge } from './stones.ts';
import { Vessels } from './vessels.ts';
import { object, integer } from './saveValidation.ts';
import { areaWalkable, AREA_OBJECTS } from '../world/areas.ts';
export const SAVE_KEY = 'numora.journey.v1';
export interface Session { journey: Journey; stones: StoneChallenge; vessels: Vessels }
export const freshSession = (): Session => ({ journey: new Journey(), stones: new StoneChallenge(), vessels: new Vessels() });
export function encodeSession(session: Session): string {
  return encodeSnapshots(session.journey, session.stones.snapshot(), session.vessels.snapshot());
}
export function encodeSnapshots(j: Journey, stones: ReturnType<StoneChallenge['snapshot']>, vessels: ReturnType<Vessels['snapshot']>): string {
  return JSON.stringify({ version: 1, journey: { area: j.area, beaconAwake: j.beaconAwake, gardenCompleted: j.gardenCompleted, satchelColour: j.satchelColour, positions: [...j.positions], visited: [...j.visited].map(([area, ids]) => [area, [...ids]]) }, stones, vessels });
}
function area(value: unknown): Area { if (!['harbour', 'coastal-path', 'garden'].includes(value as string)) throw new Error('Invalid saved area'); return value as Area; }
export function decodeSession(text: string): Session {
  if (text.length > 1000000) throw new Error('Saved journey is too large');
  const v = object(JSON.parse(text)); if (v.version !== 1) throw new Error('Unknown save version');
  const stones = StoneChallenge.restore(v.stones), vessels = Vessels.restore(v.vessels), j = object(v.journey), journey = new Journey();
  journey.area = area(j.area); journey.beaconAwake = Boolean(stones.progress.outcome); journey.gardenCompleted = vessels.completed.length;
  if (j.beaconAwake !== journey.beaconAwake || j.gardenCompleted !== journey.gardenCompleted || !journey.beaconAwake && (journey.area !== 'harbour' || vessels.index || vessels.quantity || vessels.progress.attempts.length || vessels.progress.support !== 'independent')) throw new Error('Conflicting journey unlocks');
  if (j.satchelColour !== null) {
    if (!journey.rewardUnlocked || !SATCHEL_COLOURS.some(c => c.id === j.satchelColour)) throw new Error('Invalid saved reward');
    journey.satchelColour = j.satchelColour as SatchelColour;
  }
  if (!Array.isArray(j.positions) || j.positions.length > 3 || !Array.isArray(j.visited) || j.visited.length > 3) throw new Error('Invalid area state');
  for (const entry of j.positions) {
    if (!Array.isArray(entry) || entry.length !== 2) throw new Error('Invalid saved position');
    const id = area(entry[0]), cell = object(entry[1]), p = { x: integer(cell.x, 1, 18), y: integer(cell.y, 1, 14) };
    if (journey.positions.has(id) || !areaWalkable(id, p)) throw new Error('Unreachable saved position'); journey.positions.set(id, p);
  }
  for (const entry of j.visited) {
    if (!Array.isArray(entry) || entry.length !== 2 || !Array.isArray(entry[1]) || entry[1].length > 3) throw new Error('Invalid visited residents');
    const id = area(entry[0]), ids = entry[1];
    if (journey.visited.has(id) || new Set(ids).size !== ids.length || ids.some(item => typeof item !== 'string' || !['keeper', 'beacon', 'gardener'].includes(item) || !AREA_OBJECTS[id].some(o => o.id === item))) throw new Error('Invalid resident'); journey.visited.set(id, new Set(ids));
  }
  return { journey, stones, vessels };
}
export interface SaveStorage { getItem(key: string): string | null; setItem(key: string, text: string): void; removeItem(key: string): void }
export class BrowserSave {
  private readonly storage: SaveStorage | null;
  constructor(storage: SaveStorage | null) { this.storage = storage; }
  load(): { session: Session; status: 'new' | 'resumed' | 'damaged' | 'unavailable' } {
    if (!this.storage) return { session: freshSession(), status: 'unavailable' };
    let text: string | null;
    try { text = this.storage.getItem(SAVE_KEY); } catch { return { session: freshSession(), status: 'unavailable' }; }
    if (text === null) return { session: freshSession(), status: 'new' };
    try { return { session: decodeSession(text), status: 'resumed' }; } catch { return { session: freshSession(), status: 'damaged' }; }
  }
  save(text: string): boolean { try { if (!this.storage) return false; this.storage.setItem(SAVE_KEY, text); return true; } catch { return false; } }
  clear(): boolean { try { if (!this.storage) return false; this.storage.removeItem(SAVE_KEY); return true; } catch { return false; } }
}
