'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Profile = require('../p/profile.js');
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
const decode = value => Profile.decodeAndValidateProfile({ fields: field(value).mapValue.fields }, publicId);

test('PET-674: reads legacy and versioned profiles, including exactly 50 long titles', () => {
  assert.deepEqual(decode(legacy), legacy);
  assert.deepEqual(decode(profile), profile);
  const maximum = { ...profile, vaccinations: Array.from({ length: 50 }, () => ({ ...row, title: 'x'.repeat(200) })) };
  assert.deepEqual(decode(maximum), maximum);
});

test('PET-674: strictly rejects dates, versions, payload bounds and private fields', () => {
  for (const invalid of [
    { ...profile, schemaVersion: 3 }, { ...legacy, vaccinations: [row] },
    { ...profile, vaccinations: [] }, { ...profile, vaccinations: Array.from({ length: 51 }, () => row) },
    { ...profile, vaccinations: [{ ...row, title: 'x'.repeat(201) }] },
    { ...profile, vaccinations: [{ ...row, dateAdministered: '2026-02-30' }] },
    ...['vaccinationId', 'eventId', 'notes', 'attachments', 'location', 'reminderSettings'].map(key =>
      ({ ...profile, vaccinations: [{ ...row, [key]: 'private' }] })),
  ]) assert.equal(decode(invalid), null);
  assert.deepEqual(decode({ ...profile, vaccinations: [{ ...row, dateAdministered: '2024-02-29' }] }).vaccinations[0].dateAdministered, '2024-02-29');
});

test('PET-674: preserves recovery-first order and exposes read-only latest rows only', () => {
  const sections = View.available(profile, publicId).sections;
  assert.deepEqual(sections.map(section => section.kind), ['ifFound', 'contact', 'homeBase', 'vaccinations']);
  assert.deepEqual(sections[3], { kind: 'vaccinations', rows: [row], attribution: 'Shared by the owner from their PetList records.' });
  assert.equal(View.available(legacy, publicId).sections.some(section => section.kind === 'vaccinations'), false);
  const source = fs.readFileSync(require.resolve('../p/main.js'), 'utf8');
  assert.doesNotMatch(source, /innerHTML|vaccinationId|eventId|Send my location|Updated/);
});

test('PET-674: the actual DOM renderer keeps hostile vaccination titles as text and adds no history links', async () => {
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.classList = { add() {} }; }
    append(...children) { this.children.push(...children); }
    querySelector() { return null; }
    setAttribute() {}
    removeAttribute() {}
    addEventListener() {}
    replaceChildren(...children) { this.children = children; }
  }
  const root = new Element('root');
  const hostile = '<img src=x onerror=alert(1)>';
  const document = { querySelector: () => root, createElement: tag => new Element(tag),
    createElementNS: (_namespace, tag) => new Element(tag), createDocumentFragment: () => new Element('fragment') };
  const window = { location: { search: '?id=' + publicId }, fetch() {}, PetIdView: View,
    PetIdLoad: { loadHostedProfile: async () => ({ kind: 'available', profile: { ...profile, vaccinations: [{ ...row, title: hostile }] } }) } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../p/main.js'), 'utf8'), { document, window, URLSearchParams, Intl, Date });
  await new Promise(resolve => setImmediate(resolve));
  const flatten = node => [node, ...node.children.flatMap(flatten)];
  const nodes = flatten(root);
  const vaccination = nodes.find(node => node.className === 'recovery-section vaccinations');
  assert.ok(vaccination);
  const vaccinationNodes = flatten(vaccination);
  assert.ok(vaccinationNodes.some(node => node.textContent === hostile));
  assert.equal(vaccinationNodes.some(node => node.tag === 'a' || node.tag === 'img'), false);
  assert.ok(vaccinationNodes.some(node => node.textContent === 'Shared by the owner from their PetList records.'));
});
