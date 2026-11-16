/* Optional R4 QA instrumentation, activated only by /?qa=r4 at top level.
   No transmission, storage or field telemetry. Never modifies page layout. */
(function () {
  'use strict';
  if (window.top !== window || new URLSearchParams(location.search).get('qa') !== 'r4') return;
  if (document.documentElement.dataset.topLevelQa === 'bound') return;
  document.documentElement.dataset.topLevelQa = 'bound';
  const supported = window.PerformanceObserver?.supportedEntryTypes || [];
  const observers = [], interactions = new Map();
  const round = n => Number.isFinite(n) ? Math.round(n * 1000) / 1000 : null;
  let sessionStart = -1, sessionLast = -1, sessionValue = 0;
  let report, status, drawer;
  const state = {
    source: 'Top-level page PerformanceObserver; current browser LAB navigation',
    observerAttachedAtMs: round(performance.now()),
    documentVisibilityAtAttach: document.visibilityState,
    supportedEntryTypes: supported,
    fcpMs: null, lcpMs: null, lcpElement: null,
    rawClsSessionMax: supported.includes('layout-shift') ? 0 : null,
    longestObservedInteractionMs: null,
    layoutShiftEntries: [], eventEntries: [], pageLifecycle: [], errors: [], frozen: false,
    interpretation: 'Raw buffered unexpected layout shifts are retained, including before FCP. Longest observed interaction is not a field INP result. No field p75, physical-device or throttling claim.'
  };
  const node = element => element ? { tag: element.tagName || '', id: element.id || '', class: typeof element.className === 'string' ? element.className : '', harness: !!element.closest?.('[data-r4-qa-harness]') } : null;
  const rect = value => value ? { x: round(value.x), y: round(value.y), width: round(value.width), height: round(value.height) } : null;
  const handleShifts = entries => {
    for (const entry of entries) {
      state.layoutShiftEntries.push({ time: round(entry.startTime), value: round(entry.value), hadRecentInput: entry.hadRecentInput, lastInputTime: round(entry.lastInputTime), sources: (entry.sources || []).map(source => ({ node: node(source.node), previousRect: rect(source.previousRect), currentRect: rect(source.currentRect) })) });
      if (state.layoutShiftEntries.length > 60) state.layoutShiftEntries.shift();
      if (entry.hadRecentInput) continue;
      if (sessionStart < 0 || entry.startTime - sessionLast >= 1000 || entry.startTime - sessionStart >= 5000) { sessionStart = entry.startTime; sessionValue = 0; }
      sessionLast = entry.startTime; sessionValue += entry.value;
      state.rawClsSessionMax = round(Math.max(state.rawClsSessionMax || 0, sessionValue));
    }
  };
  const handlePaints = entries => { for (const entry of entries) if (entry.name === 'first-contentful-paint') state.fcpMs = round(entry.startTime); };
  const handleLcp = entries => { for (const entry of entries) { state.lcpMs = round(entry.startTime); state.lcpElement = node(entry.element); } };
  const handleEvents = entries => {
    for (const entry of entries) {
      if (!entry.interactionId) continue;
      state.eventEntries.push({ name: entry.name, time: round(entry.startTime), duration: round(entry.duration), interactionId: entry.interactionId, processingStart: round(entry.processingStart), processingEnd: round(entry.processingEnd), target: node(entry.target) });
      if (state.eventEntries.length > 60) state.eventEntries.shift();
      interactions.set(entry.interactionId, Math.max(interactions.get(entry.interactionId) || 0, entry.duration));
    }
    if (interactions.size) state.longestObservedInteractionMs = round(Math.max(...interactions.values()));
  };
  const observe = (type, handler, options = {}) => {
    if (!supported.includes(type)) return;
    try {
      const observer = new PerformanceObserver(list => handler(list.getEntries()));
      observer.observe({ type, buffered: true, ...options });
      observers.push({ observer, handler });
    } catch (error) { state.errors.push(`${type}: ${error.message}`); }
  };
  observe('paint', handlePaints);
  observe('largest-contentful-paint', handleLcp);
  observe('layout-shift', handleShifts);
  observe('event', handleEvents, { durationThreshold: 16 });

  function snapshot() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resourceTimings = performance.getEntriesByType('resource').filter(entry => /\.(?:css|woff2?)(?:\?|$)/.test(entry.name)).map(entry => ({ path: new URL(entry.name).pathname, startTime: round(entry.startTime), responseEnd: round(entry.responseEnd), duration: round(entry.duration), transferSize: entry.transferSize }));
    return {
      ...state, observedInteractionCount: interactions.size,
      capturedAt: new Date().toISOString(), timeOrigin: performance.timeOrigin,
      viewport: { innerWidth, innerHeight, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body?.scrollWidth, devicePixelRatio },
      paintEntries: performance.getEntriesByType('paint').map(entry => ({ name: entry.name, startTime: round(entry.startTime) })),
      navigation: navigation ? { type: navigation.type, responseStart: round(navigation.responseStart), responseEnd: round(navigation.responseEnd), domInteractive: round(navigation.domInteractive), domContentLoadedEventEnd: round(navigation.domContentLoadedEventEnd), loadEventEnd: round(navigation.loadEventEnd) } : null,
      cssAndFontResources: resourceTimings,
      nativeReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      fontsStatus: document.fonts?.status || 'unavailable',
      limitations: ['No native network or CPU throttle', 'Not field p75', 'Raw event entries include QA button interactions; targets identify harness controls and none are silently discarded', 'Raw CLS preserves pre-FCP entries and all source traces; absent FCP/LCP is NOT OBSERVED', 'No input values, external sends, localStorage or account data captured']
    };
  }

  function collect(freeze) {
    // Wait for the interaction's next paint and queued PerformanceObserver work.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setTimeout(() => {
        for (const item of observers) item.handler(item.observer.takeRecords());
        if (freeze) { state.frozen = true; observers.forEach(item => item.observer.disconnect()); }
        if (report) report.textContent = JSON.stringify(snapshot(), null, 2);
        if (status) status.textContent = freeze ? '관측을 종료하고 원시 기록을 고정했습니다. 다시 측정하려면 새로고침하세요.' : '현재 원시 관측값입니다. 화면 조작 후 다시 기록할 수 있습니다.';
      }, 0);
    }));
  }

  function addUI() {
    if (document.getElementById('top-level-qa-toggle')) return;
    const container = document.createElement('aside');
    container.dataset.r4QaHarness = 'true';
    container.setAttribute('aria-label', 'R4 top-level LAB 검수 도구');
    container.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:2147483600;font:12px/1.5 system-ui,sans-serif;color:#25312c;';
    const buttonStyle = 'font:inherit;color:#25312c;background:#fffdfa;border:1px solid #546559;border-radius:4px;min-height:44px;padding:8px 12px;cursor:pointer;';
    const toggle = document.createElement('button'); toggle.id = 'top-level-qa-toggle'; toggle.type = 'button'; toggle.textContent = 'R4 LAB 기록'; toggle.style.cssText = buttonStyle; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'top-level-qa-drawer');
    drawer = document.createElement('section'); drawer.id = 'top-level-qa-drawer'; drawer.hidden = true; drawer.style.cssText = 'width:min(680px,calc(100vw - 24px));max-height:75vh;overflow:auto;background:#f5f0e9;border:1px solid #546559;padding:14px;border-radius:5px;margin-bottom:8px;box-shadow:0 8px 32px #0003;';
    const title = document.createElement('h2'); title.textContent = 'Top-level LAB · 원시 관측 기록'; title.style.cssText = 'font:600 16px/1.4 system-ui;margin:0 0 8px;';
    const note = document.createElement('p'); note.textContent = '현재 브라우저의 최상위 홈페이지 관측입니다. 필드 75백분위와 INP 합격을 뜻하지 않습니다. 이 도구의 클릭도 원시 event 기록에 남깁니다.'; note.style.cssText = 'margin:0 0 10px;';
    const actions = document.createElement('div'); actions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const collectButton = document.createElement('button'); collectButton.type = 'button'; collectButton.id = 'top-level-qa-collect'; collectButton.textContent = '현재 값 기록'; collectButton.style.cssText = buttonStyle;
    const freezeButton = document.createElement('button'); freezeButton.type = 'button'; freezeButton.id = 'top-level-qa-freeze'; freezeButton.textContent = '관측 종료·고정'; freezeButton.style.cssText = buttonStyle;
    const closeButton = document.createElement('button'); closeButton.type = 'button'; closeButton.textContent = '닫기'; closeButton.style.cssText = buttonStyle;
    status = document.createElement('p'); status.setAttribute('role', 'status'); status.style.cssText = 'margin:10px 0 0;';
    report = document.createElement('pre'); report.id = 'top-level-qa-report'; report.style.cssText = 'font:11px/1.5 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;background:#fffdfa;padding:12px;border:1px solid #b4bbaf;margin:10px 0 0;'; report.textContent = JSON.stringify(snapshot(), null, 2);
    collectButton.addEventListener('click', () => collect(false)); freezeButton.addEventListener('click', () => collect(true));
    const hide = () => { drawer.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); };
    closeButton.addEventListener('click', hide);
    toggle.addEventListener('click', () => { drawer.hidden = !drawer.hidden; toggle.setAttribute('aria-expanded', String(!drawer.hidden)); if (!drawer.hidden) collect(false); });
    container.addEventListener('keydown', event => { if (event.key === 'Escape' && !drawer.hidden) { event.preventDefault(); hide(); } });
    actions.append(collectButton, freezeButton, closeButton); drawer.append(title, note, actions, status, report); container.append(drawer, toggle); document.body.append(container);
  }
  if (document.readyState === 'complete') addUI(); else window.addEventListener('load', addUI, { once: true });
  window.addEventListener('pagehide', event => { state.pageLifecycle.push({ type: 'pagehide', time: round(performance.now()), persisted: event.persisted }); });
  window.addEventListener('pageshow', event => { state.pageLifecycle.push({ type: 'pageshow', time: round(performance.now()), persisted: event.persisted }); });
})();
