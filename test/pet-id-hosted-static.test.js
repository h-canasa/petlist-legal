'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const p = path.join(root, 'p');

test('production Finder lives at /p/ with a branded loading shell and approved wordmark', () => {
  const html = fs.readFileSync(path.join(p, 'index.html'), 'utf8');
  assert.match(html, /assets\/marketing\/petlist-wordmark\.png/);
  assert.match(html, /data-state="loading"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /pet-id-card/);
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
});

test('the shipped source contains the locked unavailable and retry states', () => {
  const main = fs.readFileSync(path.join(p, 'main.js'), 'utf8');
  assert.match(main, /This Pet ID isn't available\./);
  assert.match(main, /Check the link or ask the pet's owner for an updated Pet ID\./);
  assert.match(main, /Couldn't load this Pet ID\./);
  assert.match(main, /Check your connection and try again\./);
  assert.match(main, /Try Again/);
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
  const main = fs.readFileSync(path.join(p, 'main.js'), 'utf8');
  assert.match(main, /frame\.append\(paw\(\)\)/);
  assert.match(main, /addEventListener\('error', \(\) => image\.remove\(\)/);
});

test('responsive/accessibility CSS includes hit targets, focus, narrow layout, zoom-safe wrapping, and reduced motion', () => {
  const css = fs.readFileSync(path.join(p, 'finder.css'), 'utf8');
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*360px\)/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
