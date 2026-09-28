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
   * Line 2: "I am a <breed> <species>." / "I am a <species>." / "I am a <breed>." / omitted
   * entirely when neither exists. `species` is expected already in its natural-noun form
   * (the stored wire values 'dog'/'cat'/'bird'/'other' already read that way).
   */
  function breedSpeciesSentence(breed, species) {
    var hasBreed = typeof breed === 'string' && breed.length > 0;
    var hasSpecies = typeof species === 'string' && species.length > 0;
    if (hasBreed && hasSpecies) return 'I am a ' + breed + ' ' + species + '.';
    if (hasSpecies) return 'I am a ' + species + '.';
    if (hasBreed) return 'I am a ' + breed + '.';
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
