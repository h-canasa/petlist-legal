'use strict';

(function startFinder(Profile, Load) {
  const root = document.querySelector('[data-pet-id-root]');
  const publicId = new URLSearchParams(window.location.search).get('id');

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('action-icon');
    const paths = {
      phone: 'M6.62 10.79a15.47 15.47 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z',
      mail: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Zm1.5 0L12 12l7.5-5.5',
      location: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
      arrow: 'M5 12h14m-5-5 5 5-5 5',
    };
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', paths[name]);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.append(path);
    return svg;
  }

  function paw() {
    const mark = element('span', 'paw-mark');
    mark.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 4; index += 1) mark.append(element('span', `paw-toe paw-toe-${index + 1}`));
    mark.append(element('span', 'paw-pad'));
    return mark;
  }

  function header() {
    const node = element('header', 'card-header');
    const wordmark = document.createElement('img');
    wordmark.src = '../assets/marketing/petlist-wordmark.png';
    wordmark.alt = 'PetList';
    wordmark.className = 'wordmark';
    wordmark.width = 124;
    wordmark.height = 41;
    node.append(wordmark, element('span', 'eyebrow', 'PET ID'));
    return node;
  }

  function footer() {
    const node = element('footer', 'card-footer');
    const link = element('a', '', 'mypetlist.app');
    link.href = 'https://mypetlist.app/';
    link.rel = 'noopener noreferrer';
    node.append(element('span', '', 'PetList'), element('span', 'footer-dot', '·'), link);
    return node;
  }

  function avatar(profile) {
    const frame = element('div', 'pet-avatar');
    frame.append(paw());
    const url = Profile.thumbnailUrl(profile.thumbnail, publicId);
    if (url !== null) {
      const image = document.createElement('img');
      image.className = 'pet-photo';
      image.src = url;
      image.alt = `${profile.name}'s photo`;
      image.addEventListener('error', () => image.remove(), { once: true });
      frame.append(image);
    }
    return frame;
  }

  function section(title, className) {
    const node = element('section', `recovery-section ${className || ''}`.trim());
    node.append(element('h2', 'section-title', title));
    return node;
  }

  function contactRow(kind, value, href) {
    const link = element('a', 'contact-row');
    link.href = href;
    link.append(icon(kind), element('span', 'contact-value', value), icon('arrow'));
    return link;
  }

  function renderAvailable(profile) {
    const fragment = document.createDocumentFragment();
    fragment.append(header());
    const identity = element('section', 'identity');
    const copy = element('div', 'identity-copy');
    copy.append(element('h1', 'pet-name', profile.name));
    if (profile.temperament) {
      copy.append(element('p', 'temperament', Profile.temperamentLabels(profile.temperament).join(' · ')));
    }
    identity.append(avatar(profile), copy);
    fragment.append(identity);

    const recovery = element('div', 'recovery');
    if (profile.ifFound) {
      const found = section('If Found', 'if-found');
      found.append(element('p', 'if-found-copy', profile.ifFound));
      recovery.append(found);
    }
    const contact = section('Contact', 'contact');
    if (profile.phone) contact.append(contactRow('phone', profile.phone, Profile.buildTelUri(profile.phone)));
    if (profile.email) contact.append(contactRow('mail', profile.email, Profile.buildMailtoUri(profile.email)));
    recovery.append(contact);
    if (profile.homeBase) {
      const home = section('Home Base', 'home-base');
      const row = element('div', 'home-base-row');
      const label = element('div', 'home-base-label');
      label.append(icon('location'), element('span', '', profile.homeBase.label));
      row.append(label);
      if (profile.homeBase.coordinate) {
        const map = element('a', 'map-link', 'Open in Maps');
        map.href = Profile.buildMapUrl(profile.homeBase.coordinate);
        map.target = '_blank';
        map.rel = 'noopener noreferrer';
        row.append(map);
      }
      home.append(row);
      recovery.append(home);
    }
    fragment.append(recovery, footer());
    root.replaceChildren(fragment);
    root.dataset.state = 'available';
    root.removeAttribute('aria-busy');
    document.title = `${profile.name} · Pet ID`;
  }

  function renderMessage(kind, heading, body, retry) {
    const fragment = document.createDocumentFragment();
    fragment.append(header());
    const state = element('section', 'message-state');
    const fallback = element('div', 'pet-avatar state-avatar');
    fallback.append(paw());
    state.append(fallback, element('h1', 'state-heading', heading), element('p', 'state-copy', body));
    if (retry) {
      const button = element('button', 'retry-button', 'Try Again');
      button.type = 'button';
      button.addEventListener('click', run);
      state.append(button);
    }
    fragment.append(state, footer());
    root.replaceChildren(fragment);
    root.dataset.state = kind;
    root.removeAttribute('aria-busy');
  }

  function renderLoading() {
    root.dataset.state = 'loading';
    root.setAttribute('aria-busy', 'true');
    const existingState = root.querySelector('.message-state, .identity');
    if (!existingState) return;
    const fragment = document.createDocumentFragment();
    fragment.append(header());
    const loading = element('section', 'loading-state');
    const circle = element('div', 'skeleton skeleton-avatar');
    const lines = element('div', 'loading-lines');
    lines.append(element('div', 'skeleton skeleton-name'), element('div', 'skeleton skeleton-detail'));
    loading.append(circle, lines);
    fragment.append(
      loading,
      element('div', 'skeleton skeleton-panel'),
      element('div', 'skeleton skeleton-row'),
      element('div', 'skeleton skeleton-row skeleton-row-lower'),
      footer()
    );
    root.replaceChildren(fragment);
  }

  async function run() {
    renderLoading();
    const result = await Load.loadHostedProfile(publicId, window.fetch.bind(window));
    if (result.kind === 'available') {
      renderAvailable(result.profile);
    } else if (result.kind === 'network') {
      renderMessage('network', "Couldn't load this Pet ID.", 'Check your connection and try again.', true);
    } else {
      renderMessage('unavailable', "This Pet ID isn't available.", "Check the link or ask the pet's owner for an updated Pet ID.", false);
    }
  }

  run();
})(window.PetIdProfile, window.PetIdLoad);
