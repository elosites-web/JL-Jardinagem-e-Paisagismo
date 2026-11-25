import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BACK_TO_TOP_DESKTOP_THRESHOLD_PX,
  BACK_TO_TOP_MOBILE_THRESHOLD_PX,
  getBackToTopThreshold,
  shouldShowBackToTop,
} from './backToTop.ts';

test('getBackToTopThreshold uses lower scroll threshold on mobile viewports', () => {
  assert.equal(getBackToTopThreshold(390), BACK_TO_TOP_MOBILE_THRESHOLD_PX);
  assert.equal(getBackToTopThreshold(767), BACK_TO_TOP_MOBILE_THRESHOLD_PX);
  assert.equal(getBackToTopThreshold(768), BACK_TO_TOP_DESKTOP_THRESHOLD_PX);
  assert.equal(getBackToTopThreshold(1440), BACK_TO_TOP_DESKTOP_THRESHOLD_PX);
  assert.equal(getBackToTopThreshold(0), BACK_TO_TOP_DESKTOP_THRESHOLD_PX);
});

test('shouldShowBackToTop reveals strictly past threshold and guards invalid scrollY', () => {
  assert.equal(shouldShowBackToTop({ scrollY: 0, viewportWidth: 390 }), false);
  assert.equal(shouldShowBackToTop({ scrollY: 400, viewportWidth: 390 }), false);
  assert.equal(shouldShowBackToTop({ scrollY: 401, viewportWidth: 390 }), true);

  assert.equal(shouldShowBackToTop({ scrollY: 560, viewportWidth: 1440 }), false);
  assert.equal(shouldShowBackToTop({ scrollY: 561, viewportWidth: 1440 }), true);

  assert.equal(shouldShowBackToTop({ scrollY: -20, viewportWidth: 390 }), false);
  assert.equal(shouldShowBackToTop({ scrollY: Number.NaN, viewportWidth: 1440 }), false);
});
