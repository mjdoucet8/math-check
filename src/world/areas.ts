import { INTERACTABLES, land, walkable, type Cell, type Interactable } from './harbour.ts';
import type { Area } from '../domain/journey.ts';
export const HARBOUR_EXIT: Interactable = { id: 'coast', x: 15, y: 9, name: 'Coastal path', line: 'The path is quiet until the harbour light returns.' };
export const AREA_START: Record<Area, Cell> = { harbour: { x: 7, y: 11 }, 'coastal-path': { x: 3, y: 7 }, garden: { x: 3, y: 9 } };
export const AREA_OBJECTS: Record<Area, readonly Interactable[]> = {
    harbour: [...INTERACTABLES, HARBOUR_EXIT],
    'coastal-path': [
        { id: 'harbour', x: 2, y: 7, name: 'Back to harbour', line: '' },
        { id: 'arch', x: 12, y: 5, name: 'Overgrown arch', line: '' },
    ],
    garden: [
        { id: 'coast', x: 2, y: 9, name: 'Back to the coast', line: '' },
        { id: 'gardener', x: 6, y: 8, name: 'Garden keeper', line: 'This fountain has forgotten its song. Try the old pump to bring water back.' },
        { id: 'satchel', x: 12, y: 8, name: 'Explorer satchel', line: '' },
        { id: 'pump', x: 9, y: 7, name: 'Old garden pump', line: '' },
    ],
};
export function areaLand(area: Area, cell: Cell): boolean {
    if (area === 'harbour')
        return land(cell);
    if (!Number.isInteger(cell.x) || !Number.isInteger(cell.y))
        return false;
    if (area === 'coastal-path')
        return cell.x >= 1 && cell.x <= 14 && cell.y >= 3 && cell.y <= 10 && (Math.abs(cell.y - (8 - cell.x * .2)) < 2.5);
    return cell.x >= 1 && cell.x <= 14 && cell.y >= 2 && cell.y <= 12 && !(cell.x < 3 && cell.y < 5) && !(cell.x > 12 && cell.y > 10);
}
export function areaWalkable(area: Area, cell: Cell): boolean {
    if (area === 'harbour')
        return walkable(cell) && !(cell.x === HARBOUR_EXIT.x && cell.y === HARBOUR_EXIT.y);
    return areaLand(area, cell) && !AREA_OBJECTS[area].some(p => p.x === cell.x && p.y === cell.y)
        && !(area === 'garden' && cell.x >= 8 && cell.x <= 10 && cell.y >= 3 && cell.y <= 5);
}
