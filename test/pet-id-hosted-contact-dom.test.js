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

async function renderContact(profile) {
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
  return root.children.find((node) => node.className === 'recovery')?.children
    .find((node) => node.attributes['aria-label'] === 'Contact');
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
