import { createChallenge, recordSubmission, recordSupport, type ChallengeProgress, type Support } from './progress.ts';
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid saved object');
  return value as Record<string, unknown>;
}
export function integer(value: unknown, min: number, max: number): number {
  if (!Number.isSafeInteger(value) || (value as number) < min || (value as number) > max) throw new Error('Invalid saved number');
  return value as number;
}
export function support(value: unknown): Support {
  if (value !== 'independent' && value !== 'assisted' && value !== 'guided') throw new Error('Invalid saved support');
  return value;
}
export const rank = (value: Support) => ['independent', 'assisted', 'guided'].indexOf(value);
/** Rebuild evidence from submitted answers, never from an unlock or an answer arrangement. */
export function progress(value: unknown, id: string, target: number): ChallengeProgress {
  const v = object(value);
  if (v.challengeId !== id || v.target !== target || !Array.isArray(v.attempts) || v.attempts.length > 10000) throw new Error('Invalid saved evidence');
  let result = createChallenge(id, target);
  for (const item of v.attempts) {
    const a = object(item), help = support(a.support);
    if (rank(help) < rank(result.support) || typeof a.submissionId !== 'string' || !a.submissionId || a.submissionId.length > 100) throw new Error('Invalid saved attempt');
    const expectedId = `${id === 'harbour-stones' ? 'harbour' : id}-${result.attempts.length + 1}`;
    if (a.submissionId !== expectedId) throw new Error('Invalid saved submission sequence');
    if (result.attempts.some(p => p.submissionId === a.submissionId)) throw new Error('Repeated saved attempt');
    result = recordSupport(result, help);
    const quantity = integer(a.quantity, 0, 8);
    if (a.correct !== (quantity === target)) throw new Error('Incorrect saved result');
    result = recordSubmission(result, a.submissionId, quantity);
  }
  const help = support(v.support);
  if (rank(help) < rank(result.support)) throw new Error('Support cannot be removed');
  result = recordSupport(result, help);
  if (result.support !== help) throw new Error('Completed evidence cannot change');
  if (result.outcome === null) { if (v.outcome !== null) throw new Error('Unsubmitted success'); }
  else {
    const outcome = object(v.outcome);
    if (outcome.kind !== result.outcome.kind || outcome.submissionId !== result.outcome.submissionId) throw new Error('Invalid saved outcome');
  }
  return result;
}
