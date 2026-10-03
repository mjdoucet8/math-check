import type { Cell } from '../world/harbour.ts';
export type Area = 'harbour' | 'coastal-path' | 'garden';
export const SATCHEL_COLOURS = [
    { id: 'moss', name: 'Moss green', hex: '#78936a', colour: 0x78936a },
    { id: 'ocean', name: 'Ocean teal', hex: '#438e9b', colour: 0x438e9b },
    { id: 'sunset', name: 'Sunset ochre', hex: '#cd9858', colour: 0xcd9858 },
] as const;
export type SatchelColour = typeof SATCHEL_COLOURS[number]['id'];
export class Journey {
    area: Area = 'harbour';
    beaconAwake = false;
    gardenCompleted = 0;
    satchelColour: SatchelColour | null = null;
    get rewardUnlocked() { return this.gardenCompleted === 5; }
    equipSatchel(colour: SatchelColour): boolean {
        if (this.area !== 'garden' || !this.rewardUnlocked || !SATCHEL_COLOURS.some(c => c.id === colour)) return false;
        this.satchelColour = colour;
        return true;
    }
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
