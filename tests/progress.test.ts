import assert from 'node:assert/strict';
import test from 'node:test';
import { createChallenge, createWorldProgress, recordSubmission, recordSupport } from '../src/domain/progress.ts';

test('first response and a correct retry remain distinct without modifying the original evidence', () => {
  const initial = createChallenge('harbour-stones', 5);
  assert.equal(recordSubmission(initial, 'first', 5).outcome?.kind, 'independent-first-response');
  const wrong = recordSubmission(initial, 'first', 4);
  const retry = recordSubmission(wrong, 'second', 5);
  assert.equal(retry.outcome?.kind, 'independent-retry');
  assert.equal(retry.attempts[0]?.correct, false);
  assert.equal(initial.attempts.length, 0);
  assert.equal(wrong.outcome, null);
});

test('instructional assistance survives serialization and cannot be downgraded', () => {
  const assisted = recordSupport(createChallenge('garden-1', 3), 'assisted');
  // Storage validation is intentionally deferred, but the contract is plain serializable data.
  const restored = JSON.parse(JSON.stringify(assisted)) as typeof assisted;
  const next = recordSubmission(recordSupport(restored, 'independent'), 'after-help', 3);
  assert.equal(next.outcome?.kind, 'assisted');
  assert.equal(next.attempts[0]?.support, 'assisted');
});

test('guided completion has its own evidence category', () => {
  const guided = recordSupport(recordSupport(createChallenge('harbour-stones', 5), 'assisted'), 'guided');
  assert.equal(recordSubmission(recordSupport(guided, 'assisted'), 'guided-success', 5).outcome?.kind, 'guided');
});

test('double Confirm is idempotent and conflicting reused IDs are rejected', () => {
  const first = recordSubmission(createChallenge('garden-1', 3), 'submit-1', 2);
  assert.equal(recordSubmission(first, 'submit-1', 2), first);
  assert.throws(() => recordSubmission(first, 'submit-1', 3), /reused/);
  assert.equal(first.attempts.length, 1);
});

test('invalid quantities and submissions after completion cannot alter evidence', () => {
  const initial = createChallenge('garden-1', 3);
  for (const value of [-1, .5, Infinity, NaN]) assert.throws(() => recordSubmission(initial, 'invalid', value));
  const complete = recordSubmission(initial, 'success', 3);
  assert.throws(() => recordSubmission(complete, 'later', 4), /completed/);
  assert.equal(recordSupport(complete, 'guided'), complete);
});

test('initial world progress contains no completed skills or reward', () => {
  assert.deepEqual(createWorldProgress(), { version: 1, location: 'harbour', challenges: {}, satchelColour: null });
});
