'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Sentences = require('../pet-id/sentences.js');
const Payload = require('../pet-id/payload.js');

// ---- PET-478: Line 2 conversational grammar ----
// Locked rules (see sentences.js's own comment for the root cause): a simple
// "I am a <breed> <species>." template reads wrong for real data ("I am a Abyssinian cat.") and
// a first-letter a/an heuristic is unreliable since Breed is free text ("European ..."). These
// tests match the ticket's exact locked copy.

test('cat + Siberian: "I am a cat, and my breed is Siberian."', () => {
  assert.equal(Sentences.breedSpeciesSentence('Siberian', 'cat'), 'I am a cat, and my breed is Siberian.');
});

test('cat + Abyssinian: "I am a cat, and my breed is Abyssinian." (not "I am a Abyssinian cat.")', () => {
  assert.equal(
    Sentences.breedSpeciesSentence('Abyssinian', 'cat'),
    'I am a cat, and my breed is Abyssinian.'
  );
});

test('dog + Australian Shepherd: "I am a dog, and my breed is Australian Shepherd."', () => {
  assert.equal(
    Sentences.breedSpeciesSentence('Australian Shepherd', 'dog'),
    'I am a dog, and my breed is Australian Shepherd.'
  );
});

test('dog species-only: "I am a dog."', () => {
  assert.equal(Sentences.breedSpeciesSentence(undefined, 'dog'), 'I am a dog.');
});

test('cat species-only: "I am a cat."', () => {
  assert.equal(Sentences.breedSpeciesSentence(undefined, 'cat'), 'I am a cat.');
});

test('bird species-only: "I am a bird."', () => {
  assert.equal(Sentences.breedSpeciesSentence(undefined, 'bird'), 'I am a bird.');
});

test('breed-only (no species): "My breed is <Breed>."', () => {
  assert.equal(Sentences.breedSpeciesSentence('Siberian', undefined), 'My breed is Siberian.');
});

test('species=other + breed: "My breed is <Breed>." -- never "I am a other ..."', () => {
  const sentence = Sentences.breedSpeciesSentence('Siberian', 'other');
  assert.equal(sentence, 'My breed is Siberian.');
  assert.doesNotMatch(sentence, /\bother\b/);
});

test('species=other without breed: "I am another kind of pet."', () => {
  assert.equal(Sentences.breedSpeciesSentence(undefined, 'other'), 'I am another kind of pet.');
});

test('neither breed nor species: sentence omitted (null), no placeholder', () => {
  assert.equal(Sentences.breedSpeciesSentence(undefined, undefined), null);
});

test('preserves the breed value exactly as supplied, no re-casing/trimming/rewriting', () => {
  assert.equal(
    Sentences.breedSpeciesSentence('siberian FOREST cat', 'cat'),
    'I am a cat, and my breed is siberian FOREST cat.'
  );
});

test('a breed starting with a vowel sound never needs an "an" heuristic (European ...)', () => {
  assert.equal(
    Sentences.breedSpeciesSentence('European Shorthair', 'cat'),
    'I am a cat, and my breed is European Shorthair.'
  );
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

// ---- PET-479: safe mailto URI construction ----
// The canonical v1 email validator (payload.js's isValidPetIdEmail, mirroring
// pet-id-config.ts's isValidPetIdPhone/Email) allows local parts containing URI-reserved
// characters such as `?` and `#`, which raw `'mailto:' + email` concatenation would
// misinterpret as the start of a query string or fragment -- silently changing the recipient.

test('ordinary address is unaffected', () => {
  assert.equal(Sentences.safeMailtoUri('owner@example.com'), 'mailto:owner@example.com');
});

test('plus-addressing survives round-trip: percent-encoded in the URI, recovers exactly on decode', () => {
  // encodeURIComponent escapes "+" to "%2B" (unlike application/x-www-form-urlencoded, mailto's
  // addr-spec has no "+ means space" convention, so this is correct, not a bug) -- what matters
  // is that it decodes back to the original address unchanged, not the literal URI spelling.
  const uri = Sentences.safeMailtoUri('owner+petid@example.com');
  assert.equal(uri, 'mailto:owner%2Bpetid@example.com');
  assert.equal(decodeURIComponent(uri.slice('mailto:'.length)), 'owner+petid@example.com');
});

test('an app-valid local part containing "?" is percent-encoded, not left as a query separator', () => {
  const uri = Sentences.safeMailtoUri('a?b@example.com');
  assert.equal(uri, 'mailto:a%3Fb@example.com');
  assert.doesNotMatch(uri, /\?/);
});

test('an app-valid local part containing "#" is percent-encoded, not left as a fragment separator', () => {
  const uri = Sentences.safeMailtoUri('a#b@example.com');
  assert.equal(uri, 'mailto:a%23b@example.com');
  assert.doesNotMatch(uri, /#/);
});

test('percent-decoding the resulting URI recovers exactly the original validated address', () => {
  const original = 'a?weird#local@example.com';
  const uri = Sentences.safeMailtoUri(original);
  const withoutScheme = uri.slice('mailto:'.length);
  const separator = withoutScheme.indexOf('@');
  const recovered =
    decodeURIComponent(withoutScheme.slice(0, separator)) +
    '@' +
    decodeURIComponent(withoutScheme.slice(separator + 1));
  assert.equal(recovered, original);
});

test('the resulting URI never contains an unintended query or fragment: exactly one "@" and no bare "?"/"#"', () => {
  for (const email of ['a?b@example.com', 'a#b@example.com', 'a?b#c@example.com']) {
    const uri = Sentences.safeMailtoUri(email);
    assert.equal((uri.match(/@/g) || []).length, 1);
    assert.doesNotMatch(uri, /[?#]/);
  }
});

test('safeMailtoUri does not add subject/body/cc/bcc or any other mailto parameter', () => {
  assert.doesNotMatch(Sentences.safeMailtoUri('owner@example.com'), /[?&](subject|body|cc|bcc)=/i);
});
