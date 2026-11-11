(function () {
  'use strict';
  // The brief authorizes preserving existing GA4, not expanding tracking.
  // New funnel events remain OFF until the owner gives final tracking approval.
  var EXPANDED_EVENTS_APPROVED = false;
  var PRODUCTION_HOST = 'withweplace.kr';
  var MEASUREMENT_ID = 'G-H9B5F4HRDS';
  var existingEvents = ['weplace_experience_start', 'weplace_experience_select', 'weplace_consult_click', 'weplace_faq_open'];
  var expandedEvents = ['weplace_industry_select', 'weplace_experience_complete', 'weplace_diagnosis_start', 'weplace_diagnosis_complete', 'weplace_meeting_interest_click', 'weplace_portal_entry_click'];
  var industries = ['dining', 'cafe', 'stay', 'beauty'];
  var placements = ['hero', 'mobile', 'experience', 'industry', 'faq', 'kakao_contact', 'email_contact', 'telephone'];
  // Even if accidentally included on diagnosis, meeting or review routes, these stay untracked.
  var enabled = window.location.hostname === PRODUCTION_HOST && !/^\/(?:check|meeting|review)(?:\/|$)/.test(window.location.pathname);
  var canonical = document.querySelector('link[rel="canonical"]');
  var pagePath = '/';
  try {
    var canonicalUrl = new URL(canonical ? canonical.href : '/', 'https://' + PRODUCTION_HOST);
    if (canonicalUrl.hostname === PRODUCTION_HOST && /^\/[a-z0-9/_-]*$/i.test(canonicalUrl.pathname)) pagePath = canonicalUrl.pathname;
  } catch (_) { /* Safe homepage fallback. Never derive a path from user input. */ }
  var pageLocation = 'https://' + PRODUCTION_HOST + pagePath;
  function queue() { window.dataLayer.push(arguments); }
  function emit(event, params) {
    if (!enabled) return false;
    if (existingEvents.indexOf(event) === -1 && !(EXPANDED_EVENTS_APPROVED && expandedEvents.indexOf(event) !== -1)) return false;
    var safe = {send_to: MEASUREMENT_ID, page_location: pageLocation, page_referrer: ''};
    if (params && industries.indexOf(params.industry) !== -1) safe.industry = params.industry;
    if (params && placements.indexOf(params.placement) !== -1) safe.placement = params.placement;
    // Never forward arbitrary params, free text, selected purpose, answers or query strings.
    queue('event', event, safe);
    return true;
  }
  window.WeplaceMetrics = Object.freeze({emit: emit, expandedEventsApproved: EXPANDED_EVENTS_APPROVED, enabled: enabled});
  if (!enabled) return;
  window.dataLayer = window.dataLayer || [];
  queue('js', new Date());
  queue('config', MEASUREMENT_ID, {send_page_view: false, page_location: pageLocation, page_referrer: '', allow_google_signals: false, allow_ad_personalization_signals: false});
  queue('event', 'page_view', {send_to: MEASUREMENT_ID, page_location: pageLocation, page_referrer: '', page_title: 'Weplace — 고객 시선 체험'});
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.append(script);
})();
