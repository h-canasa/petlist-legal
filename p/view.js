'use strict';

(function init(factory) {
  const profileApi = typeof module === 'object' && module.exports
    ? require('./profile.js')
    : window.PetIdProfile;
  const api = factory(profileApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PetIdView = api;
})(function createViewApi(Profile) {
  const MESSAGES = {
    unavailable: {
      kind: 'unavailable',
      heading: "This Pet ID isn't available.",
      body: "Check the link or ask the pet's owner for an updated Pet ID.",
      retryLabel: null,
    },
    network: {
      kind: 'network',
      heading: "Couldn't load this Pet ID.",
      body: 'Check your connection and try again.',
      retryLabel: 'Try Again',
    },
  };

  function available(profile, publicId) {
    const sections = [];
    if (profile.ifFound !== undefined) {
      sections.push({ kind: 'ifFound', text: profile.ifFound });
    }

    const actions = [];
    const callHref = Profile.buildTelUri(profile.phone);
    if (callHref !== null) {
      actions.push({ kind: 'call', value: profile.phone, href: callHref, primary: true });
      const smsHref = Profile.buildSmsUri(profile.phone);
      if (smsHref !== null) actions.push({ kind: 'text', href: smsHref, primary: false });
    }
    const emailHref = Profile.buildMailtoUri(profile.email);
    if (emailHref !== null) {
      actions.push({ kind: 'email', value: profile.email, href: emailHref, primary: callHref === null });
    }
    if (actions.length > 0) sections.push({ kind: 'contact', actions });

    if (profile.homeBase !== undefined) {
      sections.push({
        kind: 'homeBase',
        label: profile.homeBase.label,
        mapHref: profile.homeBase.coordinate === null ? null : Profile.buildMapUrl(profile.homeBase.coordinate),
      });
    }

    return {
      kind: 'available',
      identity: {
        name: profile.name,
        temperament: profile.temperament === undefined ? [] : Profile.temperamentLabels(profile.temperament),
        photo: { src: Profile.thumbnailUrl(profile.thumbnail, publicId), fallback: true },
      },
      sections,
    };
  }

  function message(kind) {
    const value = MESSAGES[kind];
    if (value === undefined) throw new Error('Unknown Pet ID view state.');
    return { ...value };
  }

  function handlePhotoError(image) {
    image.remove();
  }

  return { available, message, handlePhotoError };
});
