import { createChallenge, recordSubmission, recordSupport, type ChallengeProgress, type Support } from './progress.ts';
export const VESSEL_TARGETS = [3, 5, 4, 6, 5] as const; // Provisional opening quantities.
export const PORTION = 1;
export class Vessels {
    index = 0;
    quantity = 0;
    phase: 'task' | 'demo' | 'guided' | 'success' | 'complete' = 'task';
    practice = 0;
    readonly completed: ChallengeProgress[] = [];
    progress = createChallenge('garden-1', VESSEL_TARGETS[0]);
    private revision = 0;
    private submitted = -1;
    private assistedAt = 0;
    private support: Support = 'independent';
    get helpAvailable() { return this.phase === 'task' && this.progress.attempts.filter(a => !a.correct).length >= 2; }
    get guidedAvailable() { return this.helpAvailable && this.progress.support !== 'independent' && this.progress.attempts.length > this.assistedAt; }
    pump() { if (this.phase === 'task' || this.phase === 'guided' && this.quantity < this.progress.target) {
        if (this.quantity >= 8)
            return;
        this.quantity += PORTION;
        this.revision++;
    } }
    empty() { if (this.phase === 'task' && this.quantity) {
        this.quantity = 0;
        this.revision++;
    } }
    confirm() {
        if (!['task', 'guided'].includes(this.phase) || this.submitted === this.revision)
            return 'unchanged';
        if (this.phase === 'guided' && this.quantity !== this.progress.target)
            return 'unchanged';
        this.progress = recordSubmission(this.progress, `garden-${this.index + 1}-${this.progress.attempts.length + 1}`, this.quantity);
        this.submitted = this.revision;
        if (this.progress.outcome) {
            this.completed.push(this.progress);
            this.phase = 'success';
            return 'correct';
        }
        return 'incorrect';
    }
    next() {
        if (this.phase !== 'success')
            return;
        this.index++;
        if (this.index === 5) {
            this.phase = 'complete';
            return;
        }
        this.progress = recordSupport(createChallenge(`garden-${this.index + 1}`, VESSEL_TARGETS[this.index]!), this.support);
        this.quantity = 0;
        this.revision = 0;
        this.submitted = -1;
        this.assistedAt = 0;
        this.phase = 'task';
    }
    demonstrate() { if (!this.helpAvailable)
        return; this.support = this.support === 'guided' ? 'guided' : 'assisted'; this.progress = recordSupport(this.progress, this.support); this.assistedAt = this.progress.attempts.length; this.practice = 0; this.phase = 'demo'; }
    practicePump() { if (this.phase === 'demo')
        this.practice = Math.min(3, this.practice + PORTION); }
    returnToTask() { if (this.phase === 'demo' && this.practice === 3)
        this.phase = 'task'; }
    guide() { if (!this.guidedAvailable)
        return; this.support = 'guided'; this.progress = recordSupport(this.progress, 'guided'); this.quantity = 0; this.revision++; this.phase = 'guided'; }
}
