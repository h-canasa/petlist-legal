'use strict';

(function startFinder(Load, View) {
  const root = document.querySelector('[data-pet-id-root]');
  const loadingShell = root.cloneNode(true);
  const publicId = new URLSearchParams(window.location.search).get('id');
  const vaccinationDate = new Intl.DateTimeFormat(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });

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
      call: 'M6.62 10.79a15.47 15.47 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z',
      email: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Zm1.5 0L12 12l7.5-5.5',
      text: 'M4 5h16v11H9l-5 4V5Z',
      location: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
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

  function avatar(identity) {
    const frame = element('div', 'pet-avatar');
    frame.append(paw());
    if (identity.photo.src !== null) {
      const image = document.createElement('img');
      image.className = 'pet-photo';
      image.alt = `${identity.name}'s photo`;
      image.addEventListener('error', () => View.handlePhotoError(image), { once: true });
      image.src = identity.photo.src;
      frame.append(image);
    }
    return frame;
  }

  function section(title, className) {
    const node = element('section', `recovery-section ${className || ''}`.trim());
    node.append(element('h2', 'section-title', title));
    return node;
  }

  function contactSection({ actions, plainPhone, plainEmail }) {
    const contact = element('section', 'contact');
    contact.setAttribute('aria-label', 'Contact');
    const secondary = element('div', 'contact-secondary');
    for (const action of actions) {
      const label = { call: 'Call', text: 'Text', email: 'Email' }[action.kind];
      const link = element('a', action.primary ? 'contact-action contact-primary' : 'contact-action');
      link.href = action.href;
      if (action.kind === 'email') link.setAttribute('aria-describedby', 'contact-email');
      link.append(icon(action.kind), element('span', '', action.kind === 'call' ? `${label} ${action.value}` : label));
      (action.primary ? contact : secondary).append(link);
    }
    if (secondary.childElementCount > 0) contact.append(secondary);
    const email = actions.find((action) => action.kind === 'email');
    if (email) {
      const address = element('p', 'contact-email', email.value);
      address.id = 'contact-email';
      contact.append(address);
    }
    for (const [label, value] of [['Phone', plainPhone], ['Email', plainEmail]]) {
      if (value === undefined) continue;
      const detail = element('p', 'contact-detail');
      detail.append(element('strong', '', label), element('span', '', value));
      contact.append(detail);
    }
    return contact;
  }

  function dateElement(value) {
    const date = element('time', '', vaccinationDate.format(new Date(value + 'T00:00:00Z')));
    date.setAttribute('datetime', value);
    return date;
  }

  function vaccinationSection({ rows, attribution }) {
    const vaccinations = section('Vaccinations', 'vaccinations');
    const records = element('ul', 'vaccination-list');
    records.setAttribute('role', 'list');
    for (const item of rows) {
      const row = element('li', 'vaccination-row');
      const record = element('div', 'vaccination-record');
      const given = element('p', 'vaccination-date', 'Given ');
      given.append(dateElement(item.dateAdministered));
      record.append(element('p', 'vaccination-title', item.title), given);
      row.append(record);
      if (item.nextDueDate !== undefined) {
        const due = element('p', 'vaccination-due');
        due.append(element('span', 'vaccination-date', 'Next due'), dateElement(item.nextDueDate));
        row.append(due);
      }
      records.append(row);
    }
    vaccinations.append(records, element('p', 'vaccination-attribution', attribution));
    return vaccinations;
  }

  function renderAvailable(profile) {
    const view = View.available(profile, publicId);
    const fragment = document.createDocumentFragment();
    const identity = element('section', 'identity');
    const copy = element('div', 'identity-copy');
    copy.append(element('h1', 'pet-name', view.identity.name));
    if (view.identity.temperament.length > 0) {
      const traits = element('ul', 'temperament');
      traits.setAttribute('role', 'list');
      traits.setAttribute('aria-label', 'Temperament');
      for (const trait of view.identity.temperament) traits.append(element('li', 'temperament-chip', trait));
      copy.append(traits);
    }
    identity.append(avatar(view.identity), copy);
    fragment.append(identity);

    const recovery = element('div', 'recovery');
    for (const entry of view.sections) {
      if (entry.kind === 'ifFound') {
        const found = section('If Found', 'if-found');
        found.append(element('p', 'if-found-copy', entry.text));
        recovery.append(found);
      } else if (entry.kind === 'contact') {
        recovery.append(contactSection(entry));
      } else if (entry.kind === 'homeBase') {
        const home = element('section', 'recovery-section home-base');
        const pin = element('div', 'home-base-pin');
        pin.append(icon('location'));
        const label = element('div', 'home-base-copy');
        label.append(element('h2', 'section-title', 'Home Base'), element('p', 'home-base-label', entry.label));
        home.append(pin, label);
        if (entry.mapHref !== null) {
          const map = element('a', 'map-link', 'Open in Maps');
          map.href = entry.mapHref;
          map.target = '_blank';
          map.rel = 'noopener noreferrer';
          home.append(map);
        }
        recovery.append(home);
      } else if (entry.kind === 'vaccinations') {
        recovery.append(vaccinationSection(entry));
      }
    }
    fragment.append(recovery);
    root.replaceChildren(fragment);
    root.dataset.state = 'available';
    root.removeAttribute('aria-busy');
  }

  function renderMessage(kind) {
    const view = View.message(kind);
    const fragment = document.createDocumentFragment();
    const state = element('section', 'message-state');
    const fallback = element('div', 'pet-avatar state-avatar');
    fallback.append(paw());
    state.append(fallback, element('h1', 'state-heading', view.heading), element('p', 'state-copy', view.body));
    if (view.retryLabel !== null) {
      const button = element('button', 'retry-button', view.retryLabel);
      button.type = 'button';
      button.addEventListener('click', run);
      state.append(button);
    }
    fragment.append(state);
    root.replaceChildren(fragment);
    root.dataset.state = kind;
    root.removeAttribute('aria-busy');
  }

  function renderLoading() {
    if (root.dataset.state !== 'loading') {
      root.replaceChildren(...loadingShell.cloneNode(true).children);
    }
    root.dataset.state = 'loading';
    root.setAttribute('aria-busy', 'true');
  }

  async function run() {
    renderLoading();
    const result = await Load.loadHostedProfile(publicId, window.fetch.bind(window));
    if (result.kind === 'available') {
      renderAvailable(result.profile);
    } else if (result.kind === 'network') {
      renderMessage('network');
    } else {
      renderMessage('unavailable');
    }
  }

  run();
})(window.PetIdLoad, window.PetIdView);
