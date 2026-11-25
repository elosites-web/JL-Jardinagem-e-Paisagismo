import test from 'node:test';
import assert from 'node:assert/strict';
import { computeScrollParallaxOffset } from './scrollParallax.ts';

test('computeScrollParallaxOffset returns 0 when element is centered in the viewport', () => {
  assert.equal(
    computeScrollParallaxOffset({
      rectTop: 250,
      rectHeight: 400,
      viewportHeight: 900,
      amplitudePx: 14,
      scale: 1.08,
    }),
    0,
  );
});

test('computeScrollParallaxOffset shifts smoothly opposite to scroll direction and clamps extremes', () => {
  // Element far below viewport -> normalized = +1 -> offset = -amplitude
  assert.equal(
    computeScrollParallaxOffset({
      rectTop: 1100,
      rectHeight: 400,
      viewportHeight: 900,
      amplitudePx: 14,
      scale: 1.08,
    }),
    -14,
  );

  // Element far above viewport -> normalized = -1 -> offset = +amplitude
  assert.equal(
    computeScrollParallaxOffset({
      rectTop: -600,
      rectHeight: 400,
      viewportHeight: 900,
      amplitudePx: 14,
      scale: 1.08,
    }),
    14,
  );
});

test('computeScrollParallaxOffset clamps shift to safe scaled image headroom on compact viewports', () => {
  // rectHeight = 200, scale = 1.08 -> total extra = 16px -> 8px per side -> 7.5px max safe shift
  assert.equal(
    computeScrollParallaxOffset({
      rectTop: 1200,
      rectHeight: 200,
      viewportHeight: 844,
      amplitudePx: 14,
      scale: 1.08,
    }),
    -7.5,
  );
});

test('computeScrollParallaxOffset allows unscaled icon offsets and guards invalid dimensions', () => {
  assert.equal(
    computeScrollParallaxOffset({
      rectTop: 950,
      rectHeight: 24,
      viewportHeight: 900,
      amplitudePx: 3.5,
    }),
    -3.5,
  );

  assert.equal(
    computeScrollParallaxOffset({
      rectTop: 100,
      rectHeight: 0,
      viewportHeight: 900,
      amplitudePx: 12,
    }),
    0,
  );

  assert.equal(
    computeScrollParallaxOffset({
      rectTop: Number.NaN,
      rectHeight: 300,
      viewportHeight: 900,
      amplitudePx: 12,
    }),
    0,
  );
});
