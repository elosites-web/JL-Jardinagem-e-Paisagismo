import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scrollRevealDirectiveProps,
  shouldRevealOnIntersect,
  shouldRevealOnMount,
} from './scrollReveal.ts';

test('shouldRevealOnMount reveals immediately for reduced motion or missing IntersectionObserver', () => {
  assert.equal(
    shouldRevealOnMount({
      rectTop: 1800,
      viewportHeight: 900,
      hasIntersectionObserver: true,
      reducedMotion: true,
    }),
    true,
  );

  assert.equal(
    shouldRevealOnMount({
      rectTop: 1800,
      viewportHeight: 900,
      hasIntersectionObserver: false,
      reducedMotion: false,
    }),
    true,
  );
});

test('shouldRevealOnMount reveals elements already in or above initial viewport, keeping below-fold hidden', () => {
  assert.equal(
    shouldRevealOnMount({
      rectTop: 680,
      viewportHeight: 900,
      hasIntersectionObserver: true,
      reducedMotion: false,
    }),
    true,
  );

  assert.equal(
    shouldRevealOnMount({
      rectTop: -200,
      viewportHeight: 900,
      hasIntersectionObserver: true,
      reducedMotion: false,
    }),
    true,
  );

  assert.equal(
    shouldRevealOnMount({
      rectTop: 1200,
      viewportHeight: 900,
      hasIntersectionObserver: true,
      reducedMotion: false,
    }),
    false,
  );
});

test('shouldRevealOnIntersect triggers on viewport entry or when element sits above root bottom', () => {
  assert.equal(
    shouldRevealOnIntersect({
      isIntersecting: true,
      boundingClientRectTop: 720,
      rootBoundsBottom: 850,
      viewportHeight: 900,
    }),
    true,
  );

  assert.equal(
    shouldRevealOnIntersect({
      isIntersecting: false,
      boundingClientRectTop: -120,
      rootBoundsBottom: 850,
      viewportHeight: 900,
    }),
    true,
  );

  assert.equal(
    shouldRevealOnIntersect({
      isIntersecting: false,
      boundingClientRectTop: 1120,
      rootBoundsBottom: 850,
      viewportHeight: 900,
    }),
    false,
  );
});

test('scrollRevealDirectiveProps builds expected data attribute and classes without inline styles', () => {
  assert.deepEqual(scrollRevealDirectiveProps(), {
    'data-scroll-reveal': 'hidden',
    className: 'scroll-reveal',
  });

  assert.deepEqual(scrollRevealDirectiveProps(120), {
    'data-scroll-reveal': 'hidden',
    className: 'scroll-reveal scroll-reveal-delay-120',
  });
});
