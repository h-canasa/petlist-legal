'use strict';

// PET-646 L0: pins the production Finder's observable routing on mypetlist.app before any
// environment-aware change. The page's own scripts run in index.html order against a minimal
// DOM, so these assertions survive internal refactors and fail only if production behavior moves.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const p = path.join(root, 'p');
const indexHtml = fs.readFileSync(path.join(p, 'index.html'), 'utf8');

const PRODUCTION_HOST = 'mypetlist.app';
const PUBLIC_ID = 'AQEBAQEBAQEBAQEBAQEBAQ';
const VERSION = 'AgICAgICAgICAgICAgICAg';
const OTHER_ID = 'AwMDAwMDAwMDAwMDAwMDAw';
const PRODUCTION_DOCUMENT_URL =
  `https://firestore.googleapis.com/v1/projects/petlist-cad8b/databases/(default)/documents/petIdPublic/${PUBLIC_ID}`;
const PRODUCTION_FETCH_OPTIONS = { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } };
const PRODUCTION_THUMBNAIL_URL =
  `https://firebasestorage.googleapis.com/v0/b/petlist-cad8b.firebasestorage.app/o/pet-id-public%2F${PUBLIC_ID}%2F${VERSION}.jpg?alt=media`;

class FakeNode {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.listeners = {};
    this.parent = null;
    this.className = '';
    this.text = '';
    this.classList = { add: (name) => { this.className = `${this.className} ${name}`.trim(); } };
  }

  append(...nodes) {
    for (const node of nodes) {
      if (node instanceof FakeNode && node.tagName === '#fragment') {
        this.append(...node.children);
        node.children = [];
      } else if (node instanceof FakeNode) {
        node.parent = this;
        this.children.push(node);
      } else {
        const textNode = new FakeNode('#text');
        textNode.text = String(node);
        textNode.parent = this;
        this.children.push(textNode);
      }
    }
  }

  replaceChildren(...nodes) {
    this.children = [];
    this.append(...nodes);
  }

  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter((child) => child !== this);
    this.parent = null;
  }

  setAttribute(name, value) { this.attributes[name] = String(value); }

  removeAttribute(name) { delete this.attributes[name]; }

  addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener); }

  set textContent(value) {
    this.children = [];
    this.text = String(value);
  }

  get textContent() {
    return this.text + this.children.map((child) => child.textContent).join('');
  }

  *descendants() {
    for (const child of this.children) {
      yield child;
      yield* child.descendants();
    }
  }

  // Supports the class-list selectors main.js uses, e.g. '.message-state, .identity'.
  querySelector(selector) {
    const classes = selector.split(',').map((part) => part.trim().replace(/^\./, ''));
    for (const node of this.descendants()) {
      const own = node.className.split(/\s+/);
      if (classes.some((name) => own.includes(name))) return node;
    }
    return null;
  }
}

function scriptOrder() {
  return [...indexHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)].map((match) => match[1]);
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

// A reply description; openFinder turns it into a Response-like object whose JSON is parsed in the
// page's own realm, as a browser's response.json() would be (profile.js checks Object.prototype).
function response(status, body, { invalidJson = false } = {}) {
  return { status, body, invalidJson };
}

function firestoreValue(input) {
  if (typeof input === 'string') return { stringValue: input };
  if (typeof input === 'number') return { doubleValue: input };
  if (Array.isArray(input)) return { arrayValue: { values: input.map(firestoreValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(input).map(([key, entry]) => [key, firestoreValue(entry)])) } };
}

function firestoreDocument(profile) {
  return { fields: Object.fromEntries(Object.entries(profile).map(([key, entry]) => [key, firestoreValue(entry)])) };
}

