'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Load = require('../p/load.js');

const PUBLIC_ID = 'AQEBAQEBAQEBAQEBAQEBAQ';
const VALID_DOCUMENT = {
  fields: {
    name: { stringValue: 'Mochi' },
    phone: { stringValue: '555-0100' },
  },
};

function response(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

test('a malformed or missing ID makes no network request', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; return response(200, VALID_DOCUMENT); };
  assert.deepEqual(await Load.loadHostedProfile(null, fetchImpl), { kind: 'unavailable' });
  assert.deepEqual(await Load.loadHostedProfile('too-short', fetchImpl), { kind: 'unavailable' });
  assert.equal(calls, 0);
});
test('performs exactly one no-store Firestore document GET and returns an available profile', async () => {
  const calls = [];
  const result = await Load.loadHostedProfile(PUBLIC_ID, async (...args) => {
    calls.push(args);
    return response(200, VALID_DOCUMENT);
  });
  assert.equal(result.kind, 'available');
  assert.deepEqual(result.profile, { name: 'Mochi', phone: '555-0100' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], `https://firestore.googleapis.com/v1/projects/petlist-cad8b/databases/(default)/documents/petIdPublic/${PUBLIC_ID}`);
  assert.deepEqual(calls[0][1], { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } });
});

test('404/revoked and invalid DTO converge to unavailable', async () => {
  assert.deepEqual(await Load.loadHostedProfile(PUBLIC_ID, async () => response(404, {})), { kind: 'unavailable' });
  assert.deepEqual(await Load.loadHostedProfile(PUBLIC_ID, async () => response(200, { fields: { breed: { stringValue: 'Tabby' } } })), { kind: 'unavailable' });
});

test('transient HTTP and thrown network failures are retryable', async () => {
  assert.deepEqual(await Load.loadHostedProfile(PUBLIC_ID, async () => response(503, {})), { kind: 'network' });
  assert.deepEqual(await Load.loadHostedProfile(PUBLIC_ID, async () => { throw new TypeError('offline'); }), { kind: 'network' });
});

test('a retry is a fresh single GET and can recover', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return calls === 1 ? response(503, {}) : response(200, VALID_DOCUMENT);
  };
  assert.equal((await Load.loadHostedProfile(PUBLIC_ID, fetchImpl)).kind, 'network');
  assert.equal((await Load.loadHostedProfile(PUBLIC_ID, fetchImpl)).kind, 'available');
  assert.equal(calls, 2);
});
