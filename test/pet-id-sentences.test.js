'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Sentences = require('../pet-id/sentences.js');
const Payload = require('../pet-id/payload.js');

// ---- Line 2: breed / species sentence wording (cases 5-8) ----

test('both breed and species: "I am a <breed> <species>."', () => {
  assert.equal(Sentences.breedSpeciesSentence('Siberian', 'cat'), 'I am a Siberian cat.');
});

test('species only: "I am a <species>."', () => {
  assert.equal(Sentences.breedSpeciesSentence(undefined, 'cat'), 'I am a cat.');
});

test('breed only: "I am a <breed>."', () => {
  assert.equal(Sentences.breedSpeciesSentence('Siberian', undefined), 'I am a Siberian.');
});

test('neither breed nor species: sentence omitted (null), no placeholder', () => {
  assert.equal(Sentences.breedSpeciesSentence(undefined, undefined), null);
});

test('preserves the breed value exactly as supplied, no re-casing', () => {
  assert.equal(Sentences.breedSpeciesSentence('siberian FOREST cat', 'cat'), 'I am a siberian FOREST cat cat.');
});

// ---- Line 3: temperament sentence and natural-language list grammar (cases 9-13) ----

test('naturalLanguageList: one item', () => {
  assert.equal(Sentences.naturalLanguageList(['Playful']), 'Playful');
});

test('naturalLanguageList: two items joined with "and", no comma', () => {
  assert.equal(Sentences.naturalLanguageList(['Playful', 'Social']), 'Playful and Social');
});

test('naturalLanguageList: three items use an Oxford comma', () => {
  assert.equal(
    Sentences.naturalLanguageList(['Adventurous', 'Confident', 'Playful']),
    'Adventurous, Confident, and Playful'
  );
});

test('naturalLanguageList: five items, Oxford comma, order preserved (not sorted)', () => {
  assert.equal(
    Sentences.naturalLanguageList(['Social', 'Adventurous', 'Playful', 'Confident', 'Energetic']),
    'Social, Adventurous, Playful, Confident, and Energetic'
  );
});

// main.js lowercases the canonical (capitalised, chip-display) labels before handing them to
// temperamentSentence, since they read as predicate adjectives inside a sentence ("I am playful
// and social.") rather than as standalone chip text -- see main.js's renderHero comment.
// temperamentSentence itself is casing-agnostic; these tests pass it lowercase input to match
// that real call site and the ticket's literal example copy.

test('temperamentSentence: one trait matches the locked example copy', () => {
  assert.equal(Sentences.temperamentSentence(['playful']), 'I am playful.');
});

test('temperamentTraitLabel returns the canonical (capitalised) chip-display label', () => {
  // The capitalised form is correct for chip/list display elsewhere in PetList; main.js is
  // responsible for lowercasing it before it reaches a sentence -- see the two tests below.
  assert.equal(Payload.temperamentTraitLabel('playful'), 'Playful');
});

test('temperamentSentence: two traits -> "and", no comma, matches the locked example copy', () => {
  assert.equal(Sentences.temperamentSentence(['playful', 'social']), 'I am playful and social.');
});

test('temperamentSentence: three traits -> Oxford comma list, matches the locked example copy', () => {
  assert.equal(
    Sentences.temperamentSentence(['adventurous', 'confident', 'playful']),
    'I am adventurous, confident, and playful.'
  );
});

test('temperamentSentence: five traits matches the locked example copy exactly', () => {
  assert.equal(
    Sentences.temperamentSentence(['adventurous', 'confident', 'energetic', 'social', 'playful']),
    'I am adventurous, confident, energetic, social, and playful.'
  );
});

test('temperamentSentence: empty selection is omitted (null), never an empty sentence', () => {
  assert.equal(Sentences.temperamentSentence([]), null);
  assert.equal(Sentences.temperamentSentence(undefined), null);
});

test('temperamentTraitLabel maps every canonical id used by decoded payloads to its display label', () => {
  assert.equal(Payload.temperamentTraitLabel('food-motivated'), 'Food-motivated');
  assert.equal(Payload.temperamentTraitLabel('adventurous'), 'Adventurous');
});

// ---- If Found line splitting ----

test('ifFoundLines splits on \\n and preserves each line exactly, including Unicode', () => {
  assert.deepEqual(Sentences.ifFoundLines('Line one.\nLine two.\nLine three.'), [
    'Line one.',
    'Line two.',
    'Line three.',
  ]);
});

test('ifFoundLines also splits on \\r\\n and bare \\r', () => {
  assert.deepEqual(Sentences.ifFoundLines('a\r\nb\rc'), ['a', 'b', 'c']);
});

test('ifFoundLines preserves emoji/Unicode content untouched', () => {
  assert.deepEqual(Sentences.ifFoundLines('Please call! 🐾\nGracias 感謝'), [
    'Please call! 🐾',
    'Gracias 感謝',
  ]);
});
