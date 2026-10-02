import type { Cell } from '../world/harbour.ts';
export type Area = 'harbour' | 'coastal-path' | 'garden';
export class Journey {
    area: Area = 'harbour';
    beaconAwake = false;
    gardenCompleted = 0;
    readonly visited = new Map<Area, Set<string>>();
    readonly positions = new Map<Area, Cell>();
    travel(destination: Area): boolean {
        const allowed = this.area === 'harbour' && destination === 'coastal-path' && this.beaconAwake
            || this.area === 'coastal-path' && ['harbour', 'garden'].includes(destination)
            || this.area === 'garden' && destination === 'coastal-path';
        if (!allowed)
            return false;
        this.area = destination;
        return true;
    }
}
