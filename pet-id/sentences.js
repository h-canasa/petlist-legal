/**
 * PET-477: pure text builders for the Finder View's conversational hero and If Found line
 * splitting. No DOM here — kept separate from `main.js` so the sentence grammar is unit
 * testable with Node's built-in test runner without a browser.
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

  return {
    naturalLanguageList: naturalLanguageList,
    breedSpeciesSentence: breedSpeciesSentence,
    temperamentSentence: temperamentSentence,
    ifFoundLines: ifFoundLines,
  };
});
