'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Payload = require('../pet-id/payload.js');
const fixtures = require('./fixtures.js');

function decodeOk(fragment) {
  const result = Payload.decodePetIdFragment(fragment);
  assert.equal(result.ok, true, 'expected a successful decode, got: ' + JSON.stringify(result));
  return result.payload;
}

function decodeFails(fragment, reason) {
  const result = Payload.decodePetIdFragment(fragment);
  assert.equal(result.ok, false, 'expected decode to fail, got: ' + JSON.stringify(result));
  assert.equal(result.reason, reason);
  return result;
}

// 1. valid current v1 payload
test('decodes a full real v1 payload produced by the mobile app', () => {
  const payload = decodeOk(fixtures.fullPayload.fragment);
  assert.deepEqual(payload, fixtures.fullPayload.payload);
});

// 2. phone-only payload
test('decodes a phone-only payload', () => {
  assert.deepEqual(decodeOk(fixtures.phoneOnly.fragment), fixtures.phoneOnly.payload);
});

// 3. email-only payload
test('decodes an email-only payload', () => {
  assert.deepEqual(decodeOk(fixtures.emailOnly.fragment), fixtures.emailOnly.payload);
});

// 4. phone + email
test('decodes a phone + email payload', () => {
  assert.deepEqual(decodeOk(fixtures.phoneAndEmail.fragment), fixtures.phoneAndEmail.payload);
});

// 5. species + breed
test('decodes species + breed', () => {
  assert.deepEqual(decodeOk(fixtures.speciesAndBreed.fragment), fixtures.speciesAndBreed.payload);
});

// 6. species only
test('decodes species only', () => {
  assert.deepEqual(decodeOk(fixtures.speciesOnly.fragment), fixtures.speciesOnly.payload);
});

// 7. breed only
test('decodes breed only', () => {
  assert.deepEqual(decodeOk(fixtures.breedOnly.fragment), fixtures.breedOnly.payload);
});

// 8. neither breed nor species
test('decodes with neither breed nor species present', () => {
  const payload = decodeOk(fixtures.neitherBreedNorSpecies.fragment);
  assert.equal('breed' in payload, false);
  assert.equal('species' in payload, false);
});

// 9-12: temperament decode + order preservation (natural-language assembly is covered in
// pet-id-sentences.test.js; these confirm the decoder itself never reorders or dedupes).
test('decodes one temperament', () => {
  assert.deepEqual(decodeOk(fixtures.oneTemperament.fragment), fixtures.oneTemperament.payload);
});

test('decodes two temperaments', () => {
  assert.deepEqual(decodeOk(fixtures.twoTemperaments.fragment), fixtures.twoTemperaments.payload);
});

test('decodes three temperaments', () => {
  assert.deepEqual(decodeOk(fixtures.threeTemperaments.fragment), fixtures.threeTemperaments.payload);
});

test('decodes five temperaments and preserves persisted order exactly', () => {
  const payload = decodeOk(fixtures.fiveTemperamentsOrderPreserved.fragment);
  assert.deepEqual(payload.temperament, fixtures.fiveTemperamentsOrderPreserved.payload.temperament);
});

// 13. temperament absent -> no temperament key at all
test('temperament key is absent when not included', () => {
  const payload = decodeOk(fixtures.phoneOnly.fragment);
  assert.equal('temperament' in payload, false);
});

// 14. Unicode/emoji pet name
test('decodes a Unicode/emoji pet name exactly', () => {
  const payload = decodeOk(fixtures.unicodeEmojiName.fragment);
  assert.equal(payload.name, fixtures.unicodeEmojiName.payload.name);
});

// 15. Unicode/emoji If Found
test('decodes Unicode/emoji If Found exactly', () => {
  const payload = decodeOk(fixtures.unicodeEmojiIfFound.fragment);
  assert.equal(payload.ifFound, fixtures.unicodeEmojiIfFound.payload.ifFound);
});

// 16. explicit If Found newlines
test('decodes explicit If Found newlines exactly', () => {
  const payload = decodeOk(fixtures.ifFoundExplicitNewlines.fragment);
  assert.equal(payload.ifFound, 'Line one.\nLine two.\nLine three.');
});

// 17. Home Base label-only
test('decodes a label-only Home Base with a null coordinate', () => {
  const payload = decodeOk(fixtures.homeBaseLabelOnly.fragment);
  assert.deepEqual(payload.homeBase, { label: 'Maple Street House', coordinate: null });
});

// 18. Home Base + coordinate
test('decodes a Home Base with a coordinate', () => {
  const payload = decodeOk(fixtures.homeBaseWithCoordinate.fragment);
  assert.deepEqual(payload.homeBase, {
    label: 'Maple Street House',
    coordinate: { latitude: 40.7128, longitude: -74.006 },
  });
});

// 19. malformed base64url
test('rejects malformed base64url as malformedEncoding', () => {
  decodeFails('v1.not!valid!base64url', 'malformedEncoding');
});

// 20. invalid UTF-8 where practical
test('rejects base64url that decodes to invalid UTF-8 as malformedEncoding', () => {
  // Raw byte 0x80 is a stray continuation byte -- never valid as a UTF-8 lead byte.
  // base64url("\x80") = "gA" (padded form "gA=="), unpadded "gA".
  decodeFails('v1.gA', 'malformedEncoding');
});

// 21. malformed JSON
test('rejects valid base64url/UTF-8 that is not JSON as malformedJson', () => {
  // base64url("not json") -- valid UTF-8 text, invalid JSON.
  const encoded = Buffer.from('not json', 'utf8').toString('base64url');
  decodeFails('v1.' + encoded, 'malformedJson');
});

