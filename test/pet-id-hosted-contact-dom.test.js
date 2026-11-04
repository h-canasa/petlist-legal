'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const View = require('../p/view.js');

const main = readFileSync(join(__dirname, '../p/main.js'), 'utf8');

function element(tag) {
  return {
    tag, children: [], attributes: {}, dataset: {}, classList: { add() {} },
    get childElementCount() { return this.children.length; },
    append(...children) { this.children.push(...children); },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    cloneNode() { return element(tag); },
    replaceChildren(fragment) { this.children = fragment.children; },
  };
}

async function renderRecovery(profile) {
  const root = element('article');
  root.dataset.state = 'loading';
  runInNewContext(main, {
    document: {
      querySelector: () => root,
      createElement: element,
      createElementNS: (_, tag) => element(tag),
      createDocumentFragment: () => element('fragment'),
    },
    URLSearchParams,
    window: {
      location: { search: '?id=AQEBAQEBAQEBAQEBAQEBAQ' },
      fetch() {},
      PetIdView: View,
      PetIdLoad: { loadHostedProfile: async () => ({ kind: 'available', profile }) },
    },
  });
  await new Promise(setImmediate);
  assert.equal(root.dataset.state, 'available');
  return root.children.find((node) => node.className === 'recovery').children;
}

async function renderContact(profile) {
  const recovery = await renderRecovery(profile);
  return recovery.find((node) => node.attributes['aria-label'] === 'Contact');
}

test('the DOM keeps an unsupported phone as labeled text with no interactive element', async () => {
  const phone = '++63  917 555 0142';
  const contact = await renderContact({ name: 'Mochi', phone });
  assert.ok(contact);
  assert.deepEqual(contact.children.map((node) => node.tag), ['p']);
  assert.deepEqual(contact.children[0].children.map((node) => node.textContent), ['Phone', phone]);
});

test('mixed recovery contact renders an Email link and both original values as literal DOM text', async () => {
  const email = 'owner+<pet>@example.com';
  const phone = '12+34';
  const contact = await renderContact({ name: 'Mochi', phone, email });
  assert.ok(contact);
  const [action, address, detail] = contact.children;
  assert.equal(action.tag, 'a');
  assert.match(action.className, /\bcontact-primary\b/);
  assert.equal(action.href, 'mailto:owner%2B%3Cpet%3E@example.com');
  assert.equal(address.textContent, email);
  assert.deepEqual(address.children, []);
  assert.deepEqual(detail.children.map((node) => node.textContent), ['Phone', phone]);
});

test('the DOM appends read-only vaccination rows after Home Base and keeps hosted titles literal', async () => {
  const hostile = '<img src=x onerror=alert(1)>';
  const long = 'x'.repeat(200);
  const sections = await renderRecovery({
    name: 'Mochi', phone: '555-0100', ifFound: 'Please call.',
    homeBase: { label: 'Gate', coordinate: null }, schemaVersion: 2,
    vaccinations: [
      { title: hostile, dateAdministered: '2011-12-30', nextDueDate: '2027-11-01' },
      { title: long, dateAdministered: '2026-11-01' },
    ],
  });
  assert.deepEqual(sections.map(node => node.className), [
    'recovery-section if-found', 'contact', 'recovery-section home-base', 'recovery-section vaccinations',
  ]);
  const flatten = node => [node, ...node.children.flatMap(flatten)];
  const nodes = flatten(sections[3]);
  assert.equal(nodes.find(node => node.tag === 'h2').textContent, 'Vaccinations');
  for (const title of [hostile, long]) {
    const node = nodes.find(node => node.className === 'vaccination-title' && node.textContent === title);
    assert.ok(node);
    assert.deepEqual(node.children, []);
  }
  assert.deepEqual(nodes.filter(node => node.tag === 'time').map(node => node.attributes.datetime),
    ['2011-12-30', '2027-11-01', '2026-11-01']);
  assert.equal(nodes.find(node => node.attributes.datetime === '2011-12-30').textContent,
    new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
      .format(new Date('2011-12-30T00:00:00Z')));
  assert.equal(nodes.filter(node => node.className === 'vaccination-due').length, 1);
  assert.equal(nodes.some(node => node.textContent === 'Shared by the owner from their PetList records.'), true);
  assert.equal(nodes.some(node => ['a', 'img', 'button'].includes(node.tag)), false);
});
