import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCoverflowRevealDelay,
  getFooterListItemRevealDelay,
  getGalleryGridRevealDelay,
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

  assert.deepEqual(scrollRevealDirectiveProps(240), {
    'data-scroll-reveal': 'hidden',
    className: 'scroll-reveal scroll-reveal-delay-240',
  });

  assert.deepEqual(scrollRevealDirectiveProps(320), {
    'data-scroll-reveal': 'hidden',
    className: 'scroll-reveal scroll-reveal-delay-320',
  });

  assert.deepEqual(scrollRevealDirectiveProps(360), {
    'data-scroll-reveal': 'hidden',
    className: 'scroll-reveal scroll-reveal-delay-360',
  });
});

test('getCoverflowRevealDelay staggers outward from center card', () => {
  assert.equal(getCoverflowRevealDelay(0), undefined);
  assert.equal(getCoverflowRevealDelay(1), 80);
  assert.equal(getCoverflowRevealDelay(2), 160);
  assert.equal(getCoverflowRevealDelay(3), 240);
  assert.equal(getCoverflowRevealDelay(5), 240);
});

test('getGalleryGridRevealDelay cycles cleanly across 5 grid columns', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5, 6].map((idx) => getGalleryGridRevealDelay(idx)),
    [undefined, 80, 160, 240, 320, undefined, 80],
  );
});

test('getFooterListItemRevealDelay staggers progressively and clamps at 360ms', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5].map((idx) => getFooterListItemRevealDelay(idx)),
    [80, 160, 240, 320, 360, 360],
  );
});
