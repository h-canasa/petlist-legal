'use strict';

(function init(factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PetIdProfile = api;
})(function createProfileApi() {
  const PROJECT_ID = 'petlist-cad8b';
  const STORAGE_BUCKET = 'petlist-cad8b.firebasestorage.app';
  const AUTHORITY_PATTERN = /^[A-Za-z0-9_-]{21}[AQgw]$/;
  const PROFILE_KEYS = ['name', 'phone', 'email', 'ifFound', 'homeBase', 'temperament', 'thumbnail'];
  const TRAITS = {
    adventurous: 'Adventurous', affectionate: 'Affectionate', alert: 'Alert', aloof: 'Aloof',
    calm: 'Calm', cautious: 'Cautious', confident: 'Confident', cuddly: 'Cuddly', curious: 'Curious',
    energetic: 'Energetic', 'food-motivated': 'Food-motivated', friendly: 'Friendly', gentle: 'Gentle',
    independent: 'Independent', loyal: 'Loyal', playful: 'Playful', protective: 'Protective', quiet: 'Quiet',
    reserved: 'Reserved', shy: 'Shy', social: 'Social', stubborn: 'Stubborn', territorial: 'Territorial',
    vocal: 'Vocal',
  };
  const CONFLICTS = [
    ['friendly', 'aloof'], ['energetic', 'calm'], ['playful', 'independent'],
    ['affectionate', 'reserved'], ['confident', 'shy'], ['social', 'territorial'],
    ['vocal', 'quiet'], ['adventurous', 'cautious'],
  ];

  function isPlainObject(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function hasExactKeys(value, expected) {
    const actual = Object.keys(value);
    return actual.length === expected.length && expected.every((key) => actual.includes(key));
  }

  function hasOnlyKeys(value, allowed) {
    return Object.keys(value).every((key) => allowed.includes(key));
  }

  function isPetIdPublicId(value) {
    return typeof value === 'string' && AUTHORITY_PATTERN.test(value);
  }

  function isTrimmedBounded(value, maximum) {
    return typeof value === 'string' && value === value.trim() && value.length > 0 && value.length <= maximum;
  }

  function isValidPhone(value) {
    return isTrimmedBounded(value, 30) && /[0-9]/.test(value) && /^[0-9+().\-–— ]+$/.test(value);
  }

  function isValidEmail(value) {
    return isTrimmedBounded(value, 254) && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
  }

  function isValidCoordinate(value) {
    return isPlainObject(value) && hasExactKeys(value, ['latitude', 'longitude']) &&
      typeof value.latitude === 'number' && Number.isFinite(value.latitude) && value.latitude >= -90 && value.latitude <= 90 &&
      typeof value.longitude === 'number' && Number.isFinite(value.longitude) && value.longitude >= -180 && value.longitude <= 180;
  }

  function isValidHomeBase(value) {
    return isPlainObject(value) && hasExactKeys(value, ['label', 'coordinate']) &&
      isTrimmedBounded(value.label, 80) && (value.coordinate === null || isValidCoordinate(value.coordinate));
  }

  function isValidTemperament(value) {
    if (!Array.isArray(value) || value.length === 0 || value.length > 5) return false;
    const seen = new Set();
    for (const id of value) {
      if (typeof id !== 'string' || !Object.hasOwn(TRAITS, id) || seen.has(id)) return false;
      if (CONFLICTS.some(([left, right]) =>
        (id === left && seen.has(right)) || (id === right && seen.has(left)))) return false;
      seen.add(id);
    }
    return true;
  }

  function isValidThumbnail(value, requestedPublicId) {
    if (!isPlainObject(value) || !hasExactKeys(value, ['path', 'version'])) return false;
    if (!isPetIdPublicId(value.version)) return false;
    const expected = `pet-id-public/${requestedPublicId}/${value.version}.jpg`;
    return value.path === expected;
  }

  function isValidProfile(value, requestedPublicId) {
    if (!isPlainObject(value) || !hasOnlyKeys(value, PROFILE_KEYS)) return false;
    if (!isTrimmedBounded(value.name, 80)) return false;
    if (value.phone !== undefined && !isValidPhone(value.phone)) return false;
    if (value.email !== undefined && !isValidEmail(value.email)) return false;
    if (value.phone === undefined && value.email === undefined) return false;
    if (value.ifFound !== undefined && !isTrimmedBounded(value.ifFound, 200)) return false;
    if (value.homeBase !== undefined && !isValidHomeBase(value.homeBase)) return false;
    if (value.temperament !== undefined && !isValidTemperament(value.temperament)) return false;
    if (value.thumbnail !== undefined && !isValidThumbnail(value.thumbnail, requestedPublicId)) return false;
    return true;
  }

  function decodeNumber(field) {
    if (Object.hasOwn(field, 'doubleValue')) {
      return typeof field.doubleValue === 'number' && Number.isFinite(field.doubleValue) ? field.doubleValue : undefined;
    }
    if (Object.hasOwn(field, 'integerValue')) {
      if (typeof field.integerValue !== 'string' || !/^-?(0|[1-9][0-9]*)$/.test(field.integerValue)) return undefined;
      const parsed = Number(field.integerValue);
      return Number.isSafeInteger(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  function decodeFirestoreValue(field) {
    if (!isPlainObject(field) || Object.keys(field).length !== 1) return undefined;
    if (Object.hasOwn(field, 'stringValue')) return typeof field.stringValue === 'string' ? field.stringValue : undefined;
    if (Object.hasOwn(field, 'nullValue')) return field.nullValue === null ? null : undefined;
    const number = decodeNumber(field);
    if (number !== undefined) return number;
    if (Object.hasOwn(field, 'arrayValue')) {
      if (!isPlainObject(field.arrayValue) || !hasOnlyKeys(field.arrayValue, ['values'])) return undefined;
      const values = field.arrayValue.values === undefined ? [] : field.arrayValue.values;
      if (!Array.isArray(values)) return undefined;
      const decoded = [];
      for (const entry of values) {
        const result = decodeFirestoreValue(entry);
        if (result === undefined) return undefined;
        decoded.push(result);
      }
      return decoded;
    }
    if (Object.hasOwn(field, 'mapValue')) {
      if (!isPlainObject(field.mapValue) || !hasOnlyKeys(field.mapValue, ['fields'])) return undefined;
      const fields = field.mapValue.fields === undefined ? {} : field.mapValue.fields;
      return decodeFirestoreFields(fields);
    }
    return undefined;
  }

  function decodeFirestoreFields(fields) {
    if (!isPlainObject(fields)) return undefined;
    const decoded = {};
    for (const [key, field] of Object.entries(fields)) {
      const value = decodeFirestoreValue(field);
      if (value === undefined) return undefined;
      decoded[key] = value;
    }
    return decoded;
  }

  function decodeAndValidateProfile(document, requestedPublicId) {
    if (!isPetIdPublicId(requestedPublicId) || !isPlainObject(document)) return null;
    if (!hasOnlyKeys(document, ['name', 'fields', 'createTime', 'updateTime'])) return null;
    if (!isPlainObject(document.fields)) return null;
    if (document.name !== undefined && typeof document.name !== 'string') return null;
    if (document.createTime !== undefined && typeof document.createTime !== 'string') return null;
    if (document.updateTime !== undefined && typeof document.updateTime !== 'string') return null;
    const profile = decodeFirestoreFields(document.fields);
    return profile !== undefined && isValidProfile(profile, requestedPublicId) ? profile : null;
  }

  function temperamentLabels(ids) {
    return ids.map((id) => TRAITS[id]);
  }

  function thumbnailUrl(thumbnail, requestedPublicId) {
    if (!isPetIdPublicId(requestedPublicId) || !isValidThumbnail(thumbnail, requestedPublicId)) return null;
    return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(thumbnail.path)}?alt=media`;
  }

  function buildTelUri(phone) {
    return `tel:${phone.replace(/[ .()\-–—]/g, '')}`;
  }

  function buildMailtoUri(email) {
    const separator = email.lastIndexOf('@');
    return `mailto:${encodeURIComponent(email.slice(0, separator))}@${encodeURIComponent(email.slice(separator + 1))}`;
  }

  function buildMapUrl(coordinate) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${coordinate.latitude},${coordinate.longitude}`)}`;
  }

  return {
    PROJECT_ID,
    isPetIdPublicId,
    decodeAndValidateProfile,
    temperamentLabels,
    thumbnailUrl,
    buildTelUri,
    buildMailtoUri,
    buildMapUrl,
  };
});
