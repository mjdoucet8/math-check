import { object, integer, progress as readProgress, support as readSupport, rank } from './saveValidation.ts';
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
    snapshot() { return { index: this.index, quantity: this.quantity, phase: this.phase, practice: this.practice, completed: this.completed, progress: this.progress, revision: this.revision, submitted: this.submitted, assistedAt: this.assistedAt, support: this.support }; }
    static restore(value: unknown): Vessels {
        const v = object(value), c = new Vessels();
        c.index = integer(v.index, 0, 5); c.quantity = integer(v.quantity, 0, 8); c.practice = integer(v.practice, 0, 3);
        if (!['task', 'demo', 'guided', 'success', 'complete'].includes(v.phase as string)) throw new Error('Invalid vessel phase');
        c.phase = v.phase as Vessels['phase'];
        c.progress = readProgress(v.progress, `garden-${Math.min(c.index + 1, 5)}`, VESSEL_TARGETS[Math.min(c.index, 4)]!);
        if (!Array.isArray(v.completed) || v.completed.length > 5) throw new Error('Invalid completed vessels');
        let previous = 'independent' as Support;
        for (let i = 0; i < v.completed.length; i++) {
            const p = readProgress(v.completed[i], `garden-${i + 1}`, VESSEL_TARGETS[i]!);
            if (!p.outcome || rank(p.support) < rank(previous)) throw new Error('Invalid completed evidence');
            c.completed.push(p); previous = p.support;
        }
        c.support = readSupport(v.support);
        if (c.support !== c.progress.support || rank(c.support) < rank(previous)) throw new Error('Support cannot be removed');
        c.revision = integer(v.revision, 0, 1000000); c.submitted = integer(v.submitted, -1, c.revision); c.assistedAt = integer(v.assistedAt, 0, c.progress.attempts.length);
        const finished = c.phase === 'success' || c.phase === 'complete';
        if (finished !== Boolean(c.progress.outcome) || finished && c.quantity !== c.progress.target) throw new Error('Invalid vessel completion');
        if (c.phase === 'complete' ? c.index !== 5 || c.completed.length !== 5 : c.index >= 5 || c.completed.length !== c.index + Number(c.phase === 'success')) throw new Error('Invalid question position');
        if (finished && JSON.stringify(c.completed.at(-1)) !== JSON.stringify(c.progress)) throw new Error('Conflicting completion');
        if (c.phase === 'demo' && (c.support === 'independent' || c.assistedAt < 2) || c.phase === 'guided' && (c.support !== 'guided' || c.quantity > c.progress.target)) throw new Error('Invalid vessel help');
        if (c.support === 'independent' && (c.assistedAt || c.practice)) throw new Error('Missing support evidence');
        if (Boolean(c.progress.attempts.length) !== (c.submitted >= 0)) throw new Error('Invalid submission guard');
        if (c.submitted === c.revision && c.progress.attempts.at(-1)?.quantity !== c.quantity) throw new Error('Invalid submitted water');
        return c;
    }
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