async function openFinder({ search, respond }) {
  const requests = [];
  const pageRoot = new FakeNode('article');
  pageRoot.dataset.state = 'loading';
  const document = {
    querySelector: (selector) => (selector === '[data-pet-id-root]' ? pageRoot : null),
    createElement: (tagName) => new FakeNode(tagName),
    createElementNS: (_namespace, tagName) => new FakeNode(tagName),
    createDocumentFragment: () => new FakeNode('#fragment'),
  };
  const sandbox = {
    document,
    URLSearchParams,
    location: { hostname: PRODUCTION_HOST, search },
    fetch: async (...args) => {
      requests.push(args);
      const reply = respond(requests.length);
      return {
        ok: reply.status >= 200 && reply.status < 300,
        status: reply.status,
        json: async () => {
          if (reply.invalidJson) throw new SyntaxError('Unexpected token');
          return vm.runInContext(`JSON.parse(${JSON.stringify(JSON.stringify(reply.body))})`, sandbox);
        },
      };
    },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const src of scriptOrder()) {
    vm.runInContext(fs.readFileSync(path.join(p, src), 'utf8'), sandbox, { filename: src });
  }
  await settle();
  await settle();
  const nodes = () => [...pageRoot.descendants()];
  return {
    requests,
    state: () => pageRoot.dataset.state,
    images: () => nodes().filter((node) => node.tagName === 'img').map((node) => node.src),
    retry: async () => {
      const button = nodes().find((node) => node.tagName === 'button');
      assert.ok(button, 'a retry button is rendered');
      for (const listener of button.listeners.click) listener();
      await settle();
      await settle();
    },
  };
}

const VALID_PROFILE = {
  name: 'Mochi',
  phone: '+63 917 555 0142',
  thumbnail: { path: `pet-id-public/${PUBLIC_ID}/${VERSION}.jpg`, version: VERSION },
};

test('index.html loads exactly the four Finder scripts in dependency order', () => {
  assert.deepEqual(scriptOrder(), ['profile.js', 'load.js', 'view.js', 'main.js']);
});

test('production host: one exact petlist-cad8b Firestore GET with the existing options', async () => {
  const finder = await openFinder({
    search: `?id=${PUBLIC_ID}`,
    respond: () => response(200, firestoreDocument(VALID_PROFILE)),
  });
  assert.equal(finder.requests.length, 1);
  assert.equal(finder.requests[0][0], PRODUCTION_DOCUMENT_URL);
  assert.deepEqual(JSON.parse(JSON.stringify(finder.requests[0][1])), PRODUCTION_FETCH_OPTIONS);
  assert.equal(finder.state(), 'available');
});

test('production host: the thumbnail renders from the exact petlist-cad8b Storage object URL', async () => {
  const finder = await openFinder({
    search: `?id=${PUBLIC_ID}`,
    respond: () => response(200, firestoreDocument(VALID_PROFILE)),
  });
  const external = finder.images().filter((src) => /^https?:/.test(src));
  assert.deepEqual(external, [PRODUCTION_THUMBNAIL_URL]);
});

test('production host: a thumbnail path for another Pet ID is never requested', async () => {
  const finder = await openFinder({
    search: `?id=${PUBLIC_ID}`,
    respond: () => response(200, firestoreDocument({
      ...VALID_PROFILE,
      thumbnail: { path: `pet-id-public/${OTHER_ID}/${VERSION}.jpg`, version: VERSION },
    })),
  });
  assert.equal(finder.state(), 'unavailable');
  assert.deepEqual(finder.images().filter((src) => /^https?:/.test(src)), []);
});

test('valid canonical IDs, including URL-safe characters, are requested verbatim', async () => {
  const id = 'Ab-_Ab-_Ab-_Ab-_Ab-_AQ';
  const finder = await openFinder({ search: `?id=${id}`, respond: () => response(404, {}) });
  assert.equal(finder.requests.length, 1);
  assert.equal(finder.requests[0][0],
    `https://firestore.googleapis.com/v1/projects/petlist-cad8b/databases/(default)/documents/petIdPublic/${id}`);
});

