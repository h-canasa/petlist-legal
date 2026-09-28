/**
 * PET-477: the Finder View's v1 Pet ID decoder.
 *
 * This is a faithful, hand-ported mirror of the mobile app's canonical contract in
 * `petlist/src/utils/pet-id-payload.ts` (plus the validators it composes from
 * `pet-id-config.ts`, `home-base.ts` and `temperament.ts`, and the encoding helpers in
 * `base64url.ts`). The app repo is the source of truth; this file exists only because a static
 * site cannot import TypeScript from a private sibling repo. If the mobile contract changes,
 * this file and its tests must be updated in lock-step by hand — there is no shared build step
 * between the two repos.
 *
 * Decode-only: the Finder View never builds or encodes a Pet ID payload, so no encoder is
 * ported here. Every decode failure is total and non-throwing, exactly like the app's
 * `decodePetIdFragment`/`decodePetIdUrl` contract.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PetIdPayload = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants mirrored from the app's canonical modules.
  // ---------------------------------------------------------------------------

  var PET_ID_URL_BASE = 'https://mypetlist.app/pet-id/';
  var PET_ID_VERSION_MARKER = 'v1';

  var PET_ID_NAME_MAX_LENGTH = 80; // pet-id-payload.ts
  var PET_ID_BREED_MAX_LENGTH = 80; // pet-id-payload.ts
  var PET_ID_PHONE_MAX_LENGTH = 30; // pet-id-config.ts
  var PET_ID_EMAIL_MAX_LENGTH = 254; // pet-id-config.ts
  var PET_ID_IF_FOUND_MAX_LENGTH = 200; // pet-id-config.ts
  var HOME_BASE_LABEL_MAX_LENGTH = 80; // home-base.ts

  var SPECIES_VALUES = ['dog', 'cat', 'bird', 'other']; // lib/types.ts Species

  // temperament.ts TEMPERAMENT_TRAITS (id -> label), in the editor's canonical id order.
  var TEMPERAMENT_TRAITS = [
    { id: 'adventurous', label: 'Adventurous' },
    { id: 'affectionate', label: 'Affectionate' },
    { id: 'alert', label: 'Alert' },
    { id: 'aloof', label: 'Aloof' },
    { id: 'calm', label: 'Calm' },
    { id: 'cautious', label: 'Cautious' },
    { id: 'confident', label: 'Confident' },
    { id: 'cuddly', label: 'Cuddly' },
    { id: 'curious', label: 'Curious' },
    { id: 'energetic', label: 'Energetic' },
    { id: 'food-motivated', label: 'Food-motivated' },
    { id: 'friendly', label: 'Friendly' },
    { id: 'gentle', label: 'Gentle' },
    { id: 'independent', label: 'Independent' },
    { id: 'loyal', label: 'Loyal' },
    { id: 'playful', label: 'Playful' },
    { id: 'protective', label: 'Protective' },
    { id: 'quiet', label: 'Quiet' },
    { id: 'reserved', label: 'Reserved' },
    { id: 'shy', label: 'Shy' },
    { id: 'social', label: 'Social' },
    { id: 'stubborn', label: 'Stubborn' },
    { id: 'territorial', label: 'Territorial' },
    { id: 'vocal', label: 'Vocal' },
  ];

  var TEMPERAMENT_CONFLICT_PAIRS = [
    ['friendly', 'aloof'],
    ['energetic', 'calm'],
    ['playful', 'independent'],
    ['affectionate', 'reserved'],
    ['confident', 'shy'],
    ['social', 'territorial'],
    ['vocal', 'quiet'],
    ['adventurous', 'cautious'],
  ];

  var MAX_TEMPERAMENT_TRAITS = 5;

  var TRAIT_LABEL_BY_ID = {};
  var TRAIT_IDS = {};
  TEMPERAMENT_TRAITS.forEach(function (trait) {
    TRAIT_LABEL_BY_ID[trait.id] = trait.label;
    TRAIT_IDS[trait.id] = true;
  });

  var CONFLICT_BY_ID = {};
  TEMPERAMENT_CONFLICT_PAIRS.forEach(function (pair) {
    CONFLICT_BY_ID[pair[0]] = pair[1];
    CONFLICT_BY_ID[pair[1]] = pair[0];
  });

  function isTemperamentTraitId(value) {
    return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TRAIT_IDS, value);
  }

  function temperamentTraitLabel(id) {
    return Object.prototype.hasOwnProperty.call(TRAIT_LABEL_BY_ID, id) ? TRAIT_LABEL_BY_ID[id] : id;
  }

  /** Mirrors temperament.ts's `isValidTemperamentSelection` exactly. */
  function isValidTemperamentSelection(value) {
    if (!Array.isArray(value) || value.length > MAX_TEMPERAMENT_TRAITS) return false;
    var seen = {};
    for (var i = 0; i < value.length; i += 1) {
      var entry = value[i];
      if (!isTemperamentTraitId(entry) || seen[entry]) return false;
      var conflict = CONFLICT_BY_ID[entry];
      if (conflict && seen[conflict]) return false;
      seen[entry] = true;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Shape helpers mirrored from pet-id-payload.ts / home-base.ts.
  // ---------------------------------------------------------------------------

  function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  function hasOnlyKeys(value, keys) {
    return Object.keys(value).every(function (key) {
      return keys.indexOf(key) !== -1;
    });
  }

  function hasExactKeys(value, keys) {
    var actual = Object.keys(value);
    if (actual.length !== keys.length) return false;
    return keys.every(function (key) {
      return actual.indexOf(key) !== -1;
    });
  }

  function isTrimmedNonEmpty(value, maxLength) {
    if (typeof value !== 'string') return false;
    if (value !== value.trim()) return false;
    return value.length > 0 && value.length <= maxLength;
  }

  function isFiniteNumber(value) {
    return typeof value === 'number' && isFinite(value);
  }

  /** Mirrors home-base.ts's `isValidCoordinate` exactly. */
  function isValidCoordinate(value) {
    if (!isPlainObject(value)) return false;
    if (!hasExactKeys(value, ['latitude', 'longitude'])) return false;
    return (
      isFiniteNumber(value.latitude) &&
      value.latitude >= -90 &&
      value.latitude <= 90 &&
      isFiniteNumber(value.longitude) &&
      value.longitude >= -180 &&
      value.longitude <= 180
    );
  }

  /** Mirrors pet-id-config.ts's `isValidPetIdPhone` exactly (shape only, not deliverability). */
  function isValidPetIdPhone(value) {
    if (!isTrimmedNonEmpty(value, PET_ID_PHONE_MAX_LENGTH)) return false;
    if (!/[0-9]/.test(value)) return false;
    return /^[0-9+().\-–— ]+$/.test(value);
  }

  /** Mirrors pet-id-config.ts's `isValidPetIdEmail` exactly. */
  function isValidPetIdEmail(value) {
    if (!isTrimmedNonEmpty(value, PET_ID_EMAIL_MAX_LENGTH)) return false;
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
  }

  /** Mirrors pet-id-config.ts's `isValidPetIdIfFound` exactly. */
  function isValidPetIdIfFound(value) {
    return isTrimmedNonEmpty(value, PET_ID_IF_FOUND_MAX_LENGTH);
  }

  function isValidPublicHomeBase(value) {
    if (!isPlainObject(value)) return false;
    if (!hasExactKeys(value, ['label', 'coordinate'])) return false;
    if (!isTrimmedNonEmpty(value.label, HOME_BASE_LABEL_MAX_LENGTH)) return false;
    if (value.coordinate !== null && !isValidCoordinate(value.coordinate)) return false;
    return true;
  }

  var PET_ID_PUBLIC_PAYLOAD_KEYS = [
    'name',
    'phone',
    'email',
    'ifFound',
    'species',
    'breed',
    'temperament',
    'homeBase',
  ];

  /**
   * Mirrors pet-id-payload.ts's `evaluatePetIdPublicPayload` exactly: the single semantic
   * authority for what a valid v1 public payload is. Returns the first failing rule, or `null`
   * when valid. Same fixed check order as the app (name, contact, ifFound, species, breed,
   * temperament, Home Base).
   */
  function evaluatePetIdPublicPayload(value) {
    if (!isPlainObject(value)) return 'invalidShape';
    if (!hasOnlyKeys(value, PET_ID_PUBLIC_PAYLOAD_KEYS)) return 'invalidShape';

    if (!isTrimmedNonEmpty(value.name, PET_ID_NAME_MAX_LENGTH)) return 'invalidName';

    var hasPhone = value.phone !== undefined;
    var hasEmail = value.email !== undefined;
    if (hasPhone && !isValidPetIdPhone(value.phone)) return 'invalidContact';
    if (hasEmail && !isValidPetIdEmail(value.email)) return 'invalidContact';
    if (!hasPhone && !hasEmail) return 'invalidContact';

    if (value.ifFound !== undefined && !isValidPetIdIfFound(value.ifFound)) {
      return 'invalidIfFound';
    }

    if (value.species !== undefined && SPECIES_VALUES.indexOf(value.species) === -1) {
      return 'invalidSpecies';
    }

    if (value.breed !== undefined && !isTrimmedNonEmpty(value.breed, PET_ID_BREED_MAX_LENGTH)) {
      return 'invalidBreed';
    }

    if (value.temperament !== undefined) {
      if (!Array.isArray(value.temperament) || value.temperament.length === 0) {
        return 'invalidTemperament';
      }
      if (!isValidTemperamentSelection(value.temperament)) return 'invalidTemperament';
    }

    if (value.homeBase !== undefined && !isValidPublicHomeBase(value.homeBase)) {
      return 'invalidHomeBase';
    }

    return null;
  }

  function isValidPetIdPublicPayload(value) {
    return evaluatePetIdPublicPayload(value) === null;
  }

  // ---------------------------------------------------------------------------
  // base64url + strict UTF-8, mirrored from base64url.ts (decode-only).
  // ---------------------------------------------------------------------------

  var BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  var BASE64URL_VALUES = {};
  for (var bi = 0; bi < BASE64URL_ALPHABET.length; bi += 1) {
    BASE64URL_VALUES[BASE64URL_ALPHABET[bi]] = bi;
  }

  /** Mirrors base64url.ts's `base64UrlDecodeBytes` exactly, including its strictness rules. */
  function base64UrlDecodeBytes(value) {
    if (value.length === 0) return null;
    if (value.length % 4 === 1) return null;
    var bytes = [];
    for (var i = 0; i < value.length; i += 4) {
      var group = [value[i], value[i + 1], value[i + 2], value[i + 3]];
      var sextets = [];
      for (var g = 0; g < group.length; g += 1) {
        var character = group[g];
        if (character === undefined) break;
        var sextet = BASE64URL_VALUES[character];
        if (sextet === undefined) return null;
        sextets.push(sextet);
      }
      if (sextets.length === 1) return null;
      bytes.push((sextets[0] << 2) | (sextets[1] >> 4));
      if (sextets.length === 2) {
        if ((sextets[1] & 0x0f) !== 0) return null;
        break;
      }
      bytes.push(((sextets[1] & 0x0f) << 4) | (sextets[2] >> 2));
      if (sextets.length === 3) {
        if ((sextets[2] & 0x03) !== 0) return null;
        break;
      }
      bytes.push(((sextets[2] & 0x03) << 6) | sextets[3]);
    }
    return bytes;
  }

  /** Mirrors base64url.ts's `utf8Decode` exactly: strict, total, rejects overlong/surrogate. */
  function utf8Decode(bytes) {
    var result = '';
    var i = 0;
    while (i < bytes.length) {
      var first = bytes[i];
      var codePoint;
      var length;
      if (first <= 0x7f) {
        codePoint = first;
        length = 1;
      } else if (first >= 0xc2 && first <= 0xdf) {
        codePoint = first & 0x1f;
        length = 2;
      } else if (first >= 0xe0 && first <= 0xef) {
        codePoint = first & 0x0f;
        length = 3;
      } else if (first >= 0xf0 && first <= 0xf4) {
        codePoint = first & 0x07;
        length = 4;
      } else {
        return null;
      }
      if (i + length > bytes.length) return null;
      for (var offset = 1; offset < length; offset += 1) {
        var continuation = bytes[i + offset];
        if ((continuation & 0xc0) !== 0x80) return null;
        codePoint = (codePoint << 6) | (continuation & 0x3f);
      }
      if (length === 3 && codePoint < 0x800) return null;
      if (length === 4 && codePoint < 0x10000) return null;
      if (codePoint >= 0xd800 && codePoint <= 0xdfff) return null;
      if (codePoint > 0x10ffff) return null;
      result += String.fromCodePoint(codePoint);
      i += length;
    }
    return result;
  }

  function base64UrlDecodeUtf8(value) {
    var bytes = base64UrlDecodeBytes(value);
    if (bytes === null) return null;
    return utf8Decode(bytes);
  }

  // ---------------------------------------------------------------------------
  // Decoding, mirrored from pet-id-payload.ts's `mapEncodedToPayload` / `parseEncoded` /
  // `decodePetIdFragment` / `decodePetIdUrl`.
  // ---------------------------------------------------------------------------

  var ENCODED_KEYS = ['n', 'p', 'e', 'f', 's', 'b', 't', 'h'];

  function mapEncodedToPayload(value) {
    var payload = { name: value.n };
    if (value.p !== undefined) payload.phone = value.p;
    if (value.e !== undefined) payload.email = value.e;
    if (value.f !== undefined) payload.ifFound = value.f;
    if (value.s !== undefined) payload.species = value.s;
    if (value.b !== undefined) payload.breed = value.b;
    if (value.t !== undefined) payload.temperament = value.t;

    if (value.h !== undefined) {
      if (!isPlainObject(value.h)) return null;
      var hKeys = Object.keys(value.h);
      for (var i = 0; i < hKeys.length; i += 1) {
        if (hKeys[i] !== 'l' && hKeys[i] !== 'c') return null;
      }
      var homeBase = { label: value.h.l, coordinate: null };
      if (value.h.c !== undefined) {
        if (!Array.isArray(value.h.c) || value.h.c.length !== 2) return null;
        homeBase.coordinate = { latitude: value.h.c[0], longitude: value.h.c[1] };
      }
      payload.homeBase = homeBase;
    }

    return payload;
  }

  function parseEncoded(value) {
    if (!isPlainObject(value)) return null;
    var keys = Object.keys(value);
    for (var i = 0; i < keys.length; i += 1) {
      if (ENCODED_KEYS.indexOf(keys[i]) === -1) return null;
    }
    var candidate = mapEncodedToPayload(value);
    if (candidate === null) return null;
    return isValidPetIdPublicPayload(candidate) ? candidate : null;
  }

  function fail(reason, version) {
    return version === undefined ? { ok: false, reason: reason } : { ok: false, reason: reason, version: version };
  }

  /** Decodes a `v1.<base64url>` fragment body (with or without a leading `#`). Total, non-throwing. */
  function decodePetIdFragment(fragment) {
    var body = fragment.indexOf('#') === 0 ? fragment.slice(1) : fragment;
    var separator = body.indexOf('.');
    if (separator <= 0) return fail('notPetIdUrl');
    var version = body.slice(0, separator);
    var encoded = body.slice(separator + 1);
    if (!/^v[0-9]+$/.test(version)) return fail('notPetIdUrl');
    if (version !== PET_ID_VERSION_MARKER) return fail('unsupportedVersion', version);
    var json = base64UrlDecodeUtf8(encoded);
    if (json === null) return fail('malformedEncoding', version);
    var parsed;
    try {
      parsed = JSON.parse(json);
    } catch (error) {
      return fail('malformedJson', version);
    }
    var payload = parseEncoded(parsed);
    return payload === null ? fail('malformedPayload', version) : { ok: true, payload: payload };
  }

  /** Decodes a full Pet ID URL: origin+path must match `PET_ID_URL_BASE` exactly (string compare). */
  function decodePetIdUrl(url) {
    var hashIndex = url.indexOf('#');
    if (hashIndex === -1) return fail('notPetIdUrl');
    if (url.slice(0, hashIndex) !== PET_ID_URL_BASE) return fail('notPetIdUrl');
    return decodePetIdFragment(url.slice(hashIndex + 1));
  }

  return {
    PET_ID_URL_BASE: PET_ID_URL_BASE,
    PET_ID_VERSION_MARKER: PET_ID_VERSION_MARKER,
    SPECIES_VALUES: SPECIES_VALUES,
    TEMPERAMENT_TRAITS: TEMPERAMENT_TRAITS,
    MAX_TEMPERAMENT_TRAITS: MAX_TEMPERAMENT_TRAITS,
    temperamentTraitLabel: temperamentTraitLabel,
    isValidTemperamentSelection: isValidTemperamentSelection,
    isValidCoordinate: isValidCoordinate,
    isValidPetIdPhone: isValidPetIdPhone,
    isValidPetIdEmail: isValidPetIdEmail,
    isValidPetIdIfFound: isValidPetIdIfFound,
    isValidPetIdPublicPayload: isValidPetIdPublicPayload,
    evaluatePetIdPublicPayload: evaluatePetIdPublicPayload,
    base64UrlDecodeUtf8: base64UrlDecodeUtf8,
    decodePetIdFragment: decodePetIdFragment,
    decodePetIdUrl: decodePetIdUrl,
  };
});
