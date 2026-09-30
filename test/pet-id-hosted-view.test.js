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

test('phone-only renders phone but not email; email-only renders email but not phone', () => {
  const phone = section(View.available(profile(), PUBLIC_ID), 'contact').actions;
  assert.deepEqual(phone.map((action) => action.kind), ['phone']);
  assert.equal(phone[0].value, '555-0100');

  const email = section(View.available(profile({ phone: undefined, email: 'owner@example.com' }), PUBLIC_ID), 'contact').actions;
  assert.deepEqual(email.map((action) => action.kind), ['email']);
  assert.equal(email[0].value, 'owner@example.com');
});

test('phone display text stays owner-authored while the tel action keeps only one leading plus and digits', () => {
  const action = section(View.available(profile({ phone: '12+34' }), PUBLIC_ID), 'contact').actions[0];
  assert.equal(action.value, '12+34');
  assert.equal(action.href, 'tel:1234');

  const repeated = section(View.available(profile({ phone: '++63 917 555 0142' }), PUBLIC_ID), 'contact').actions[0];
  assert.equal(repeated.value, '++63 917 555 0142');
  assert.equal(repeated.href, 'tel:+639175550142');
});

test('If Found is absent or present exactly with its hosted text content', () => {
  assert.equal(section(View.available(profile(), PUBLIC_ID), 'ifFound'), undefined);
  const text = '<img src=x onerror=alert(1)>';
  assert.deepEqual(section(View.available(profile({ ifFound: text }), PUBLIC_ID), 'ifFound'), { kind: 'ifFound', text });
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
