export interface Cell { x: number; y: number }
export interface Point { x: number; y: number }
export const TILE_WIDTH = 80;
export const TILE_HEIGHT = 40;
export const START: Cell = { x: 7, y: 11 };
export const BUILDINGS = [
  { x: 4, y: 3, w: 3, h: 2, colour: 0xb77253 },
  { x: 12, y: 4, w: 3, h: 2, colour: 0x858e68 },
] as const;
export const PROPS = [
  { x: 4, y: 8, kind: 'planter' },
  { x: 10, y: 10, kind: 'crates' },
  { x: 13, y: 10, kind: 'planter' },
  { x: 3, y: 11, kind: 'bollard' },
] as const;
export const INTERACTABLES = [
  { id: 'keeper', x: 8, y: 8, name: 'Harbour keeper', line: 'This light has been quiet for a long time. Can you help me fix it?' },
  { id: 'beacon', x: 11, y: 8, name: 'The harbour light', line: 'An old brass light. Its crystal is dark, but something inside seems to be waiting.' },
] as const;
export type Interactable = typeof INTERACTABLES[number];

export function key(cell: Cell): string { return `${cell.x},${cell.y}`; }
export function project(cell: Point): Point {
  return { x: (cell.x - cell.y) * TILE_WIDTH / 2, y: (cell.x + cell.y) * TILE_HEIGHT / 2 };
}
export function unproject(point: Point): Cell {
  return { x: Math.round(point.x / TILE_WIDTH + point.y / TILE_HEIGHT), y: Math.round(point.y / TILE_HEIGHT - point.x / TILE_WIDTH) };
}
export function land(cell: Cell): boolean {
  const { x, y } = cell;
  return Number.isInteger(x) && Number.isInteger(y) && x >= 1 && y >= 1 && x <= 18 && y <= 14
    && !(x < 3 && y > 10) && !(x > 15 && y < 4) && !(x > 16 && y > 12) && !(x < 3 && y < 3);
}
export function walkable(cell: Cell): boolean {
  return land(cell)
    && !BUILDINGS.some((b) => cell.x >= b.x && cell.x < b.x + b.w && cell.y >= b.y && cell.y < b.y + b.h)
    && !PROPS.some((p) => key(p) === key(cell))
    && !INTERACTABLES.some((p) => key(p) === key(cell));
}
export function neighbours(cell: Cell): Cell[] {
  return [{ x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y }, { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 }];
}
/** Four-neighbour routes cannot cut through diagonal building corners. */
export function route(start: Cell, end: Cell): Cell[] | null {
  if (!walkable(start) || !walkable(end)) return null;
  const queue: Cell[] = [start];
  const seen = new Set([key(start)]);
  const previous = new Map<string, Cell>();
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i]!;
    if (key(current) === key(end)) {
      const result: Cell[] = [];
      let cursor = current;
      while (key(cursor) !== key(start)) {
        result.unshift(cursor);
        cursor = previous.get(key(cursor))!;
      }
      return result;
    }
    for (const next of neighbours(current)) {
      if (walkable(next) && !seen.has(key(next))) {
        seen.add(key(next)); previous.set(key(next), current); queue.push(next);
      }
    }
  }
  return null;
}
/** Approach the nearest reachable adjacent tile, never the object's occupied tile. */
export function approach(start: Cell, object: Cell): Cell[] | null {
  const routes = neighbours(object).map((cell) => route(start, cell)).filter((path): path is Cell[] => path !== null);
  return routes.sort((a, b) => a.length - b.length)[0] ?? null;
}
