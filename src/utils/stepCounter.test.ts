import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeStepCounterFrame,
  easeOutCubic,
  formatStepNumber,
  getStepCounterDurationMs,
  parseStepTarget,
} from './stepCounter';

test('parseStepTarget extracts positive numeric step values safely', () => {
  assert.equal(parseStepTarget('01'), 1);
  assert.equal(parseStepTarget('04'), 4);
  assert.equal(parseStepTarget('12'), 12);
  assert.equal(parseStepTarget('abc'), 0);
  assert.equal(parseStepTarget('00'), 0);
});

test('formatStepNumber pads digits consistently to preserve tabular layout', () => {
  assert.equal(formatStepNumber(0), '00');
  assert.equal(formatStepNumber(1), '01');
  assert.equal(formatStepNumber(4), '04');
  assert.equal(formatStepNumber(10), '10');
  assert.equal(formatStepNumber(-3), '00');
});

test('easeOutCubic starts at 0, ends at 1, and decelerates smoothly', () => {
  assert.equal(easeOutCubic(-0.5), 0);
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.equal(easeOutCubic(1.5), 1);
  assert.ok(easeOutCubic(0.5) > 0.5);
});

test('getStepCounterDurationMs scales gently with step number', () => {
  assert.equal(getStepCounterDurationMs(1), 550);
  assert.equal(getStepCounterDurationMs(4), 760);
});

test('computeStepCounterFrame stays at 00 during reveal delay, counts up smoothly, and completes at target', () => {
  const beforeDelay = computeStepCounterFrame({
    elapsedMs: 100,
    delayMs: 120,
    durationMs: 760,
    targetValue: 4,
  });
  assert.deepEqual(beforeDelay, {
    value: 0,
    formatted: '00',
    progress: 0,
    isComplete: false,
  });

  const midProgress = computeStepCounterFrame({
    elapsedMs: 120 + 250,
    delayMs: 120,
    durationMs: 760,
    targetValue: 4,
  });
  assert.ok(midProgress.value >= 1 && midProgress.value <= 4);
  assert.ok(midProgress.progress > 0 && midProgress.progress < 1);
  assert.equal(midProgress.isComplete, false);

  const completed = computeStepCounterFrame({
    elapsedMs: 120 + 760,
    delayMs: 120,
    durationMs: 760,
    targetValue: 4,
  });
  assert.deepEqual(completed, {
    value: 4,
    formatted: '04',
    progress: 1,
    isComplete: true,
  });
});

test('computeStepCounterFrame resolves immediately when reducedMotion is active', () => {
  const frame = computeStepCounterFrame({
    elapsedMs: 0,
    delayMs: 240,
    durationMs: 690,
    targetValue: 3,
    reducedMotion: true,
  });
  assert.deepEqual(frame, {
    value: 3,
    formatted: '03',
    progress: 1,
    isComplete: true,
  });
});
