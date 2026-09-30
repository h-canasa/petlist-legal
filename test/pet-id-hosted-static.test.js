'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const p = path.join(root, 'p');
const indexHtml = fs.readFileSync(path.join(p, 'index.html'), 'utf8');
const mainJs = fs.readFileSync(path.join(p, 'main.js'), 'utf8');
const viewJs = fs.readFileSync(path.join(p, 'view.js'), 'utf8');
const css = fs.readFileSync(path.join(p, 'finder.css'), 'utf8');

test('production Finder lives at /p/ with a branded loading shell and approved wordmark', () => {
  assert.match(indexHtml, /assets\/marketing\/petlist-wordmark\.png/);
  assert.match(indexHtml, /data-state="loading"/);
  assert.match(indexHtml, /aria-busy="true"/);
  assert.match(indexHtml, /pet-id-card/);
  assert.match(indexHtml, /<meta name="referrer" content="no-referrer">/);
});

test('document title stays generic and hosted values are never written into browser metadata', () => {
  assert.match(indexHtml, /<title>Pet ID · PetList<\/title>/);
  assert.doesNotMatch(mainJs, /document\.title/);
});

test('wordmark declarations match the approved PNG intrinsic dimensions', () => {
  const png = fs.readFileSync(path.join(root, 'assets', 'marketing', 'petlist-wordmark.png'));
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1560, 384]);
  assert.match(indexHtml, /petlist-wordmark\.png[^>]*width="1560" height="384"/);
  assert.match(mainJs, /wordmark\.width = 1560;/);
  assert.match(mainJs, /wordmark\.height = 384;/);
});

test('the shipped source contains the locked unavailable and retry states', () => {
  assert.match(viewJs, /This Pet ID isn't available\./);
  assert.match(viewJs, /Check the link or ask the pet's owner for an updated Pet ID\./);
  assert.match(viewJs, /Couldn't load this Pet ID\./);
  assert.match(viewJs, /Check your connection and try again\./);
  assert.match(viewJs, /Try Again/);
});

test('Finder source has no unsafe or prohibited architecture', () => {
  const source = fs.readdirSync(p).filter((name) => /\.(html|js|css)$/.test(name))
    .map((name) => fs.readFileSync(path.join(p, name), 'utf8')).join('\n');
  assert.doesNotMatch(source, /\.innerHTML/);
  assert.doesNotMatch(source, /\beval\s*\(|new Function\s*\(/);
  assert.doesNotMatch(source, /firebase-(app|auth|firestore|storage)|initializeApp|signIn|appCheck/i);
  assert.doesNotMatch(source, /analytics|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie/i);
  assert.doesNotMatch(source, /documents:runQuery|listDocuments|\/documents\/petIdPublic(?:\?|['"`])/);
  assert.doesNotMatch(source, /\bbreed\b|\bspecies\b/i);
  assert.doesNotMatch(source, /#v1|payload\.js|sentences\.js/);
});

test('legacy fragment Finder production files are removed', () => {
  assert.equal(fs.existsSync(path.join(root, 'pet-id')), false);
});

test('thumbnail failure removes only the image so the always-present paw fallback is revealed', () => {
  assert.match(mainJs, /frame\.append\(paw\(\)\)/);
  assert.match(mainJs, /addEventListener\('error'/);
});

test('responsive/accessibility CSS includes hit targets, focus, narrow layout, zoom-safe wrapping, and reduced motion', () => {
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*360px\)/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('loading has no forced near-viewport card height and outer gutters honor every safe area inset', () => {
  assert.doesNotMatch(css, /pet-id-card\[data-state="loading"\][^{]*\{[^}]*min-height/s);
  assert.doesNotMatch(css, /min\(760px|100dvh\s*-\s*40px/);
  for (const side of ['top', 'right', 'bottom', 'left']) {
    assert.match(css, new RegExp(`env\\(safe-area-inset-${side}`));
  }
});
