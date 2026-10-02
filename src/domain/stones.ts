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