// 22. unknown wire key
test('rejects an unknown top-level wire key as malformedPayload', () => {
  const encoded = Buffer.from(JSON.stringify({ n: 'Milo', p: '555-000-1111', x: 'smuggled' }), 'utf8').toString(
    'base64url'
  );
  decodeFails('v1.' + encoded, 'malformedPayload');
});

// 23. missing pet name
test('rejects a payload missing the pet name as malformedPayload', () => {
  const encoded = Buffer.from(JSON.stringify({ p: '555-000-1111' }), 'utf8').toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

// 24. missing both contact methods
test('rejects a payload with neither phone nor email as malformedPayload', () => {
  const encoded = Buffer.from(JSON.stringify({ n: 'Milo' }), 'utf8').toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

// 25. invalid species
test('rejects an invalid species as malformedPayload', () => {
  const encoded = Buffer.from(
    JSON.stringify({ n: 'Milo', p: '555-000-1111', s: 'fish' }),
    'utf8'
  ).toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

// 26. invalid temperament ID
test('rejects an unknown temperament id as malformedPayload', () => {
  const encoded = Buffer.from(
    JSON.stringify({ n: 'Milo', p: '555-000-1111', t: ['not-a-real-trait'] }),
    'utf8'
  ).toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

// 27. duplicate/conflicting temperament
test('rejects a duplicate temperament id as malformedPayload', () => {
  const encoded = Buffer.from(
    JSON.stringify({ n: 'Milo', p: '555-000-1111', t: ['playful', 'playful'] }),
    'utf8'
  ).toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

test('rejects a conflicting temperament pair as malformedPayload', () => {
  const encoded = Buffer.from(
    JSON.stringify({ n: 'Milo', p: '555-000-1111', t: ['friendly', 'aloof'] }),
    'utf8'
  ).toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

// 28. over-cap temperament selection
test('rejects a temperament selection over the 5-trait cap as malformedPayload', () => {
  const encoded = Buffer.from(
    JSON.stringify({
      n: 'Milo',
      p: '555-000-1111',
      t: ['adventurous', 'affectionate', 'alert', 'calm', 'cautious', 'confident'],
    }),
    'utf8'
  ).toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

// 29. invalid/oversized fields per mobile contract
test('rejects a name over the 80-character bound as malformedPayload', () => {
  const encoded = Buffer.from(
    JSON.stringify({ n: 'X'.repeat(81), p: '555-000-1111' }),
    'utf8'
  ).toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

test('rejects a breed over the 80-character bound as malformedPayload', () => {
  const encoded = Buffer.from(
    JSON.stringify({ n: 'Milo', p: '555-000-1111', b: 'X'.repeat(81) }),
    'utf8'
  ).toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

test('rejects an If Found over the 200-character bound as malformedPayload', () => {
  const encoded = Buffer.from(
    JSON.stringify({ n: 'Milo', p: '555-000-1111', f: 'X'.repeat(201) }),
    'utf8'
  ).toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

test('rejects a phone with no digits as malformedPayload', () => {
  const encoded = Buffer.from(
    JSON.stringify({ n: 'Milo', p: 'call me' }),
    'utf8'
  ).toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

// 30. invalid Home Base coordinate
test('rejects an out-of-range Home Base coordinate as malformedPayload', () => {
  const encoded = Buffer.from(
    JSON.stringify({ n: 'Milo', p: '555-000-1111', h: { l: 'Home', c: [999, 0] } }),
    'utf8'
  ).toString('base64url');
  decodeFails('v1.' + encoded, 'malformedPayload');
});

// 31. unsupported future version
test('rejects an unsupported future version marker', () => {
  const result = Payload.decodePetIdFragment('v2.' + fixtures.phoneOnly.fragment.slice(3));
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'unsupportedVersion');
  assert.equal(result.version, 'v2');
});

// 32. user strings are treated as text, not HTML
test('does not interpret an If Found value containing markup as HTML -- it stays a literal string', () => {
  const raw = '<img src=x onerror=alert(1)>';
  const encoded = Buffer.from(
    JSON.stringify({ n: 'Milo', p: '555-000-1111', f: raw }),
    'utf8'
  ).toString('base64url');
  const payload = decodeOk('v1.' + encoded);
  assert.equal(payload.ifFound, raw);
});

// 33. explicit version dispatch
test('dispatches only on an exact v1 marker: a non-numeric marker is notPetIdUrl, not unsupportedVersion', () => {
  const result = Payload.decodePetIdFragment('vX.' + fixtures.phoneOnly.fragment.slice(3));
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'notPetIdUrl');
});

test('decodePetIdUrl requires the exact PET_ID_URL_BASE origin and path', () => {
  const goodUrl = Payload.PET_ID_URL_BASE + '#' + fixtures.phoneOnly.fragment;
  assert.equal(Payload.decodePetIdUrl(goodUrl).ok, true);

  const wrongHost = 'https://evil.example/pet-id/#' + fixtures.phoneOnly.fragment;
  assert.equal(Payload.decodePetIdUrl(wrongHost).ok, false);
  assert.equal(Payload.decodePetIdUrl(wrongHost).reason, 'notPetIdUrl');

  const noFragment = Payload.PET_ID_URL_BASE;
  assert.equal(Payload.decodePetIdUrl(noFragment).ok, false);
  assert.equal(Payload.decodePetIdUrl(noFragment).reason, 'notPetIdUrl');
});

test('decodePetIdFragment accepts a leading "#" the same as a bare fragment', () => {
  const withHash = Payload.decodePetIdFragment('#' + fixtures.phoneOnly.fragment);
  const withoutHash = Payload.decodePetIdFragment(fixtures.phoneOnly.fragment);
  assert.deepEqual(withHash, withoutHash);
});
