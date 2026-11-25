import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAlignedScrollTop,
  computeScrollShortfall,
  extractInternalAnchorId,
} from './anchorNavigation';

test('extractInternalAnchorId resolves fragment hashes and rejects external or empty URLs', () => {
  assert.equal(extractInternalAnchorId('#servicos'), 'servicos');
  assert.equal(extractInternalAnchorId('  #como-funciona '), 'como-funciona');
  assert.equal(
    extractInternalAnchorId('https://example.com/#contato', 'https://example.com', '/'),
    'contato',
  );
  assert.equal(
    extractInternalAnchorId('https://wa.me/5511951062408', 'https://example.com', '/'),
    null,
  );
  assert.equal(extractInternalAnchorId('#'), null);
  assert.equal(extractInternalAnchorId(null), null);
});

test('computeAlignedScrollTop aligns section top precisely to header bottom', () => {
  // Section at y=1457 in document, header bottom at 77px -> scrollY = 1380
  assert.equal(
    computeAlignedScrollTop({
      elementTopInViewport: 1457,
      currentScrollY: 0,
      headerBottom: 77,
      maxScrollY: 7772,
    }),
    1380,
  );

  // Scrolling upwards when already scrolled past target
  assert.equal(
    computeAlignedScrollTop({
      elementTopInViewport: -1200,
      currentScrollY: 2657,
      headerBottom: 77,
      maxScrollY: 7772,
    }),
    1380,
  );

  // Hero starting at top of document (y=0) returns 0
  assert.equal(
    computeAlignedScrollTop({
      elementTopInViewport: -500,
      currentScrollY: 500,
      headerBottom: 77,
      maxScrollY: 7772,
    }),
    0,
  );
});

test('computeAlignedScrollTop clamps safely to maxScrollY', () => {
  assert.equal(
    computeAlignedScrollTop({
      elementTopInViewport: 7476,
      currentScrollY: 0,
      headerBottom: 77,
      maxScrollY: 7200,
    }),
    7200,
  );
});

test('computeScrollShortfall returns 0 when footer provides sufficient scroll room and exact pixels when short', () => {
  // Sufficient room (e.g. contato at 7476, scrollHeight 8672, viewport 1080, header 77)
  assert.equal(
    computeScrollShortfall({
      elementTopInViewport: 7476,
      currentScrollY: 0,
      headerBottom: 77,
      scrollHeight: 8672,
      viewportHeight: 1080,
    }),
    0,
  );

  // Shortfall case: desired scrollY = 7476 - 77 = 7399, maxScrollY = 8200 - 1080 = 7120 -> shortfall = 279
  assert.equal(
    computeScrollShortfall({
      elementTopInViewport: 7476,
      currentScrollY: 0,
      headerBottom: 77,
      scrollHeight: 8200,
      viewportHeight: 1080,
    }),
    279,
  );
});
