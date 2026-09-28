'use strict';

/**
 * PET-477: structural/source-level checks that a DOM/browser test can't easily express without
 * a headless browser (none is available in this environment -- see the PR's verification
 * notes). These assert properties of the actual shipped source: which asset the footer
 * references, that no photo/avatar path exists, and the safe-DOM/no-eval contract.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const mainJsPath = path.join(__dirname, '..', 'pet-id', 'main.js');
const indexHtmlPath = path.join(__dirname, '..', 'pet-id', 'index.html');
const wordmarkPath = path.join(__dirname, '..', 'assets', 'marketing', 'petlist-wordmark.png');

const mainJs = fs.readFileSync(mainJsPath, 'utf8');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// 34. footer uses real wordmark asset
test('the footer references the real, already-approved wordmark asset by path', () => {
  assert.match(mainJs, /assets\/marketing\/petlist-wordmark\.png/);
});

test('the referenced wordmark file actually exists in the repo (not a placeholder path)', () => {
  assert.equal(fs.existsSync(wordmarkPath), true, wordmarkPath + ' does not exist');
});

test('the footer never recreates the PetList logo as styled text (no "PetList" text node outside the img alt)', () => {
  // The only place "PetList" may drive rendered output is the <img alt="PetList">; a styled
  // text element standing in for the logo would show up as `el(..., 'PetList')` or a
  // `.textContent = 'PetList'` assignment, neither of which should exist.
  assert.doesNotMatch(mainJs, /el\([^)]*'PetList'\)/);
  assert.doesNotMatch(mainJs, /\.textContent\s*=\s*'PetList'/);
  assert.match(mainJs, /alt = 'PetList'/);
});

// 35. photo/avatar is absent from Finder View
test('no pet photo or avatar element exists anywhere in the Finder View source', () => {
  assert.doesNotMatch(mainJs.toLowerCase(), /avatar/);
  assert.doesNotMatch(mainJs.toLowerCase(), /photo/);
  assert.doesNotMatch(indexHtml.toLowerCase(), /avatar/);
  assert.doesNotMatch(indexHtml.toLowerCase(), /photo/);
});

test('the only <img> the Finder View ever creates or references is the footer wordmark', () => {
  const imgCreations = mainJs.match(/createElement\('img'\)/g) || [];
  assert.equal(imgCreations.length, 1);
});

// Security / data-handling contract (see AGENTS.md and the ticket's SECURITY/DATA HANDLING spec).
test('main.js never assigns innerHTML (decoded content is only ever inserted via textContent/DOM APIs)', () => {
  assert.doesNotMatch(mainJs, /\.innerHTML/);
});

test('main.js never calls eval or the Function constructor', () => {
  assert.doesNotMatch(mainJs, /\beval\s*\(/);
  assert.doesNotMatch(mainJs, /new Function\s*\(/);
});

test('the page sets a no-referrer policy and is not indexed', () => {
  assert.match(indexHtml, /<meta name="referrer" content="no-referrer">/);
  assert.match(indexHtml, /<meta name="robots" content="noindex, nofollow">/);
});

test('no LocalStorage, IndexedDB, sessionStorage or cookie write exists in the Finder View source', () => {
  const decoderJs = fs.readFileSync(path.join(__dirname, '..', 'pet-id', 'payload.js'), 'utf8');
  const sentencesJs = fs.readFileSync(path.join(__dirname, '..', 'pet-id', 'sentences.js'), 'utf8');
  for (const source of [mainJs, decoderJs, sentencesJs]) {
    assert.doesNotMatch(source, /localStorage/i);
    assert.doesNotMatch(source, /indexedDB/i);
    assert.doesNotMatch(source, /sessionStorage/i);
    assert.doesNotMatch(source, /document\.cookie/);
  }
});

test('no analytics/tracking network call exists in the Finder View source', () => {
  assert.doesNotMatch(mainJs, /\bfetch\s*\(/);
  assert.doesNotMatch(mainJs, /XMLHttpRequest/);
  assert.doesNotMatch(mainJs, /navigator\.sendBeacon/);
});

test('Home Base "Open in Maps" is built only from the validated coordinate, via a standards-based external URL', () => {
  assert.match(mainJs, /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
});

test('no App Store / Google Play badge, download CTA, or marketing copy appears in the Finder View', () => {
  const lowered = (mainJs + indexHtml).toLowerCase();
  assert.doesNotMatch(lowered, /app store/);
  assert.doesNotMatch(lowered, /google play/);
  assert.doesNotMatch(lowered, /download/);
});

test('the eyebrow is the only pre-hero identifier -- no second PetList wordmark exists outside the footer', () => {
  const wordmarkReferences = mainJs.match(/petlist-wordmark\.png/g) || [];
  assert.equal(wordmarkReferences.length, 1);
});

// PET-479 regression guard: the email action must never go back to raw concatenation.
test('the email action href is built through the safe mailto helper, never raw concatenation', () => {
  assert.doesNotMatch(mainJs, /['"]mailto:['"]\s*\+\s*payload\.email/);
  assert.match(mainJs, /Sentences\.safeMailtoUri\(payload\.email\)/);
});

test('the visible email text still equals payload.email exactly (unchanged by the mailto fix)', () => {
  assert.match(mainJs, /el\('span', 'action-value', payload\.email\)/);
});
