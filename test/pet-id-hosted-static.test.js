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

test('static loading wordmark is the sole same-tab PetList navigation link', () => {
  const link = indexHtml.match(/<a class="wordmark-link"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
  assert.match(link, /href="https:\/\/mypetlist\.app\/"/);
  assert.match(link, /petlist-wordmark\.png[^>]*width="1560" height="384"/);
  assert.doesNotMatch(link, /target=/);
});

test('dynamic header links the approved intrinsic-size wordmark in the same tab', () => {
  assert.match(mainJs, /document\.createElement\('a'\)/);
  assert.match(mainJs, /wordmarkLink\.href = 'https:\/\/mypetlist\.app\/';/);
  assert.match(mainJs, /wordmarkLink\.append\(wordmark\)/);
  assert.match(mainJs, /wordmark\.width = 1560;/);
  assert.match(mainJs, /wordmark\.height = 384;/);
  assert.doesNotMatch(mainJs, /wordmarkLink\.target/);
});

test('text footer markup, render path, and footer-only CSS are fully removed', () => {
  assert.doesNotMatch(indexHtml, /card-footer|footer-dot|>mypetlist\.app</);
  assert.doesNotMatch(mainJs, /function footer\s*\(|card-footer|footer-dot|>mypetlist\.app</);
  assert.doesNotMatch(css, /\.card-footer|\.footer-dot/);
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
  assert.match(css, /\.wordmark-link\s*\{[^}]*min-height:\s*44px/s);
  assert.match(css, /\.wordmark\s*\{[^}]*width:\s*124px/s);
  assert.match(css, /@media\s*\(max-width:\s*360px\)/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('normal recovery separators remain while the final section ends without a floating divider', () => {
  assert.match(css, /\.recovery-section\s*\{[^}]*border-bottom:\s*1px solid var\(--border\)/s);
  assert.match(css, /\.recovery-section:last-child\s*\{[^}]*border-bottom:\s*0/s);
});

test('loading has no forced near-viewport card height and outer gutters honor every safe area inset', () => {
  assert.doesNotMatch(css, /pet-id-card\[data-state="loading"\][^{]*\{[^}]*min-height/s);
  assert.doesNotMatch(css, /min\(760px|100dvh\s*-\s*40px/);
  for (const side of ['top', 'right', 'bottom', 'left']) {
    assert.match(css, new RegExp(`env\\(safe-area-inset-${side}`));
  }
});

const fontDir = path.join(p, 'assets', 'fonts');
const finderSources = () => fs.readdirSync(p).filter((name) => /\.(html|js|css)$/.test(name))
  .map((name) => ({ name, text: fs.readFileSync(path.join(p, name), 'utf8') }));

function parseCsp() {
  const metas = [...indexHtml.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0])
    .filter((tag) => /http-equiv\s*=\s*["']?Content-Security-Policy["']?/i.test(tag));
  assert.equal(metas.length, 1, 'exactly one meta CSP is expected');
  const content = metas[0].match(/\bcontent\s*=\s*"([^"]*)"/i)?.[1];
  assert.ok(content, 'CSP meta must carry a double-quoted content attribute');
  const directives = new Map();
  for (const part of content.split(';')) {
    const [name, ...sources] = part.trim().split(/\s+/);
    if (!name) continue;
    assert.equal(directives.has(name), false, `duplicate directive ${name}`);
    directives.set(name.toLowerCase(), sources);
  }
  return { content, directives, tag: metas[0] };
}

test('Finder makes no third-party font requests', () => {
  for (const { name, text } of finderSources()) {
    assert.doesNotMatch(text, /fonts\.googleapis\.com|fonts\.gstatic\.com/i, name);
    assert.doesNotMatch(text, /typekit|use\.fontawesome|fonts\.bunny|cdn\.jsdelivr|cdnjs|unpkg|fontshare|fonts\.adobe/i, name);
  }
  assert.doesNotMatch(indexHtml, /rel=["']?(preconnect|dns-prefetch|preload|prefetch)/i);
  assert.doesNotMatch(indexHtml, /<link\b[^>]*href="https?:/i);
});

test('required Fraunces and Inter fonts are first-party WOFF2 assets declared in finder.css', () => {
  const files = fs.existsSync(fontDir) ? fs.readdirSync(fontDir) : [];
  assert.ok(files.some((f) => /\.woff2$/.test(f)), 'p/assets/fonts must contain woff2 files');
  const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
  assert.ok(faces.length >= 2, 'expected local @font-face declarations');
  const families = new Set();
  for (const face of faces) {
    const family = face.match(/font-family:\s*["']?([^;"']+)["']?/)?.[1].trim();
    families.add(family);
    assert.match(face, /font-display:\s*swap/);
    const urls = [...face.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
    assert.ok(urls.length > 0);
    for (const url of urls) {
      assert.match(url, /^assets\/fonts\/[A-Za-z0-9._-]+\.woff2$/, 'font url must be relative and Finder-owned');
      assert.ok(fs.existsSync(path.join(p, url)), `${url} must exist`);
      assert.equal(fs.readFileSync(path.join(p, url)).subarray(0, 4).toString('latin1'), 'wOF2');
    }
    assert.match(face, /format\(\s*["']woff2["']\s*\)/);
  }
  assert.deepEqual([...families].sort(), ['Fraunces', 'Inter']);
  assert.match(css, /font-family:\s*Inter,\s*system-ui,\s*-apple-system,\s*BlinkMacSystemFont,\s*"Segoe UI",\s*sans-serif/);
  assert.match(css, /font-family:\s*Fraunces,\s*Georgia,\s*serif/);
  const weightsOf = (family) => faces
    .filter((face) => new RegExp(`font-family:\\s*${family}\\s*;`).test(face))
    .map((face) => face.match(/font-weight:\s*(\d+)\s*;/)?.[1]).sort();
  assert.deepEqual(weightsOf('Fraunces'), ['600']);
  assert.deepEqual(weightsOf('Inter'), ['400', '600', '700']);
});

test('font provenance and licenses ship beside the first-party font assets', () => {
  const files = fs.existsSync(fontDir) ? fs.readdirSync(fontDir) : [];
  assert.ok(files.some((f) => /license/i.test(f) && /fraunces/i.test(f)), 'Fraunces license');
  assert.ok(files.some((f) => /license/i.test(f) && /inter/i.test(f)), 'Inter license');
  assert.ok(files.includes('README.md'), 'provenance README');
});

test('meta CSP is declared once, parsed strictly, and bounds every Finder resource class', () => {
  const { directives } = parseCsp();
  const expected = {
    'default-src': ["'none'"],
    'script-src': ["'self'"],
    'style-src': ["'self'"],
    'font-src': ["'self'"],
    'connect-src': ['https://firestore.googleapis.com'],
    'img-src': ["'self'", 'https://firebasestorage.googleapis.com'],
    'object-src': ["'none'"],
    'base-uri': ["'none'"],
    'form-action': ["'none'"],
    'frame-src': ["'none'"],
    'media-src': ["'none'"],
    'worker-src': ["'none'"],
    'manifest-src': ["'none'"],
  };
  for (const [name, sources] of Object.entries(expected)) {
    assert.deepEqual([...(directives.get(name) ?? ['<missing>'])].sort(), [...sources].sort(), name);
  }
  assert.ok(directives.has('upgrade-insecure-requests'));
  assert.deepEqual(directives.get('upgrade-insecure-requests'), []);
});

test('meta CSP carries no wildcard, unsafe, data/blob/https-wide, Google Fonts or meta-ineffective directives', () => {
  const { content, directives } = parseCsp();
  assert.doesNotMatch(content, /\*/);
  assert.doesNotMatch(content, /unsafe-inline|unsafe-eval|unsafe-hashes|wasm-unsafe-eval/);
  assert.doesNotMatch(content, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  for (const [name, sources] of directives) {
    for (const source of sources) {
      assert.doesNotMatch(source, /^(https?:|data:|blob:|filesystem:|wss?:)$/i, `${name} ${source}`);
    }
  }
  for (const ineffective of ['frame-ancestors', 'sandbox', 'report-uri', 'report-to']) {
    assert.equal(directives.has(ineffective), false, `${ineffective} is ignored in a meta CSP`);
  }
});

test('meta CSP precedes every resource-bearing element in head', () => {
  const { tag } = parseCsp();
  const head = indexHtml.slice(indexHtml.indexOf('<head>'), indexHtml.indexOf('</head>'));
  const cspAt = head.indexOf(tag);
  assert.ok(cspAt > -1);
  const resources = [...head.matchAll(/<(link|script|img|style)\b/gi)];
  assert.ok(resources.length > 0);
  for (const r of resources) assert.ok(r.index > cspAt, `${r[0]} precedes the CSP`);
  assert.match(head, /<meta name="referrer" content="no-referrer">/);
});

test('Finder keeps no inline script/style and no inline event handlers that the CSP would forbid', () => {
  assert.doesNotMatch(indexHtml, /<style\b|\sstyle\s*=|\son[a-z]+\s*=|<script(?![^>]*\ssrc=)[^>]*>/i);
  assert.doesNotMatch(css, /url\(\s*["']?(data:|https?:)/i);
  assert.doesNotMatch(css, /@import/);
});

test('absolute HTTPS origins in Finder source stay within the resource and navigation contract', () => {
  const resourceOrigins = new Set(['https://firestore.googleapis.com', 'https://firebasestorage.googleapis.com']);
  const navigationOrigins = new Set(['https://mypetlist.app', 'https://www.google.com']);
  const { directives } = parseCsp();
  const cspOrigins = new Set([...directives.values()].flat().filter((s) => /^https:/.test(s)));
  assert.deepEqual([...cspOrigins].sort(), [...resourceOrigins].sort());
  const found = new Set();
  for (const { text } of finderSources()) {
    for (const m of text.matchAll(/https:\/\/[A-Za-z0-9.-]+/g)) found.add(m[0]);
  }
  for (const origin of found) {
    assert.ok(resourceOrigins.has(origin) || navigationOrigins.has(origin), `unexpected origin ${origin}`);
  }
  for (const nav of navigationOrigins) assert.equal(cspOrigins.has(nav), false, `${nav} is navigation-only`);
  assert.doesNotMatch(indexHtml.replace(parseCsp().tag, ''), /https:\/\/(?!mypetlist\.app\/)/);
});
