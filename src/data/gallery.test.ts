import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { FEATURED_GALLERY_PHOTOS, FEATURED_ORDER, GALLERY_PHOTOS } from './gallery.ts';

test('GALLERY_PHOTOS contains 35 unique entries with existing WebP assets and valid thumbnails', () => {
  assert.equal(GALLERY_PHOTOS.length, 35);
  assert.equal(
    GALLERY_PHOTOS.some((photo) => photo.id === 7 || /escultura/i.test(photo.alt)),
    false,
  );

  const ids = new Set<number>();
  const srcs = new Set<string>();
  const thumbs = new Set<string>();

  for (const photo of GALLERY_PHOTOS) {
    assert.equal(ids.has(photo.id), false, `Duplicate photo id: ${photo.id}`);
    assert.equal(srcs.has(photo.src), false, `Duplicate photo src: ${photo.src}`);
    assert.equal(thumbs.has(photo.thumb), false, `Duplicate photo thumb: ${photo.thumb}`);
    ids.add(photo.id);
    srcs.add(photo.src);
    thumbs.add(photo.thumb);

    assert.match(photo.src, /^\/images\/galeria\/[a-z0-9-]+\.webp$/);
    assert.match(photo.thumb, /^\/images\/galeria\/thumbs\/[a-z0-9-]+\.webp$/);
    assert.ok(photo.thumbWidth <= 480 && photo.thumbHeight <= 480, `Thumbnail exceeds 480px for id ${photo.id}`);

    const publicSrc = path.join(process.cwd(), 'public', photo.src.replace(/^\//, ''));
    const publicThumb = path.join(process.cwd(), 'public', photo.thumb.replace(/^\//, ''));
    assert.equal(fs.existsSync(publicSrc), true, `Missing image file: ${publicSrc}`);
    assert.equal(fs.existsSync(publicThumb), true, `Missing thumb file: ${publicThumb}`);
  }
});

test('Six newly added photos are flagged aiEnhanced and interleaved without consecutive clustering', () => {
  const aiPhotos = GALLERY_PHOTOS.filter((photo) => photo.aiEnhanced === true);
  assert.equal(aiPhotos.length, 6);

  const indices = GALLERY_PHOTOS.map((photo, index) => (photo.aiEnhanced ? index : -1)).filter(
    (index) => index !== -1,
  );
  for (let i = 1; i < indices.length; i++) {
    assert.ok(
      indices[i] - indices[i - 1] >= 3,
      `AI-enhanced photos placed too close together at indices ${indices[i - 1]} and ${indices[i]}`,
    );
  }
});

test('FEATURED_GALLERY_PHOTOS resolves every entry in FEATURED_ORDER', () => {
  assert.equal(FEATURED_GALLERY_PHOTOS.length, FEATURED_ORDER.length);
  assert.equal(new Set(FEATURED_ORDER).size, FEATURED_ORDER.length);
});
