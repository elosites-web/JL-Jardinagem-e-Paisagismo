import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSvgParallaxOffset } from './cursorParallax.ts';

test('computeSvgParallaxOffset returns zero offset at exact viewport center', () => {
  assert.deepEqual(
    computeSvgParallaxOffset({
      clientX: 720,
      clientY: 450,
      viewportWidth: 1440,
      viewportHeight: 900,
    }),
    { x: 0, y: 0 },
  );
});

test('computeSvgParallaxOffset computes subtle opposite-direction shift across corners and clamps extremes', () => {
  assert.deepEqual(
    computeSvgParallaxOffset({
      clientX: 0,
      clientY: 0,
      viewportWidth: 1440,
      viewportHeight: 900,
      maxShiftX: 8,
      maxShiftY: 3.5,
    }),
    { x: 8, y: 3.5 },
  );

  assert.deepEqual(
    computeSvgParallaxOffset({
      clientX: 2000,
      clientY: 1200,
      viewportWidth: 1440,
      viewportHeight: 900,
      maxShiftX: 8,
      maxShiftY: 3.5,
    }),
    { x: -8, y: -3.5 },
  );
});

test('computeSvgParallaxOffset guards invalid or zero viewport dimensions cleanly', () => {
  assert.deepEqual(
    computeSvgParallaxOffset({
      clientX: 300,
      clientY: 200,
      viewportWidth: 0,
      viewportHeight: 900,
    }),
    { x: 0, y: 0 },
  );

  assert.deepEqual(
    computeSvgParallaxOffset({
      clientX: Number.NaN,
      clientY: 200,
      viewportWidth: 1440,
      viewportHeight: 900,
    }),
    { x: 0, y: 0 },
  );
});
