/**
 * PET-477: pure text/URI builders for the Finder View's conversational hero, If Found line
 * splitting, and (PET-479) safe `mailto:` construction. No DOM here — kept separate from
 * `main.js` so this logic is unit testable with Node's built-in test runner without a browser.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PetIdSentences = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * "a, b" -> "a and b"; "a, b, c" -> "a, b, and c" (Oxford comma). Never sorts — callers pass
   * items in the owner's persisted order.
   */
  function naturalLanguageList(items) {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
  }

  /**
   * PET-478: Line 2's conversational grammar. The straightforward "I am a <breed> <species>."
   * template read wrong for real PetList data ("I am a Abyssinian cat.", and outright wrong for
   * species `other`: "I am a other."). Breed is free text an owner typed (no controlled
   * vocabulary), so a first-letter a/an heuristic is not reliable either (e.g. "European ...").
   * These locked rules sidestep both problems by never needing an article in front of Breed:
   *
   *   dog/cat/bird + breed  -> "I am a <species>, and my breed is <Breed>."
   *   dog/cat/bird, no breed -> "I am a <species>."
   *   breed, no species      -> "My breed is <Breed>."
   *   other + breed          -> "My breed is <Breed>." (never "I am a other ...")
   *   other, no breed        -> "I am another kind of pet."
   *   neither                -> omitted (null), no placeholder
   *
   * Breed is passed straight through — never re-cased, trimmed, or otherwise rewritten.
   */
  var NAMED_SPECIES = { dog: true, cat: true, bird: true };

  function breedSpeciesSentence(breed, species) {
    var hasBreed = typeof breed === 'string' && breed.length > 0;
    var isNamedSpecies = typeof species === 'string' && NAMED_SPECIES[species] === true;
    var isOtherSpecies = species === 'other';

    if (isNamedSpecies && hasBreed) return 'I am a ' + species + ', and my breed is ' + breed + '.';
    if (isNamedSpecies) return 'I am a ' + species + '.';
    if (isOtherSpecies && hasBreed) return 'My breed is ' + breed + '.';
    if (isOtherSpecies) return 'I am another kind of pet.';
    if (hasBreed) return 'My breed is ' + breed + '.';
    return null;
  }

  /**
   * Line 3: "I am <natural-language temperament list>." Omitted when temperament is absent.
   * `labels` are looked up by the caller (see `payload.js`'s `temperamentTraitLabel`) and
   * passed here already in the owner's persisted order — this function never reorders them.
   */
  function temperamentSentence(labels) {
    if (!labels || labels.length === 0) return null;
    return 'I am ' + naturalLanguageList(labels) + '.';
  }

  /**
   * Splits an "If Found" value on any line-break style into an array of lines, preserving
   * empty lines and Unicode content exactly. Callers render each entry as its own text node
   * (joined with real `<br>` elements) — never as HTML, so this never needs to escape anything.
   */
  function ifFoundLines(value) {
    return String(value).split(/\r\n|\r|\n/);
  }

  /**
   * PET-479: builds a `mailto:` URI whose recipient always matches the validated, visible
   * `email` value — even when raw concatenation would not. The canonical v1 email validator
   * (`isValidPetIdEmail` in payload.js, mirroring the app's `pet-id-config.ts`) allows any
   * non-whitespace, non-`@` local part, which includes URI-reserved characters like `?` and `#`.
   * `'mailto:' + email` for an address such as `a?b@example.com` produces `mailto:a?b@example.com`
   * — a URI whose query string is `b@example.com`, so the actual recipient becomes just `a`, not
   * the address that was displayed. That validator is never tightened here; this only changes
   * how an already-valid address is placed into a URI.
   *
   * The validator guarantees exactly one `@` (the local part's own char class excludes `@`), so
   * splitting on the first occurrence is exact — never a heuristic. Each side is
   * `encodeURIComponent`-escaped independently and rejoined on a literal `@`, which
   * percent-encodes any reserved character (`?`, `#`, `/`, `&`, ...) without touching the address
   * separator itself. No subject/body/cc/bcc or other mailto parameters are ever added.
   */
  function safeMailtoUri(email) {
    var separator = email.indexOf('@');
    var local = email.slice(0, separator);
    var domain = email.slice(separator + 1);
    return 'mailto:' + encodeURIComponent(local) + '@' + encodeURIComponent(domain);
  }

  return {
    naturalLanguageList: naturalLanguageList,
    breedSpeciesSentence: breedSpeciesSentence,
    temperamentSentence: temperamentSentence,
    ifFoundLines: ifFoundLines,
    safeMailtoUri: safeMailtoUri,
  };
});
