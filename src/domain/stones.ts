import { object, integer, progress as readProgress } from './saveValidation.ts';
import { createChallenge, recordSubmission, recordSupport, type ChallengeProgress } from './progress.ts';

export const STONE_TARGET = 5; // Provisional prototype target; not a grade-level claim.
export const STONE_SUPPLY = 8;
export type StonePhase = 'task' | 'demo' | 'guided' | 'complete';
/** Scene-independent encounter state. Edits never submit answers. */
export class StoneChallenge {
  progress: ChallengeProgress = createChallenge('harbour-stones', STONE_TARGET);
  readonly selected = new Set<number>();
  phase: StonePhase = 'task';
  demoStep = 0;
  private assistedAt = 0;
  private submittedRevision = -1;
  private revision = 0;
  snapshot() { return { progress: this.progress, selected: [...this.selected], phase: this.phase, demoStep: this.demoStep, assistedAt: this.assistedAt, submittedRevision: this.submittedRevision, revision: this.revision }; }
  static restore(value: unknown): StoneChallenge {
    const v = object(value), c = new StoneChallenge();
    c.progress = readProgress(v.progress, 'harbour-stones', STONE_TARGET);
    if (!Array.isArray(v.selected) || v.selected.length > STONE_SUPPLY) throw new Error('Invalid saved stones');
    for (const stone of v.selected) { const id = integer(stone, 0, STONE_SUPPLY - 1); if (c.selected.has(id)) throw new Error('Repeated saved stone'); c.selected.add(id); }
    if (!['task', 'demo', 'guided', 'complete'].includes(v.phase as string)) throw new Error('Invalid saved phase');
    c.phase = v.phase as StonePhase;
    c.demoStep = integer(v.demoStep, 0, 3); c.assistedAt = integer(v.assistedAt, 0, c.progress.attempts.length);
    c.revision = integer(v.revision, 0, 1000000); c.submittedRevision = integer(v.submittedRevision, -1, c.revision);
    if ((c.phase === 'complete') !== Boolean(c.progress.outcome) || c.progress.outcome && c.selected.size !== STONE_TARGET) throw new Error('Invalid stone completion');
    if (c.phase === 'demo' && (c.progress.support !== 'assisted' || c.assistedAt < 2)) throw new Error('Invalid saved demonstration');
    if (c.phase === 'guided' && (c.progress.support !== 'guided' || c.selected.size > STONE_TARGET || [...c.selected].some(id => id >= c.selected.size))) throw new Error('Invalid saved guidance');
    if (c.progress.support === 'independent' && (c.assistedAt || c.demoStep)) throw new Error('Missing support evidence');
    if (Boolean(c.progress.attempts.length) !== (c.submittedRevision >= 0)) throw new Error('Invalid submission guard');
        if (c.submittedRevision === c.revision && c.progress.attempts.at(-1)?.quantity !== c.selected.size) throw new Error('Invalid submitted arrangement');
    return c;
  }
  get helpAvailable() { return this.progress.attempts.filter(a => !a.correct).length >= 2 && this.phase === 'task'; }
  get guidedAvailable() { return this.helpAvailable && this.progress.support === 'assisted' && this.progress.attempts.length > this.assistedAt; }
  toggle(stone: number) {
    if (this.phase !== 'task' || !Number.isInteger(stone) || stone < 0 || stone >= STONE_SUPPLY) return;
    if (this.selected.has(stone)) this.selected.delete(stone); else this.selected.add(stone);
    this.revision++;
  }
  confirm(): 'correct' | 'incorrect' | 'unchanged' {
    if (!['task', 'guided'].includes(this.phase) || this.submittedRevision === this.revision || this.progress.outcome) return 'unchanged';
    this.progress = recordSubmission(this.progress, `harbour-${this.progress.attempts.length + 1}`, this.selected.size);
    this.submittedRevision = this.revision;
    if (this.progress.outcome) { this.phase = 'complete'; return 'correct'; }
    return 'incorrect';
  }
  demonstrate() {
    if (!this.helpAvailable) return;
    this.progress = recordSupport(this.progress, 'assisted');
    this.assistedAt = this.progress.attempts.length;
    this.demoStep = 0; this.phase = 'demo';
  }
  nextPracticeStone() { if (this.phase === 'demo') this.demoStep = Math.min(3, this.demoStep + 1); }
  returnToTask() { if (this.phase === 'demo' && this.demoStep === 3) this.phase = 'task'; }
  guide() {
    if (!this.guidedAvailable) return;
    this.progress = recordSupport(this.progress, 'guided');
    this.selected.clear(); this.revision++; this.phase = 'guided';
  }
  placeGuidedStone() {
    if (this.phase !== 'guided' || this.selected.size >= STONE_TARGET) return;
    this.selected.add(this.selected.size); this.revision++;
  }
}
