'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Profile = require('../p/profile.js');

const PUBLIC_ID = 'AQEBAQEBAQEBAQEBAQEBAQ';
const OTHER_ID = 'AwMDAwMDAwMDAwMDAwMDAw';
const VERSION = 'AgICAgICAgICAgICAgICAg';

function value(input) {
  if (input === null) return { nullValue: null };
  if (typeof input === 'string') return { stringValue: input };
  if (typeof input === 'number') return { doubleValue: input };
  if (Array.isArray(input)) return { arrayValue: { values: input.map(value) } };
  return {
    mapValue: {
      fields: Object.fromEntries(Object.entries(input).map(([key, entry]) => [key, value(entry)])),
    },
  };
}

function document(profile) {
  return { fields: Object.fromEntries(Object.entries(profile).map(([key, entry]) => [key, value(entry)])) };
}

const FULL = {
  name: 'Mochi',
  phone: '+63 917 555 0142',
  email: 'owner+mochi@example.com',
  ifFound: 'Please call before approaching.',
  homeBase: { label: 'Greenfield District', coordinate: { latitude: 14.5794, longitude: 121.0359 } },
  temperament: ['friendly', 'gentle'],
  thumbnail: { path: `pet-id-public/${PUBLIC_ID}/${VERSION}.jpg`, version: VERSION },
};

test('accepts only canonical 22-character public IDs', () => {
  assert.equal(Profile.isPetIdPublicId(PUBLIC_ID), true);
  assert.equal(Profile.isPetIdPublicId('A'.repeat(21)), false);
  assert.equal(Profile.isPetIdPublicId('A'.repeat(23)), false);
  assert.equal(Profile.isPetIdPublicId('A'.repeat(21) + '+'), false);
  assert.equal(Profile.isPetIdPublicId('A'.repeat(21) + 'B'), false, 'non-canonical unused bits');
});

test('decodes and validates a representative full Firestore document', () => {
  assert.deepEqual(Profile.decodeAndValidateProfile(document(FULL), PUBLIC_ID), FULL);
});

test('accepts phone-only, email-only, and absent optional fields', () => {
  assert.deepEqual(Profile.decodeAndValidateProfile(document({ name: 'Milo', phone: '555-0100' }), PUBLIC_ID), {
    name: 'Milo', phone: '555-0100',
  });
  assert.deepEqual(Profile.decodeAndValidateProfile(document({ name: 'Milo', email: 'owner@example.com' }), PUBLIC_ID), {
    name: 'Milo', email: 'owner@example.com',
  });
});

test('rejects malformed Firestore value types and unknown hosted fields', () => {
  assert.equal(Profile.decodeAndValidateProfile({ fields: { name: { booleanValue: true } } }, PUBLIC_ID), null);
  assert.equal(Profile.decodeAndValidateProfile(document({ ...FULL, breed: 'Tabby' }), PUBLIC_ID), null);
  assert.equal(Profile.decodeAndValidateProfile(document({ ...FULL, species: 'cat' }), PUBLIC_ID), null);
});

test('rejects missing name/contact and over-bound strings', () => {
  assert.equal(Profile.decodeAndValidateProfile(document({ phone: '555-0100' }), PUBLIC_ID), null);
  assert.equal(Profile.decodeAndValidateProfile(document({ name: 'Milo' }), PUBLIC_ID), null);
  assert.equal(Profile.decodeAndValidateProfile(document({ name: 'x'.repeat(81), phone: '555-0100' }), PUBLIC_ID), null);
  assert.equal(Profile.decodeAndValidateProfile(document({ name: 'Milo', phone: '5'.repeat(31) }), PUBLIC_ID), null);
  assert.equal(Profile.decodeAndValidateProfile(document({ name: 'Milo', email: `${'a'.repeat(243)}@example.com` }), PUBLIC_ID), null);
  assert.equal(Profile.decodeAndValidateProfile(document({ name: 'Milo', phone: '555-0100', ifFound: 'x'.repeat(201) }), PUBLIC_ID), null);
});

