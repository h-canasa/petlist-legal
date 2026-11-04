'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const View = require('../p/view.js');

const PUBLIC_ID = 'AQEBAQEBAQEBAQEBAQEBAQ';

function profile(overrides = {}) {
  return { name: 'Mochi', phone: '555-0100', ...overrides };
}

function section(view, kind) {
  return view.sections.find((candidate) => candidate.kind === kind);
}

test('phone-only has Call and Text; email-only has a primary Email action', () => {
  const phone = section(View.available(profile(), PUBLIC_ID), 'contact').actions;
  assert.deepEqual(phone, [
    { kind: 'call', value: '555-0100', href: 'tel:5550100', primary: true },
    { kind: 'text', href: 'sms:5550100', primary: false },
  ]);

  const email = section(View.available(profile({ phone: undefined, email: 'owner@example.com' }), PUBLIC_ID), 'contact').actions;
  assert.deepEqual(email, [
    { kind: 'email', value: 'owner@example.com', href: 'mailto:owner@example.com', primary: true },
  ]);
});

test('with both contacts, Call is primary and Text and Email follow in order', () => {
  const actions = section(View.available(profile({
    phone: '+63 (917) 555-0142', email: 'owner+petid@example.com',
  }), PUBLIC_ID), 'contact').actions;
  assert.deepEqual(actions, [
    { kind: 'call', value: '+63 (917) 555-0142', href: 'tel:+639175550142', primary: true },
    { kind: 'text', href: 'sms:+639175550142', primary: false },
    { kind: 'email', value: 'owner+petid@example.com', href: 'mailto:owner%2Bpetid@example.com', primary: false },
  ]);
});

test('unsupported contact values do not create dead actions or an empty section', () => {
  const shortNumber = section(View.available(profile({ phone: '12345' }), PUBLIC_ID), 'contact').actions;
  assert.deepEqual(shortNumber, [{ kind: 'call', value: '12345', href: 'tel:12345', primary: true }]);

  const validEmail = section(View.available(profile({
    phone: '12+34', email: 'owner@example.com',
  }), PUBLIC_ID), 'contact').actions;
  assert.deepEqual(validEmail.map(({ kind, primary }) => [kind, primary]), [['email', true]]);
  assert.equal(section(View.available(profile({ phone: '++63 917 555 0142' }), PUBLIC_ID), 'contact'), undefined);
});

test('If Found is absent or present exactly with its hosted text content', () => {
  assert.equal(section(View.available(profile(), PUBLIC_ID), 'ifFound'), undefined);
  const text = '<img src=x onerror=alert(1)>';
  assert.deepEqual(section(View.available(profile({ ifFound: text }), PUBLIC_ID), 'ifFound'), { kind: 'ifFound', text });
});

test('full-length identity and instructions stay intact and lead the contact and Home Base sections', () => {
  const name = 'M'.repeat(80);
  const ifFound = '<img src=x onerror=alert(1)>\n' + 'W'.repeat(171);
  const view = View.available(profile({ name, ifFound, homeBase: { label: 'Gate', coordinate: null } }), PUBLIC_ID);
  assert.equal(view.identity.name, name);
  assert.equal(view.sections[0].text, ifFound);
  assert.deepEqual(view.sections.map(({ kind }) => kind), ['ifFound', 'contact', 'homeBase']);
});

test('Home Base supports absent, label-only, and coordinate map action states', () => {
  assert.equal(section(View.available(profile(), PUBLIC_ID), 'homeBase'), undefined);
  assert.deepEqual(
    section(View.available(profile({ homeBase: { label: 'Home', coordinate: null } }), PUBLIC_ID), 'homeBase'),
    { kind: 'homeBase', label: 'Home', mapHref: null }
  );
  const coordinate = section(View.available(profile({
    homeBase: { label: 'Home', coordinate: { latitude: 14.5, longitude: 121 } },
  }), PUBLIC_ID), 'homeBase');
  assert.equal(coordinate.label, 'Home');
  assert.match(coordinate.mapHref, /^https:\/\/www\.google\.com\/maps\/search\//);
});

test('Temperament is absent or represented as compact canonical labels', () => {
  assert.deepEqual(View.available(profile(), PUBLIC_ID).identity.temperament, []);
  assert.deepEqual(
    View.available(profile({ temperament: ['friendly', 'food-motivated'] }), PUBLIC_ID).identity.temperament,
    ['Friendly', 'Food-motivated']
  );
});

test('unavailable has no retry while network has Try Again', () => {
  assert.deepEqual(View.message('unavailable'), {
    kind: 'unavailable',
    heading: "This Pet ID isn't available.",
    body: "Check the link or ask the pet's owner for an updated Pet ID.",
    retryLabel: null,
  });
  assert.equal(View.message('network').retryLabel, 'Try Again');
});

test('photo fallback exists without a thumbnail and is revealed after an image error', () => {
  const photo = View.available(profile(), PUBLIC_ID).identity.photo;
  assert.deepEqual(photo, { src: null, fallback: true });
  const fakeImage = { removed: false, remove() { this.removed = true; } };
  View.handlePhotoError(fakeImage);
  assert.equal(fakeImage.removed, true);
});
