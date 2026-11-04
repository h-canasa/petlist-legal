'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Profile = require('../p/profile.js');
const Load = require('../p/load.js');
const View = require('../p/view.js');

const publicId = 'AQEBAQEBAQEBAQEBAQEBAQ';
const row = { title: 'Rabies Vaccine', dateAdministered: '2026-11-01', nextDueDate: '2027-11-01' };
const legacy = { name: 'Luna', phone: '555-0100', ifFound: 'Please call', homeBase: { label: 'Home', coordinate: null } };
const profile = { ...legacy, schemaVersion: 2, vaccinations: [row] };

function field(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(field) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, field(entry)])) } };
}

const document = value => ({ fields: field(value).mapValue.fields });
const decode = value => Profile.decodeAndValidateProfile(document(value), publicId);

test('loads both legacy and shared vaccination profiles via the hosted reader', async () => {
  for (const input of [legacy, profile]) {
    const result = await Load.loadHostedProfile(publicId, async () => ({
      status: 200, ok: true, json: async () => document(input),
    }));
    assert.deepEqual(result, { kind: 'available', profile: input });
  }
  const maximum = { ...profile, vaccinations: Array.from({ length: 50 }, () => ({ ...row, title: 'x'.repeat(200) })) };
  assert.deepEqual(decode(maximum), maximum);
  const noDue = { title: 'FeLV Vaccine', dateAdministered: '2024-02-29' };
  assert.deepEqual(decode({ ...profile, vaccinations: [noDue] })?.vaccinations, [noDue]);
});

test('rejects partial or malformed versions and empty, oversized or malformed records', () => {
  for (const invalid of [
    { ...legacy, schemaVersion: 2 }, { ...legacy, vaccinations: [row] },
    ...[1, 3, '2', null].map(schemaVersion => ({ ...profile, schemaVersion })),
    { ...profile, vaccinations: null }, { ...profile, vaccinations: [] },
    { ...profile, vaccinations: Array.from({ length: 51 }, () => row) },
    ...['', ' Rabies', 'x'.repeat(201)].map(title => ({ ...profile, vaccinations: [{ ...row, title }] })),
    { ...profile, vaccinations: [{ title: row.title }] },
    ...['2026-02-30', '1900-02-29', '0000-01-01', '2026-1-01', '2026-12-01T00:00:00Z'].map(dateAdministered =>
      ({ ...profile, vaccinations: [{ ...row, dateAdministered }] })),
    { ...profile, vaccinations: [{ ...row, nextDueDate: '2027-13-01' }] },
  ]) assert.equal(decode(invalid), null);
});

test('rejects private fields and keeps the legacy recovery rules for versioned profiles', () => {
  for (const key of ['vaccinationId', 'eventId', 'notes', 'photo', 'attachments', 'location', 'reminderSettings', 'historyUrl', 'status']) {
    assert.equal(decode({ ...profile, vaccinations: [{ ...row, [key]: 'private' }] }), null, key);
  }
  assert.equal(decode({ ...profile, privateNotes: 'private' }), null);
  assert.equal(decode({ ...profile, phone: 'javascript:1234567' }), null);
  assert.equal(decode({ ...profile, homeBase: { label: 'Home', coordinate: { latitude: 91, longitude: 0 } } }), null);
  assert.equal(decode({ ...profile, thumbnail: { path: 'pet-id-public/other.jpg', version: publicId } }), null);
});

test('rejects ambiguous Firestore fields, invalid containers and prototype keys', () => {
  for (const invalid of [
    { arrayValue: { values: {} } },
    { arrayValue: { values: [field(row)], extra: true } },
    { arrayValue: { values: [{ ...field(row), nullValue: null }] } },
    { arrayValue: { values: [{ mapValue: { fields: { ...field(row).mapValue.fields, ['__proto__']: { nullValue: null } } } }] } },
    { arrayValue: { values: [{ mapValue: { fields: { ...field(row).mapValue.fields, title: { stringValue: 123 } } } }] } },
  ]) {
    const doc = document(profile);
    doc.fields.vaccinations = invalid;
    assert.equal(Profile.decodeAndValidateProfile(doc, publicId), null);
  }
  const legacyDoc = document(legacy);
  legacyDoc.fields = { ...legacyDoc.fields, ['__proto__']: { nullValue: null } };
  assert.equal(Profile.decodeAndValidateProfile(legacyDoc, publicId), null);
});

test('keeps vaccinations after recovery and leaves the section absent on legacy profiles', () => {
  const sections = View.available(profile, publicId).sections;
  assert.deepEqual(sections.map(section => section.kind), ['ifFound', 'contact', 'homeBase', 'vaccinations']);
  assert.deepEqual(sections[3], {
    kind: 'vaccinations', rows: [row], attribution: 'Shared by the owner from their PetList records.',
  });
  assert.deepEqual(View.available(legacy, publicId).sections.map(section => section.kind), ['ifFound', 'contact', 'homeBase']);
});

test('preserves safe contact actions and exact fallback text with and without vaccinations', () => {
  const phone = '555-0100';
  const email = 'owner+pet@example.com';
  const unsupportedPhone = '++63  917 555 0142';
  const unsupportedEmail = 'owner\ud800@example.com';
  const call = { kind: 'call', href: 'tel:5550100', value: phone, primary: true };
  const text = { kind: 'text', href: 'sms:5550100', primary: false };
  const mail = { kind: 'email', href: 'mailto:owner%2Bpet@example.com', value: email, primary: true };

  for (const [contact, expected] of [
    [{ phone }, { actions: [call, text] }],
    [{ email }, { actions: [mail] }],
    [{ phone, email }, { actions: [call, text, { ...mail, primary: false }] }],
    [{ phone: unsupportedPhone }, { actions: [], plainPhone: unsupportedPhone }],
    [{ phone: unsupportedPhone, email }, { actions: [mail], plainPhone: unsupportedPhone }],
    [{ email: unsupportedEmail }, { actions: [], plainEmail: unsupportedEmail }],
  ]) {
    for (const optional of [{}, { schemaVersion: 2, vaccinations: [row] }]) {
      const input = { name: 'Luna', ...contact, ...optional };
      const decoded = decode(input);
      assert.deepEqual(decoded, input);
      const sections = View.available(decoded, publicId).sections;
      assert.deepEqual(sections[0], { kind: 'contact', ...expected });
      assert.deepEqual(sections.map(section => section.kind), optional.vaccinations ? ['contact', 'vaccinations'] : ['contact']);
    }
  }
});
