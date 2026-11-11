/* Campaign labels travel only in links. No cookies, identity, storage or requests. */
(function () {
  'use strict';
  const query = new URLSearchParams(location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const incoming = {};
  keys.forEach(key => {
    const value = query.get(key);
    if (value && /^[a-zA-Z0-9_-]{1,80}$/.test(value)) incoming[key] = value;
  });
  document.querySelectorAll('a[data-hero-route]').forEach(link => {
    const url = new URL(link.getAttribute('href'), location.href);
    if (url.origin !== location.origin && url.origin !== 'https://invite.withweplace.kr') return;
    Object.entries(incoming).forEach(([key, value]) => url.searchParams.set(key, value));
    link.href = url.href;
  });
})();
