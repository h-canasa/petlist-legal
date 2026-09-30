'use strict';

(function init(factory) {
  const profileApi = typeof module === 'object' && module.exports
    ? require('./profile.js')
    : window.PetIdProfile;
  const api = factory(profileApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PetIdLoad = api;
})(function createLoadApi(Profile) {
  function documentUrl(publicId) {
    return `https://firestore.googleapis.com/v1/projects/${Profile.PROJECT_ID}/databases/(default)/documents/petIdPublic/${publicId}`;
  }

  async function loadHostedProfile(publicId, fetchImpl) {
    if (!Profile.isPetIdPublicId(publicId)) return { kind: 'unavailable' };
    let response;
    try {
      response = await fetchImpl(documentUrl(publicId), {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
    } catch {
      return { kind: 'network' };
    }
    if (response.status === 404) return { kind: 'unavailable' };
    if (!response.ok) return { kind: 'network' };
    let document;
    try {
      document = await response.json();
    } catch {
      return { kind: 'unavailable' };
    }
    const profile = Profile.decodeAndValidateProfile(document, publicId);
    return profile === null ? { kind: 'unavailable' } : { kind: 'available', profile };
  }

  return { documentUrl, loadHostedProfile };
});
