import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_TYPE,
  OG_IMAGE_WIDTH,
  injectOgImageUrlsIntoHtml,
  normalizeHttpsSiteOrigin,
  resolveOgImageUrl,
} from './seoUrl.ts';

test('normalizeHttpsSiteOrigin returns empty string when production domain is undefined or invalid', () => {
  assert.equal(normalizeHttpsSiteOrigin(undefined), '');
  assert.equal(normalizeHttpsSiteOrigin(''), '');
  assert.equal(normalizeHttpsSiteOrigin('   '), '');
  assert.equal(normalizeHttpsSiteOrigin('not-a-valid-url'), '');
});

test('normalizeHttpsSiteOrigin enforces HTTPS origin without trailing slash', () => {
  assert.equal(normalizeHttpsSiteOrigin('https://exemplo-deploy.com.br/'), 'https://exemplo-deploy.com.br');
  assert.equal(normalizeHttpsSiteOrigin('http://exemplo-deploy.com.br/subpath'), 'https://exemplo-deploy.com.br');
});

test('resolveOgImageUrl uses relative path while domain is pending and HTTPS URL when configured', () => {
  assert.equal(resolveOgImageUrl(undefined), OG_IMAGE_PATH);
  assert.equal(
    resolveOgImageUrl('https://exemplo-deploy.com.br/'),
    'https://exemplo-deploy.com.br/images/og-jl-jardinagem-paisagismo.jpg',
  );
});

test('injectOgImageUrlsIntoHtml updates og:image, og:image:secure_url, and twitter:image preserving all other tags', () => {
  const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
  const injected = injectOgImageUrlsIntoHtml(
    html,
    'https://exemplo-deploy.com.br/images/og-jl-jardinagem-paisagismo.jpg',
  );

  assert.match(
    injected,
    /<meta property="og:image" content="https:\/\/exemplo-deploy\.com\.br\/images\/og-jl-jardinagem-paisagismo\.jpg" \/>/,
  );
  assert.match(
    injected,
    /<meta property="og:image:secure_url" content="https:\/\/exemplo-deploy\.com\.br\/images\/og-jl-jardinagem-paisagismo\.jpg" \/>/,
  );
  assert.match(
    injected,
    /<meta name="twitter:image" content="https:\/\/exemplo-deploy\.com\.br\/images\/og-jl-jardinagem-paisagismo\.jpg" \/>/,
  );
  assert.match(injected, /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/>/);
});

test('index.html contains all required Open Graph and Twitter metadata referencing public/images/og-jl-jardinagem-paisagismo.jpg', () => {
  const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');

  assert.match(html, new RegExp(`<meta property="og:image" content="${OG_IMAGE_PATH}" \\/>`));
  assert.match(html, new RegExp(`<meta property="og:image:secure_url" content="${OG_IMAGE_PATH}" \\/>`));
  assert.match(html, new RegExp(`<meta property="og:image:type" content="${OG_IMAGE_TYPE}" \\/>`));
  assert.match(html, new RegExp(`<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" \\/>`));
  assert.match(html, new RegExp(`<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" \\/>`));
  assert.ok(html.includes(`content="${OG_IMAGE_ALT}"`), 'og:image:alt / twitter:image:alt should match');
  assert.match(html, new RegExp(`<meta name="twitter:image" content="${OG_IMAGE_PATH}" \\/>`));
  assert.match(html, /property="og:image:alt"/);
  assert.match(html, /name="twitter:image:alt"/);

  const assetFile = path.resolve(process.cwd(), 'public', OG_IMAGE_PATH.slice(1));
  assert.equal(fs.existsSync(assetFile), true);
  assert.ok(fs.statSync(assetFile).size > 0);
});
