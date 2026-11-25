import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_CONFIG } from '../config/siteConfig.ts';
import {
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_TYPE,
  OG_IMAGE_URL,
  OG_IMAGE_WIDTH,
  SITE_ORIGIN,
  SITE_URL,
  normalizeHttpsSiteOrigin,
  resolveOgImageUrl,
} from './seoUrl.ts';

test('centralized SEO configuration matches official Netlify deploy URL and OG image path', () => {
  assert.equal(SITE_ORIGIN, 'https://jljardinagem.netlify.app');
  assert.equal(SITE_URL, 'https://jljardinagem.netlify.app/');
  assert.equal(
    OG_IMAGE_URL,
    'https://jljardinagem.netlify.app/images/og-jl-jardinagem-paisagismo.jpg',
  );
  assert.equal(SITE_CONFIG.seo.siteUrl, SITE_URL);
  assert.equal(SITE_CONFIG.seo.siteOrigin, SITE_ORIGIN);
  assert.equal(SITE_CONFIG.seo.ogImage.url, OG_IMAGE_URL);
  assert.equal(SITE_CONFIG.seo.ogImage.type, OG_IMAGE_TYPE);
  assert.equal(SITE_CONFIG.seo.ogImage.width, OG_IMAGE_WIDTH);
  assert.equal(SITE_CONFIG.seo.ogImage.height, OG_IMAGE_HEIGHT);
  assert.equal(SITE_CONFIG.seo.ogImage.alt, OG_IMAGE_ALT);
});

test('normalizeHttpsSiteOrigin and resolveOgImageUrl handle defaults and explicit URLs', () => {
  assert.equal(normalizeHttpsSiteOrigin(), SITE_ORIGIN);
  assert.equal(normalizeHttpsSiteOrigin(''), '');
  assert.equal(normalizeHttpsSiteOrigin('not-a-valid-url'), '');
  assert.equal(resolveOgImageUrl(), OG_IMAGE_URL);
  assert.equal(resolveOgImageUrl(''), OG_IMAGE_PATH);
});

test('index.html contains all required static Open Graph and Twitter metadata without duplicates', () => {
  const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');

  assert.match(html, new RegExp(`<meta property="og:url" content="${SITE_URL}" \\/>`));
  assert.match(html, new RegExp(`<meta property="og:image" content="${OG_IMAGE_URL}" \\/>`));
  assert.match(
    html,
    new RegExp(`<meta property="og:image:secure_url" content="${OG_IMAGE_URL}" \\/>`),
  );
  assert.match(html, new RegExp(`<meta property="og:image:type" content="${OG_IMAGE_TYPE}" \\/>`));
  assert.match(html, new RegExp(`<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" \\/>`));
  assert.match(
    html,
    new RegExp(`<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" \\/>`),
  );
  assert.match(html, new RegExp(`<meta name="twitter:image" content="${OG_IMAGE_URL}" \\/>`));
  assert.ok(html.includes(`<meta\n      property="og:image:alt"\n      content="${OG_IMAGE_ALT}"\n    />`));
  assert.ok(html.includes(`<meta\n      name="twitter:image:alt"\n      content="${OG_IMAGE_ALT}"\n    />`));
  assert.match(html, /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/>/);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(html, /<link rel="icon" href="\/favicon\.ico" sizes="any" \/>/);

  const metaPropertyMatches = [...html.matchAll(/<meta[^>]*\sproperty="([^"]+)"/g)].map((m) => m[1]);
  const metaNameMatches = [...html.matchAll(/<meta[^>]*\sname="([^"]+)"/g)].map((m) => m[1]);

  assert.equal(new Set(metaPropertyMatches).size, metaPropertyMatches.length, 'Duplicate og:* meta tags found');
  assert.equal(new Set(metaNameMatches).size, metaNameMatches.length, 'Duplicate named meta tags found');

  const assetFile = path.resolve(process.cwd(), 'public', OG_IMAGE_PATH.slice(1));
  assert.equal(fs.existsSync(assetFile), true);
  assert.ok(fs.statSync(assetFile).size > 0);
});
