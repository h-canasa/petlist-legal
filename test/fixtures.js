/**
 * PET-477: real v1-encoded fragments produced by the mobile app's own encoder
 * (`petlist/src/utils/pet-id-payload.ts`'s `buildPetIdUrl`), captured once via a throwaway
 * `tsx` script run against that repo and pasted here verbatim. Using vectors the mobile
 * implementation actually produced (rather than hand-encoding JSON here) is what proves this
 * decoder reads real printed tags, not just an independently invented encoding that happens to
 * agree with itself.
 */
'use strict';

module.exports = {
  fullPayload: {
    fragment: 'v1.eyJuIjoiSGFybGV5IiwicCI6IisxIDU1NS0xMjMtNDU2NyIsImUiOiJvd25lckBleGFtcGxlLmNvbSIsImYiOiJMb29rIGZvciBIYXJsZXlQb2dpLlxuQ2FsbC5cbkVtYWlsLiIsInMiOiJjYXQiLCJiIjoiU2liZXJpYW4iLCJ0IjpbImFkdmVudHVyb3VzIiwiY29uZmlkZW50IiwiZW5lcmdldGljIiwic29jaWFsIiwicGxheWZ1bCJdLCJoIjp7ImwiOiJHcmFuZG1hJ3MgSG91c2UiLCJjIjpbMzcuNDI3NSwtMTIyLjE2OTddfX0',
    payload: {
      name: 'Harley',
      phone: '+1 555-123-4567',
      email: 'owner@example.com',
      ifFound: 'Look for HarleyPogi.\nCall.\nEmail.',
      species: 'cat',
      breed: 'Siberian',
      temperament: ['adventurous', 'confident', 'energetic', 'social', 'playful'],
      homeBase: { label: "Grandma's House", coordinate: { latitude: 37.4275, longitude: -122.1697 } },
    },
  },
  phoneOnly: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEifQ',
    payload: { name: 'Milo', phone: '555-000-1111' },
  },
  emailOnly: {
    fragment: 'v1.eyJuIjoiTWlsbyIsImUiOiJtaWxvQGV4YW1wbGUuY29tIn0',
    payload: { name: 'Milo', email: 'milo@example.com' },
  },
  phoneAndEmail: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJlIjoibWlsb0BleGFtcGxlLmNvbSJ9',
    payload: { name: 'Milo', phone: '555-000-1111', email: 'milo@example.com' },
  },
  speciesAndBreed: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJzIjoiY2F0IiwiYiI6IlNpYmVyaWFuIn0',
    payload: { name: 'Milo', phone: '555-000-1111', species: 'cat', breed: 'Siberian' },
  },
  speciesOnly: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJzIjoiY2F0In0',
    payload: { name: 'Milo', phone: '555-000-1111', species: 'cat' },
  },
  breedOnly: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJiIjoiU2liZXJpYW4ifQ',
    payload: { name: 'Milo', phone: '555-000-1111', breed: 'Siberian' },
  },
  neitherBreedNorSpecies: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEifQ',
    payload: { name: 'Milo', phone: '555-000-1111' },
  },
  oneTemperament: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJ0IjpbInBsYXlmdWwiXX0',
    payload: { name: 'Milo', phone: '555-000-1111', temperament: ['playful'] },
  },
  twoTemperaments: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJ0IjpbInBsYXlmdWwiLCJzb2NpYWwiXX0',
    payload: { name: 'Milo', phone: '555-000-1111', temperament: ['playful', 'social'] },
  },
  threeTemperaments: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJ0IjpbImFkdmVudHVyb3VzIiwiY29uZmlkZW50IiwicGxheWZ1bCJdfQ',
    payload: { name: 'Milo', phone: '555-000-1111', temperament: ['adventurous', 'confident', 'playful'] },
  },
  fiveTemperamentsOrderPreserved: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJ0IjpbInNvY2lhbCIsImFkdmVudHVyb3VzIiwicGxheWZ1bCIsImNvbmZpZGVudCIsImVuZXJnZXRpYyJdfQ',
    payload: {
      name: 'Milo',
      phone: '555-000-1111',
      temperament: ['social', 'adventurous', 'playful', 'confident', 'energetic'],
    },
  },
  unicodeEmojiName: {
    fragment: 'v1.eyJuIjoiTW9jaGkg8J-QviIsInAiOiI1NTUtMDAwLTExMTEifQ',
    payload: { name: 'Mochi 🐾', phone: '555-000-1111' },
  },
  unicodeEmojiIfFound: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJmIjoiUGxlYXNlIGNhbGwhIPCfkL4gR3JhY2lhcyDmhJ_osKIifQ',
    payload: { name: 'Milo', phone: '555-000-1111', ifFound: 'Please call! 🐾 Gracias 感谢' },
  },
  ifFoundExplicitNewlines: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJmIjoiTGluZSBvbmUuXG5MaW5lIHR3by5cbkxpbmUgdGhyZWUuIn0',
    payload: { name: 'Milo', phone: '555-000-1111', ifFound: 'Line one.\nLine two.\nLine three.' },
  },
  homeBaseLabelOnly: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJoIjp7ImwiOiJNYXBsZSBTdHJlZXQgSG91c2UifX0',
    payload: {
      name: 'Milo',
      phone: '555-000-1111',
      homeBase: { label: 'Maple Street House', coordinate: null },
    },
  },
  homeBaseWithCoordinate: {
    fragment: 'v1.eyJuIjoiTWlsbyIsInAiOiI1NTUtMDAwLTExMTEiLCJoIjp7ImwiOiJNYXBsZSBTdHJlZXQgSG91c2UiLCJjIjpbNDAuNzEyOCwtNzQuMDA2XX19',
    payload: {
      name: 'Milo',
      phone: '555-000-1111',
      homeBase: { label: 'Maple Street House', coordinate: { latitude: 40.7128, longitude: -74.006 } },
    },
  },
};