for (const [label, search] of [
  ['missing id', ''],
  ['empty id', '?id='],
  ['too short', '?id=AQEBAQ'],
  ['too long', `?id=${PUBLIC_ID}A`],
  ['non-canonical final character', '?id=AQEBAQEBAQEBAQEBAQEBAB'],
  ['path traversal', `?id=${encodeURIComponent(`../${PUBLIC_ID}`)}`],
  ['query injection', `?id=${encodeURIComponent(`${PUBLIC_ID}?x=1`)}`],
  ['legacy fragment payload', '?id=v1.payload'],
]) {
  test(`invalid ID (${label}) makes no request and shows unavailable`, async () => {
    const finder = await openFinder({ search, respond: () => response(200, firestoreDocument(VALID_PROFILE)) });
    assert.equal(finder.requests.length, 0);
    assert.equal(finder.state(), 'unavailable');
  });
}

for (const [label, reply, expected] of [
  ['404 deleted or unknown', () => response(404, {}), 'unavailable'],
  ['malformed JSON body', () => response(200, null, { invalidJson: true }), 'unavailable'],
  ['unprojected field', () => response(200, { fields: { breed: { stringValue: 'Tabby' } } }), 'unavailable'],
  ['missing contact', () => response(200, firestoreDocument({ name: 'Mochi' })), 'unavailable'],
  ['401', () => response(401, {}), 'network'],
  ['403', () => response(403, {}), 'network'],
  ['429', () => response(429, {}), 'network'],
  ['500', () => response(500, {}), 'network'],
  ['503', () => response(503, {}), 'network'],
  ['thrown network error', () => { throw new TypeError('offline'); }, 'network'],
]) {
  test(`production response ${label} is classified as ${expected}`, async () => {
    const finder = await openFinder({ search: `?id=${PUBLIC_ID}`, respond: reply });
    assert.equal(finder.requests.length, 1);
    assert.equal(finder.state(), expected);
  });
}

test('retry after a network failure is one fresh identical production GET', async () => {
  const finder = await openFinder({
    search: `?id=${PUBLIC_ID}`,
    respond: (count) => (count === 1 ? response(503, {}) : response(200, firestoreDocument(VALID_PROFILE))),
  });
  assert.equal(finder.state(), 'network');
  await finder.retry();
  assert.equal(finder.requests.length, 2);
  assert.equal(finder.requests[1][0], PRODUCTION_DOCUMENT_URL);
  assert.deepEqual(JSON.parse(JSON.stringify(finder.requests[1][1])), PRODUCTION_FETCH_OPTIONS);
  assert.equal(finder.state(), 'available');
});

test('the production Content-Security-Policy is pinned verbatim', () => {
  const tag = [...indexHtml.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0])
    .find((candidate) => /http-equiv\s*=\s*["']?Content-Security-Policy/i.test(candidate));
  assert.match(tag, /content="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; connect-src https:\/\/firestore\.googleapis\.com; img-src 'self' https:\/\/firebasestorage\.googleapis\.com; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; media-src 'none'; worker-src 'none'; manifest-src 'none'; upgrade-insecure-requests"/);
  assert.match(indexHtml, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(indexHtml, /<meta name="referrer" content="no-referrer">/);
});

test('Finder scripts address only the production Firebase project and bucket', () => {
  const source = ['profile.js', 'load.js', 'view.js', 'main.js']
    .map((name) => fs.readFileSync(path.join(p, name), 'utf8')).join('\n');
  const origins = new Set([...source.matchAll(/https:\/\/([a-z0-9.-]+)/gi)].map((match) => match[1]));
  assert.deepEqual([...origins].sort(), [
    'firebasestorage.googleapis.com',
    'firestore.googleapis.com',
    'mypetlist.app',
    'www.google.com',
  ]);
  assert.match(source, /'petlist-cad8b'/);
  assert.match(source, /'petlist-cad8b\.firebasestorage\.app'/);
});
