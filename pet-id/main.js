/**
 * PET-477: Finder View bootstrap. Reads `location.hash`, decodes it with `PetIdPayload`
 * (untrusted input — see that module), and renders the recovery view or the calm invalid state
 * with `sentences.js`'s pure text builders. DOM-only glue: never assigns decoded content via
 * `innerHTML`, never evaluates it, and never sends it anywhere.
 */
(function () {
  'use strict';

  var Payload = window.PetIdPayload;
  var Sentences = window.PetIdSentences;
  var root = document.getElementById('pet-id-root');

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function svgIcon(pathData) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'action-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
    return svg;
  }

  // All four icon coordinates are stroke-drawn line art (`.action-icon` is `fill: none`), so
  // every path here is an open or ring-shaped outline -- never a filled silhouette.
  var ICONS = {
    // A ring plus a stemmed dot (the dot is a zero-length round-linecap "line", a standard SVG
    // trick for a solid round dot under stroke rendering).
    ifFound: 'M12 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19zM12 10.5L12 16M12 7.6L12 7.6',
    // The Feather Icons "phone" glyph (24x24, stroke-only) -- a widely used, well-tested
    // handset outline.
    phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
    mail: 'M3.75 5.5h16.5v13H3.75zM3.75 5.5l8.25 7 8.25-7',
    pin: 'M12 21.5s7-6.3 7-11.75A7 7 0 105 9.75C5 15.2 12 21.5 12 21.5zm0-9a2.5 2.5 0 110-5 2.5 2.5 0 010 5z',
    map: 'M9 3.5L3.75 5.75v14.75L9 18.25l6 2.25 5.25-2.25V3.5L15 5.75 9 3.5zM9 3.5v14.75M15 5.75V20.5',
  };

  function telHref(phone) {
    var trimmed = phone.trim();
    var plus = trimmed.charAt(0) === '+' ? '+' : '';
    return 'tel:' + plus + trimmed.replace(/[^0-9]/g, '');
  }

  function mapsHref(coordinate) {
    var query = coordinate.latitude + ',' + coordinate.longitude;
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
  }

  function renderHero(payload) {
    var section = el('section', 'hero');
    section.setAttribute('aria-label', "This pet's introduction");

    var nameLine = el('h1', 'hero-name-line');
    nameLine.appendChild(document.createTextNode('Hi, I am '));
    var nameSpan = el('span', 'hero-name', payload.name);
    nameLine.appendChild(nameSpan);
    nameLine.appendChild(document.createTextNode('!'));
    section.appendChild(nameLine);

    var breedSpecies = Sentences.breedSpeciesSentence(payload.breed, payload.species);
    if (breedSpecies !== null) {
      section.appendChild(el('p', 'hero-line', breedSpecies));
    }

    if (payload.temperament && payload.temperament.length > 0) {
      // The canonical labels (Payload.temperamentTraitLabel) are capitalised for chip/list
      // display elsewhere in PetList; here they read as predicate adjectives inside a sentence
      // ("I am playful and social."), so they're lowercased for this one call site only.
      var labels = payload.temperament.map(function (id) {
        return Payload.temperamentTraitLabel(id).toLowerCase();
      });
      var sentence = Sentences.temperamentSentence(labels);
      if (sentence !== null) {
        section.appendChild(el('p', 'hero-line', sentence));
      }
    }

    return section;
  }

  function renderIfFound(ifFound) {
    var section = el('section', 'recovery-section if-found-section');
    section.setAttribute('aria-labelledby', 'if-found-heading');

    var iconRow = el('div', 'section-heading-row');
    iconRow.appendChild(svgIcon(ICONS.ifFound));
    iconRow.appendChild(el('h2', 'section-heading', 'If Found')).id = 'if-found-heading';
    section.appendChild(iconRow);

    var body = el('p', 'if-found-body');
    var lines = Sentences.ifFoundLines(ifFound);
    lines.forEach(function (line, index) {
      body.appendChild(document.createTextNode(line));
      if (index < lines.length - 1) body.appendChild(document.createElement('br'));
    });
    section.appendChild(body);

    return section;
  }

  function renderContact(payload) {
    var section = el('section', 'recovery-section contact-section');
    section.setAttribute('aria-labelledby', 'contact-heading');
    var headingRow = el('div', 'section-heading-row');
    headingRow.appendChild(svgIcon(ICONS.phone));
    headingRow.appendChild(el('h2', 'section-heading', 'Contact')).id = 'contact-heading';
    section.appendChild(headingRow);

    var actions = el('div', 'action-list');

    if (payload.phone) {
      var phoneLink = el('a', 'action-row');
      phoneLink.href = telHref(payload.phone);
      phoneLink.setAttribute('aria-label', 'Call ' + payload.phone);
      phoneLink.appendChild(svgIcon(ICONS.phone));
      phoneLink.appendChild(el('span', 'action-value', payload.phone));
      actions.appendChild(phoneLink);
    }

    if (payload.email) {
      var emailLink = el('a', 'action-row');
      emailLink.href = 'mailto:' + payload.email;
      emailLink.setAttribute('aria-label', 'Email ' + payload.email);
      emailLink.appendChild(svgIcon(ICONS.mail));
      emailLink.appendChild(el('span', 'action-value', payload.email));
      actions.appendChild(emailLink);
    }

    section.appendChild(actions);
    return section;
  }

  function renderHomeBase(homeBase) {
    var section = el('section', 'recovery-section home-base-section');
    section.setAttribute('aria-labelledby', 'home-base-heading');

    var heading = el('h2', 'section-heading', 'Home Base');
    heading.id = 'home-base-heading';
    var headingRow = el('div', 'section-heading-row');
    headingRow.appendChild(svgIcon(ICONS.pin));
    headingRow.appendChild(heading);
    section.appendChild(headingRow);

    section.appendChild(el('p', 'home-base-label', homeBase.label));

    if (homeBase.coordinate) {
      var mapLink = el('a', 'action-row action-row--secondary');
      mapLink.href = mapsHref(homeBase.coordinate);
      mapLink.target = '_blank';
      mapLink.rel = 'noopener noreferrer';
      mapLink.appendChild(svgIcon(ICONS.map));
      mapLink.appendChild(el('span', 'action-value', 'Open in Maps'));
      section.appendChild(mapLink);
    }

    return section;
  }

  function renderFooter() {
    var footer = el('footer', 'site-footer');
    var wordmarkWrap = el('span', 'footer-wordmark-wrap');
    var img = document.createElement('img');
    img.className = 'footer-wordmark';
    img.src = '../assets/marketing/petlist-wordmark.png';
    img.alt = 'PetList';
    img.width = 1560;
    img.height = 384;
    wordmarkWrap.appendChild(img);
    footer.appendChild(wordmarkWrap);
    footer.appendChild(el('span', 'footer-separator', '·'));
    footer.appendChild(el('span', 'footer-domain', 'mypetlist.app'));
    return footer;
  }

  function renderInvalid() {
    var section = el('section', 'invalid-state');
    section.appendChild(el('h1', 'invalid-heading', "This Pet ID can't be opened."));
    section.appendChild(el('p', 'invalid-body', 'Try scanning the QR code again.'));
    return section;
  }

  function render() {
    root.textContent = '';
    var result = Payload.decodePetIdFragment(window.location.hash);

    if (!result.ok) {
      root.appendChild(renderInvalid());
      root.appendChild(renderFooter());
      return;
    }

    var payload = result.payload;
    root.appendChild(renderHero(payload));
    if (payload.ifFound) root.appendChild(renderIfFound(payload.ifFound));
    root.appendChild(renderContact(payload));
    if (payload.homeBase) root.appendChild(renderHomeBase(payload.homeBase));
    root.appendChild(renderFooter());
  }

  render();
})();
