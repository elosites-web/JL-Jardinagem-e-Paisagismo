import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COMPANY } from './company';
import { LEGAL_DOCUMENTS } from '../data/legalDocs';

test('COMPANY centralizes official and provisional corporate data cleanly', () => {
  assert.equal(COMPANY.entityType, 'Pessoa Jurídica');
  assert.equal(COMPANY.tradeName, 'JL Jardinagem e Paisagismo');
  assert.equal(COMPANY.legalName.value, 'a confirmar');
  assert.equal(COMPANY.legalName.confirmed, false);
  assert.equal(COMPANY.cnpj.value, '00.000.000/0000-00');
  assert.equal(COMPANY.cnpj.confirmed, false);
  assert.equal(COMPANY.email.value, 'contato@jl-jardinagem.example');
  assert.equal(COMPANY.email.confirmed, false);
  assert.equal(COMPANY.whatsapp.display, '(11) 95106-2408');
  assert.equal(COMPANY.serviceArea, 'Jundiaí e região — SP');
  assert.equal(COMPANY.instagram.url, 'https://www.instagram.com/juliojardinagemepaisagismo/');
});

test('Legal documents reference provisional CNPJ, legal name, and provisional email consistently', () => {
  for (const docKey of ['terms', 'privacy', 'cookies'] as const) {
    const joined = LEGAL_DOCUMENTS[docKey].sections
      .flatMap((s) => s.paragraphs)
      .join(' ');
    assert.match(joined, /00\.000\.000\/0000-00/);
    assert.match(joined, /a confirmar/i);
    assert.match(joined, /contato@jl-jardinagem\.example/);
    assert.match(joined, /\(11\) 95106-2408/);
    assert.match(joined, /provisóri/i);
  }
});

test('index.html retains noindex,nofollow and excludes unconfirmed provisional fields from JSON-LD', () => {
  const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
  assert.match(html, /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/>/);

  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ldMatch, 'JSON-LD script should exist in index.html');
  const jsonLd = ldMatch[1];

  assert.doesNotMatch(jsonLd, /00\.000\.000\/0000-00/);
  assert.doesNotMatch(jsonLd, /contato@jl-jardinagem\.example/);
  assert.doesNotMatch(jsonLd, /a confirmar/i);
  assert.match(jsonLd, /"name": "JL Jardinagem e Paisagismo"/);
  assert.match(jsonLd, /"telephone": "\+55-11-95106-2408"/);
});