test('enforces canonical temperament IDs, cap, uniqueness, and conflicts', () => {
  const base = { name: 'Milo', phone: '555-0100' };
  assert.notEqual(Profile.decodeAndValidateProfile(document({ ...base, temperament: ['alert', 'gentle'] }), PUBLIC_ID), null);
  for (const temperament of [
    ['friendly', 'not-real'],
    ['friendly', 'friendly'],
    ['friendly', 'aloof'],
    ['alert', 'gentle', 'loyal', 'calm', 'curious', 'quiet'],
    [],
  ]) {
    assert.equal(Profile.decodeAndValidateProfile(document({ ...base, temperament }), PUBLIC_ID), null);
  }
});

test('accepts label-only and coordinate Home Base, rejects malformed coordinates', () => {
  const base = { name: 'Milo', phone: '555-0100' };
  assert.notEqual(Profile.decodeAndValidateProfile(document({ ...base, homeBase: { label: 'Home', coordinate: null } }), PUBLIC_ID), null);
  assert.notEqual(Profile.decodeAndValidateProfile(document({ ...base, homeBase: { label: 'Home', coordinate: { latitude: -90, longitude: 180 } } }), PUBLIC_ID), null);
  assert.equal(Profile.decodeAndValidateProfile(document({ ...base, homeBase: { label: 'Home', coordinate: { latitude: 91, longitude: 0 } } }), PUBLIC_ID), null);
  assert.equal(Profile.decodeAndValidateProfile(document({ ...base, homeBase: { label: 'Home', coordinate: { latitude: 1 } } }), PUBLIC_ID), null);
});

test('decodes Firestore integer coordinates without relaxing numeric validation', () => {
  const encoded = document({ name: 'Milo', phone: '555-0100', homeBase: { label: 'Home', coordinate: { latitude: 0, longitude: 0 } } });
  encoded.fields.homeBase.mapValue.fields.coordinate.mapValue.fields.latitude = { integerValue: '0' };
  encoded.fields.homeBase.mapValue.fields.coordinate.mapValue.fields.longitude = { integerValue: '0' };
  assert.notEqual(Profile.decodeAndValidateProfile(encoded, PUBLIC_ID), null);
  encoded.fields.homeBase.mapValue.fields.coordinate.mapValue.fields.latitude = { integerValue: '0.5' };
  assert.equal(Profile.decodeAndValidateProfile(encoded, PUBLIC_ID), null);
});

test('builds a safe coordinate-only map URI', () => {
  const url = Profile.buildMapUrl({ latitude: 14.5794, longitude: 121.0359 });
  assert.equal(url, 'https://www.google.com/maps/search/?api=1&query=14.5794%2C121.0359');
  assert.doesNotMatch(url, /Greenfield/);
});

test('requires a same-publicId, version-consistent immutable thumbnail path', () => {
  assert.equal(Profile.thumbnailUrl(FULL.thumbnail, PUBLIC_ID),
    `https://firebasestorage.googleapis.com/v0/b/petlist-cad8b.firebasestorage.app/o/${encodeURIComponent(FULL.thumbnail.path)}?alt=media`);
  assert.equal(Profile.thumbnailUrl({ ...FULL.thumbnail, path: `pet-id-public/${OTHER_ID}/${VERSION}.jpg` }, PUBLIC_ID), null);
  assert.equal(Profile.thumbnailUrl({ ...FULL.thumbnail, path: `pet-id-public/${PUBLIC_ID}/${OTHER_ID}.jpg` }, PUBLIC_ID), null);
  assert.equal(Profile.thumbnailUrl({ path: 'pet-id-public/nope.jpg', version: VERSION }, PUBLIC_ID), null);
  assert.equal(Profile.thumbnailUrl(undefined, PUBLIC_ID), null);
});

test('builds valid phone and injection-safe email actions without changing display values', () => {
  assert.equal(Profile.buildTelUri('555-0100'), 'tel:5550100');
  assert.equal(Profile.buildTelUri('+63 (917) 555-0142'), 'tel:+639175550142');
  assert.equal(Profile.buildMailtoUri('owner@example.com'), 'mailto:owner@example.com');
  assert.equal(Profile.buildMailtoUri('owner+petid@example.com'), 'mailto:owner%2Bpetid@example.com');
  const reserved = Profile.buildMailtoUri('a?b#c@example.com');
  assert.equal(reserved, 'mailto:a%3Fb%23c@example.com');
  assert.doesNotMatch(reserved, /[?#]/);
});
