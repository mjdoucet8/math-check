/** Shared evidence contract for later scenes. An unlock never represents mastery. */
export type Support = 'independent' | 'assisted' | 'guided';
export type CompletionKind = 'independent-first-response' | 'independent-retry' | 'assisted' | 'guided';
export interface AttemptEvidence {
  readonly submissionId: string;
  readonly quantity: number;
  readonly correct: boolean;
  readonly support: Support;
}
export interface ChallengeOutcome {
  readonly submissionId: string;
  readonly kind: CompletionKind;
}
export interface ChallengeProgress {
  readonly challengeId: string;
  readonly target: number;
  readonly support: Support;
  readonly attempts: readonly AttemptEvidence[];
  readonly outcome: ChallengeOutcome | null;
}
export interface WorldProgress {
  readonly version: 1;
  readonly location: 'harbour' | 'coastal-path' | 'garden';
  readonly challenges: Readonly<Record<string, ChallengeProgress>>;
  readonly satchelColour: string | null;
}

export function createChallenge(challengeId: string, target: number): ChallengeProgress {
  if (!challengeId.trim() || !Number.isSafeInteger(target) || target < 0) {
    throw new Error('A challenge needs an ID and a non-negative integer target.');
  }
  return { challengeId, target, support: 'independent', attempts: [], outcome: null };
}

/** Help cannot be undone by a scene transition or a later caller. Narration is not help. */
export function recordSupport(progress: ChallengeProgress, support: Support): ChallengeProgress {
  if (progress.outcome) return progress;
  const rank: Record<Support, number> = { independent: 0, assisted: 1, guided: 2 };
  return rank[support] > rank[progress.support] ? { ...progress, support } : progress;
}

/** Only an explicit Confirm calls this. Object edits and Empty create no attempts. */
export function recordSubmission(progress: ChallengeProgress, submissionId: string, quantity: number): ChallengeProgress {
  if (!submissionId.trim() || !Number.isSafeInteger(quantity) || quantity < 0) {
    throw new Error('A submission needs an ID and a non-negative integer quantity.');
  }
  const duplicate = progress.attempts.find((attempt) => attempt.submissionId === submissionId);
  if (duplicate) {
    if (duplicate.quantity !== quantity) throw new Error('A submission ID cannot be reused for another response.');
    return progress;
  }
  if (progress.outcome) throw new Error('A completed challenge cannot accept another submission.');
  const attempt: AttemptEvidence = { submissionId, quantity, correct: quantity === progress.target, support: progress.support };
  const attempts = [...progress.attempts, attempt];
  const kind: CompletionKind = progress.support === 'independent'
    ? (attempts.length === 1 ? 'independent-first-response' : 'independent-retry')
    : progress.support;
  return { ...progress, attempts, outcome: attempt.correct ? { submissionId, kind } : null };
}

export function createWorldProgress(): WorldProgress {
  return { version: 1, location: 'harbour', challenges: {}, satchelColour: null };
}
