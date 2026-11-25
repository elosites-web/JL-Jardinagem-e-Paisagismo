import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampProgress,
  computeReadingProgress,
  computeTipTranslateX,
  toProgressPercentage,
} from './readingProgress';

test('clampProgress bounds invalid and out-of-range values safely', () => {
  assert.equal(clampProgress(Number.NaN), 0);
  assert.equal(clampProgress(Number.POSITIVE_INFINITY), 0);
  assert.equal(clampProgress(-0.25), 0);
  assert.equal(clampProgress(1.5), 1);
  assert.equal(clampProgress(0.42), 0.42);
});

test('computeReadingProgress calculates normalized scroll ratio accurately', () => {
  assert.equal(
    computeReadingProgress({ scrollY: 0, scrollHeight: 4000, clientHeight: 1000 }),
    0,
  );
  assert.equal(
    computeReadingProgress({ scrollY: 1500, scrollHeight: 4000, clientHeight: 1000 }),
    0.5,
  );
  assert.equal(
    computeReadingProgress({ scrollY: 3200, scrollHeight: 4000, clientHeight: 1000 }),
    1,
  );
  assert.equal(
    computeReadingProgress({ scrollY: 100, scrollHeight: 900, clientHeight: 1000 }),
    0,
  );
});

test('toProgressPercentage rounds and clamps to 0-100 integer range', () => {
  assert.equal(toProgressPercentage(0), 0);
  assert.equal(toProgressPercentage(0.376), 38);
  assert.equal(toProgressPercentage(1.2), 100);
  assert.equal(toProgressPercentage(-0.1), 0);
});

test('computeTipTranslateX aligns silver tip with bar edge without overflowing track bounds', () => {
  assert.equal(computeTipTranslateX(0, 1440, 8), 0);
  assert.equal(computeTipTranslateX(0.5, 1440, 8), 712);
  assert.equal(computeTipTranslateX(1, 1440, 8), 1432);
  assert.equal(computeTipTranslateX(0.5, 0, 8), 0);
});
