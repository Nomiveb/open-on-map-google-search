// ============================================================
//  Open on Map — Chrome Extension Content Script
// ============================================================

(function () {
  'use strict';

  if (
    window !== window.top ||
    !window.location.hostname.includes('google.') ||
    !window.location.pathname.startsWith('/search')
  ) {
    return;
  }

  const BUTTON_CLASS = 'open-on-map-btn';
  const MARKER_ATTR  = 'data-open-on-map-injected';

  const MAP_ICON_SVG = `<svg class="map-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/>
  </svg>`;



  // ------------------------------------------------------------------
  //  Utilities
  // ------------------------------------------------------------------
  function buildMapsUrl(query, coords) {
    if (coords) {
      return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function createButton(mapsUrl, variant) {
    const btn = document.createElement('a');
    btn.href = mapsUrl;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.className = BUTTON_CLASS + (variant ? ` ${BUTTON_CLASS}--${variant}` : '');
    btn.innerHTML = `${MAP_ICON_SVG}<span>Open on map</span>`;
    btn.title = 'Open on map';
    return btn;
  }

  function createActionChip(mapsUrl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'bkaPDb open-on-map-chip-container';
    wrapper.setAttribute(MARKER_ATTR, 'true');

    const a = document.createElement('a');
    a.className = 'n1obkb mI8Pwc';
    a.href = mapsUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.title = 'Open this location on Google Maps';

    const innerDiv = document.createElement('div');
    innerDiv.className = 'aep93e pcFRYc ubSPH';

    const iconDiv = document.createElement('div');
    iconDiv.className = 'o7nARe K4LyVe';
    iconDiv.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;margin:auto;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/></svg>`;

    const textSpan = document.createElement('span');
    textSpan.className = 'aSAiSd';
    textSpan.textContent = 'Open on map';

    innerDiv.appendChild(iconDiv);
    innerDiv.appendChild(textSpan);
    a.appendChild(innerDiv);
    wrapper.appendChild(a);
    return wrapper;
  }

  function extractCoordsFromElement(container) {
    const patterns = [
      /@(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/,
      /center=(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/,
      /ll=(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/,
    ];
    const elements = container.querySelectorAll('a[href], iframe[src], img[src], [data-url], [data-src]');
    for (const el of elements) {
      const url = el.href || el.src || el.getAttribute('data-url') || el.getAttribute('data-src') || '';
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }
      const m34 = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
      if (m34) return { lat: parseFloat(m34[1]), lng: parseFloat(m34[2]) };
      const m23 = url.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
      if (m23) return { lat: parseFloat(m23[2]), lng: parseFloat(m23[1]) };
    }
    return null;
  }

  function extractSearchQuery() {
    const inputs = document.querySelectorAll('input[name="q"], textarea[name="q"], .gLFyf, #APjFqb, #lst-ib');
    for (const input of inputs) {
      if (input && typeof input.value === 'string' && input.value.trim() !== '') {
        return input.value.trim();
      }
    }
    return null;
  }

  function extractPlaceName(panel) {
    const titleAttr = panel.querySelector('[data-attrid="title"]');
    if (titleAttr) {
      const text = titleAttr.textContent.trim();
      if (text && text.length < 120) return text;
    }
    const qrShPb = panel.querySelector('.qrShPb');
    if (qrShPb) {
      const text = qrShPb.textContent.trim();
      if (text && text.length < 120) return text;
    }
    return null;
  }

  function extractTopNavMapsUrl() {
    const topNavLinks = document.querySelectorAll(
      '#top_nav a, .crJ18e a, .hdtb-mitem a, .nf-item a, [role="navigation"] a'
    );
    for (const a of topNavLinks) {
      const text = a.textContent.trim().toLowerCase();
      const url  = a.href || '';
      if (/maps/i.test(text) && url.includes('google')) return url;
      if (url.includes('/maps/') || url.includes('maps.google')) return url;
    }
    return null;
  }

  function handleAboutButton() {
    if (document.querySelector(`[${MARKER_ATTR}="about"]`)) return;

    // Simply find a span with role="heading" that says "About"
    const allHeadings = document.querySelectorAll('span[role="heading"]');
    let aboutHeading = null;

    for (const h of allHeadings) {
      if (h.textContent.trim() === 'About') {
        aboutHeading = h;
        break;
      }
    }

    // Fallback: also try common translations
    if (!aboutHeading) {
      for (const h of allHeadings) {
        const t = h.textContent.trim();
        if (/^(info|about this result)$/i.test(t)) {
          aboutHeading = h;
          break;
        }
      }
    }

    if (!aboutHeading) {
      console.log('[Open on Map] About heading not found');
      return;
    }

    const searchQuery = extractSearchQuery();
    if (!searchQuery) return;

    console.log('[Open on Map] Injecting button next to:', aboutHeading.textContent.trim());

    const mapsUrl = buildMapsUrl(searchQuery);

    const btn = document.createElement('a');
    btn.href = mapsUrl;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.className = 'open-on-map-btn';
    btn.title = 'Open on map';
    btn.setAttribute(MARKER_ATTR, 'about');
    btn.innerHTML = `${MAP_ICON_SVG}<span>Open on map</span>`;

    const parent = aboutHeading.parentElement;
    if (parent) {
      parent.style.display = 'flex';
      parent.style.alignItems = 'center';
      parent.style.gap = '6px';
      parent.appendChild(btn);
      console.log('[Open on Map] Button injected successfully!');
    }
  }

  // ------------------------------------------------------------------
  //  Strategy 2: Knowledge panel for specific locations (expo xxi, etc.)
  // ------------------------------------------------------------------
  function handleKnowledgePanel() {
    const possiblePanels = document.querySelectorAll('#rhs, #Sva75c, c-wiz[data-attrid] > div > div, .kno-kp');

    possiblePanels.forEach(panel => {
      if (panel.querySelector(`[${MARKER_ATTR}]`)) return;

      const hasMap =
        panel.querySelector('a[href*="maps.google"], a[href*="google.com/maps"], img[src*="maps"]') ||
        panel.querySelector('[data-attrid*="address"]') ||
        panel.querySelector('[data-attrid*="kc:/location"]') ||
        panel.querySelector('[data-attrid*="geo/geocodable"]') ||
        panel.querySelector('a[data-url*="maps"]');

      const hasMapImage = panel.querySelector(
        'img[src*="maps.googleapis.com"], img[src*="maps.google"], img[data-src*="maps.googleapis.com"]'
      );

      const directRegex = /directions/i;
      const hasDirections = directRegex.test(panel.textContent);

      // Must have specific location signals
      const hasAddress = !!panel.querySelector('[data-attrid*="address"]');
      const hasMapsLink = !!panel.querySelector('a[href*="maps.google"], a[href*="google.com/maps"]');
      if (!hasAddress && !hasMapsLink && !hasDirections && !hasMapImage) return;
      if (!hasMap && !hasMapImage && !hasDirections) return;

      const isMapsUrl = (url) => /maps\.google|google\.\w+\/maps/i.test(url);

      let mapsUrl = null;

      // Priority 1: ftid or cid link
      const ftidLink = Array.from(panel.querySelectorAll('a')).find(a => {
        const url = a.href || '';
        return isMapsUrl(url) && (url.includes('ftid=') || /[?&]cid=/.test(url));
      });
      if (ftidLink) mapsUrl = ftidLink.href;

      // Priority 2: /maps/place/ link
      if (!mapsUrl) {
        const placeLink = Array.from(panel.querySelectorAll('a')).find(a => {
          const url = a.href || '';
          return isMapsUrl(url) && url.includes('/maps/place/');
        });
        if (placeLink) mapsUrl = placeLink.href;
      }

      // Priority 3: top nav Maps tab
      if (!mapsUrl) {
        const topNavUrl = extractTopNavMapsUrl();
        if (topNavUrl) mapsUrl = topNavUrl;
      }

      // Priority 4: coords + name
      if (!mapsUrl) {
        const coords     = extractCoordsFromElement(panel);
        const placeName  = extractPlaceName(panel);
        const searchQuery = extractSearchQuery();

        if (coords) {
          mapsUrl = buildMapsUrl(null, coords);
        } else if (placeName) {
          mapsUrl = buildMapsUrl(placeName);
        } else if (searchQuery) {
          mapsUrl = buildMapsUrl(searchQuery);
        } else {
          return;
        }
      }

      // Insert button
      const actionButtons =
        panel.querySelector('.zhZ3gf') ||
        panel.querySelector('[data-attrid="action_buttons"]') ||
        panel.querySelector('.wDYxhc [role="list"]');

      if (actionButtons) {
        if (actionButtons.classList.contains('zhZ3gf')) {
          const chip = createActionChip(mapsUrl);
          if (actionButtons.firstChild) {
            actionButtons.insertBefore(chip, actionButtons.firstChild);
          } else {
            actionButtons.appendChild(chip);
          }
        } else {
          const container = document.createElement('div');
          container.className = 'open-on-map-chip-container';
          container.setAttribute(MARKER_ATTR, 'true');
          container.appendChild(createButton(mapsUrl));
          actionButtons.parentElement.insertBefore(container, actionButtons.nextSibling);
        }
      } else {
        const heading = panel.querySelector('[data-attrid="title"], h2, [role="heading"]');
        const target  = heading?.closest('div') || panel.firstElementChild;
        if (target) {
          const container = document.createElement('div');
          container.className = 'open-on-map-container';
          container.style.marginLeft = 'auto';
          container.setAttribute(MARKER_ATTR, 'true');
          container.appendChild(createButton(mapsUrl));
          if (target.parentElement) {
            target.parentElement.insertBefore(container, target.nextSibling);
          } else {
            panel.appendChild(container);
          }
        }
      }
    });
  }

  // ------------------------------------------------------------------
  //  Strategy 3: Local pack / Map pack
  // ------------------------------------------------------------------
  function handleLocalPack() {
    const localPack = document.querySelector('.AEprdc, [data-local-attribute="d3bn"]');
    if (!localPack || localPack.querySelector(`[${MARKER_ATTR}]`)) return;

    const mapsLink = localPack.querySelector('a[href*="google.com/maps"]');
    if (!mapsLink) return;

    const mapsUrl = mapsLink.href;
    const btnContainer = document.createElement('div');
    btnContainer.className = 'open-on-map-container';
    btnContainer.setAttribute(MARKER_ATTR, 'true');
    btnContainer.appendChild(createButton(mapsUrl));

    const header = localPack.querySelector('h2, [role="heading"]');
    if (header) {
      header.parentElement.insertBefore(btnContainer, header.nextSibling);
    } else {
      localPack.prepend(btnContainer);
    }
  }

  // ------------------------------------------------------------------
  //  Strategy 4: Mini knowledge card with map thumbnail
  // ------------------------------------------------------------------
  function handleMiniCard() {
    const allMapLinks = document.querySelectorAll(
      '#search a[href*="google.com/maps/place"], #search a[href*="maps.google.com"]'
    );

    allMapLinks.forEach(link => {
      const card = link.closest('.g') || link.closest('[data-hveid]');
      if (!card || card.querySelector(`[${MARKER_ATTR}]`)) return;

      const hasImg = card.querySelector(
        'img[src*="maps.googleapis.com"], img[data-src*="maps.googleapis.com"]'
      );
      if (!hasImg) return;

      const coords = extractCoordsFromElement(card);
      const title  = card.querySelector('h3, h2, [role="heading"]')?.textContent?.trim();
      if (!coords && !title) return;

      const mapsUrl = coords ? buildMapsUrl(null, coords) : buildMapsUrl(title);

      const btnContainer = document.createElement('div');
      btnContainer.className = 'open-on-map-container';
      btnContainer.setAttribute(MARKER_ATTR, 'true');
      btnContainer.appendChild(createButton(mapsUrl, 'inline'));
      card.appendChild(btnContainer);
    });
  }

  // ------------------------------------------------------------------
  //  Strategy 5: Street / address map card in main search area
  //  Handles results like "aleja hallera wroclaw" where Google shows
  //  a full-width static map + street name heading + Share button,
  //  but no knowledge panel on the right.
  // ------------------------------------------------------------------
  function handleStreetMapCard() {
    // Google uses .vk_c.PAq55d for these street/address cards
    const card = document.querySelector('.vk_c.PAq55d');
    if (!card || card.querySelector(`[${MARKER_ATTR}]`)) return;

    // The share column is .Uekwlc inside the heading area (card.children[1])
    // It sits to the right of the main heading text column
    const headingArea = card.children[1];
    if (!headingArea) return;

    const shareCol = headingArea.querySelector('.Uekwlc');
    if (!shareCol) return;

    // Build maps URL from heading text + city subtitle
    // (NOT from random maps links on the page — those point to nearby businesses)
    const headingEl = card.querySelector('.vk_sh, h2, h3');
    const cityEl    = card.querySelector('.fMYBhe');
    const headingText = headingEl?.textContent?.trim() || '';
    const cityText    = cityEl?.textContent?.trim()    || '';
    const query = cityText
      ? `${headingText}, ${cityText}`
      : headingText || extractSearchQuery();
    if (!query) return;

    const mapsUrl = buildMapsUrl(query);

    // Wrap button + label so it looks like the Share button (circle icon + text)
    const btn = document.createElement('a');
    btn.href      = mapsUrl;
    btn.target    = '_blank';
    btn.rel       = 'noopener noreferrer';
    btn.className = 'open-on-map-btn open-on-map-btn--share-style';
    btn.setAttribute(MARKER_ATTR, 'true');
    btn.title     = 'Open on Google Maps';
    btn.innerHTML = `
      <div class="open-on-map-share-circle">${MAP_ICON_SVG}</div>
      <span class="open-on-map-share-label">Open map</span>
    `;

    // Insert BEFORE the share column so our button appears to its left
    shareCol.parentElement.insertBefore(btn, shareCol);
  }

  // ------------------------------------------------------------------
  //  Main
  // ------------------------------------------------------------------
  function injectButtons() {
    try {
      handleAboutButton();
      handleKnowledgePanel();
      handleLocalPack();
      handleMiniCard();
      handleStreetMapCard();
    } catch (err) {
      console.warn('[Open on Map Extension] Error:', err);
    }
  }

  let isInjecting  = false;
  let debounceTimer = null;

  function safeInject() {
    if (isInjecting) return;
    isInjecting = true;
    observer.disconnect();
    try {
      injectButtons();
    } finally {
      observer.observe(document.body, { childList: true, subtree: true });
      isInjecting = false;
    }
  }

  function scheduledInject() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(safeInject, 300);
  }

  const observer = new MutationObserver(scheduledInject);

  injectButtons();

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', () => {
    setTimeout(safeInject, 500);
  });
})();
