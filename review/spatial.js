(function () {
  'use strict';
  // QA-only harness. No storage, telemetry, messages to services or authenticated API calls.
  const $ = id => document.getElementById(id);
  const controls = { width: $('viewport-width'), scene: $('scene'), fixture: $('fixture'), reduced: $('reduce-motion') };
  const viewportHeights = { 1440: 900, 1280: 900, 768: 1024, 390: 844, 320: 740 };
  let frame, run = 0, frameReady = false, observers = [], metrics, cleanups = [], pending = 0;
  const history = [];
  const round = n => Number.isFinite(n) ? Math.round(n * 1000) / 1000 : null;
  const status = text => { $('status').textContent = text; };

  function dispose() {
    observers.forEach(observer => observer.disconnect()); observers = [];
    cleanups.forEach(fn => fn()); cleanups = [];
    window.clearTimeout(pending);
  }

  function sizeFrame() {
    if (!frame) return;
    const width = Number(controls.width.value), height = viewportHeights[width];
    const available = Math.max(200, $('viewport-zone').clientWidth - 26);
    const scale = Math.min(1, available / width);
    frame.style.width = `${width}px`; frame.style.height = `${height}px`; frame.style.transform = `scale(${scale})`;
    $('frame-shell').style.width = `${width * scale}px`; $('frame-shell').style.height = `${height * scale}px`;
    $('viewport-state').textContent = `${width} × ${height} CSS px · 표시 ${Math.round(scale * 100)}% · ${controls.fixture.options[controls.fixture.selectedIndex].text}`;
  }

  function observePerformance(win) {
    const supported = win.PerformanceObserver?.supportedEntryTypes || [];
    metrics = {
      source: 'same-origin iframe PerformanceObserver; lab sample, not field p75',
      nativeReducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
      networkProfile: 'Current browser network; no throttle applied by harness',
      cpuProfile: 'Current browser CPU; no throttle applied by harness',
      supportedEntryTypes: supported,
      lcpMs: null, cls: null, longestObservedInteractionMs: null,
      layoutShiftEntries: [],
      observedInteractionCount: 0, interactionCaveat: 'Longest observed interaction is not a field INP result; absent entries are NOT OBSERVED, not zero.'
    };
    if (controls.fixture.value === 'no-js') { metrics.status = 'NOT RUN: page scripts blocked; no performance observers attached'; return; }
    const connect = (type, callback, options = {}) => {
      if (!supported.includes(type)) return false;
      try {
        const observer = new win.PerformanceObserver(list => { callback(list.getEntries()); renderMetrics(); });
        observer.observe({ type, buffered: true, ...options }); observers.push(observer); return true;
      } catch (error) { metrics[`${type}Error`] = String(error.message); return false; }
    };
    connect('largest-contentful-paint', entries => { for (const entry of entries) metrics.lcpMs = round(entry.startTime); });
    let sessionStart = -1, sessionLast = -1, sessionValue = 0;
    if (connect('layout-shift', entries => {
      for (const entry of entries) {
        const rectangle = rect => rect ? { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) } : null;
        metrics.layoutShiftEntries.push({
          value: round(entry.value), time: round(entry.startTime), hadRecentInput: entry.hadRecentInput,
          sources: (entry.sources || []).slice(0, 6).map(source => ({ node: source.node ? { tag: source.node.tagName, id: source.node.id || '', class: typeof source.node.className === 'string' ? source.node.className : '' } : null, previousRect: rectangle(source.previousRect), currentRect: rectangle(source.currentRect) }))
        });
        if (metrics.layoutShiftEntries.length > 30) metrics.layoutShiftEntries.shift();
        if (entry.hadRecentInput) continue;
        if (sessionStart < 0 || entry.startTime - sessionLast > 1000 || entry.startTime - sessionStart > 5000) { sessionStart = entry.startTime; sessionValue = 0; }
        sessionLast = entry.startTime; sessionValue += entry.value;
        metrics.cls = round(Math.max(metrics.cls || 0, sessionValue));
      }
    })) metrics.cls = 0;
    const interactions = new Map();
    connect('event', entries => {
      for (const entry of entries) {
        if (!entry.interactionId) continue;
        interactions.set(entry.interactionId, Math.max(interactions.get(entry.interactionId) || 0, entry.duration));
      }
      metrics.observedInteractionCount = interactions.size;
      if (interactions.size) metrics.longestObservedInteractionMs = round(Math.max(...interactions.values()));
    }, { durationThreshold: 16 });
    metrics.status = 'Observing this navigation; record after the intended interactions';
  }

  function renderMetrics() {
    if (!metrics) return;
    const lcp = metrics.lcpMs === null ? 'NOT OBSERVED' : `${Math.round(metrics.lcpMs)}ms`;
    const cls = metrics.cls === null ? 'NOT RUN' : metrics.cls;
    const interaction = metrics.longestObservedInteractionMs === null ? 'NOT OBSERVED' : `${metrics.longestObservedInteractionMs}ms`;
    $('metric-state').textContent = `LAB · LCP ${lcp} / CLS ${cls} / interaction ${interaction}`;
  }

  function readSnapshot() {
    if (!frameReady || !frame?.contentDocument) return { status: 'NOT READY', run };
    const d = frame.contentDocument, w = frame.contentWindow;
    const visible = element => {
      const style = w.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
    };
    const active = d.activeElement;
    const images = [...d.images].map(img => ({ src: img.getAttribute('src'), complete: img.complete, naturalWidth: img.naturalWidth, width: round(img.getBoundingClientRect().width), height: round(img.getBoundingClientRect().height), loading: img.loading || 'eager' }));
    const roots = ['intro', 'changes', 'discovery', 'cases', 'flow', 'process', 'request'];
    const sections = Object.fromEntries(roots.map(id => { const element = d.getElementById(id); return [id, element ? { visible: visible(element), width: round(element.getBoundingClientRect().width), height: round(element.getBoundingClientRect().height) } : null]; }));
    const widths = { requested: Number(controls.width.value), innerWidth: w.innerWidth, clientWidth: d.documentElement.clientWidth, scrollWidth: d.documentElement.scrollWidth, bodyScrollWidth: d.body.scrollWidth };
    return {
      run, recordedAt: new Date().toISOString(), fixture: controls.fixture.value, scene: controls.scene.value,
      viewport: { ...widths, innerHeight: w.innerHeight, horizontalOverflow: Math.max(widths.scrollWidth, widths.bodyScrollWidth) - widths.clientWidth > 1, displayedScale: frame.style.transform },
      reviewReduced: controls.reduced.checked, appliedReviewReduced: d.documentElement.dataset.reviewReduced || 'unset',
      performance: { ...metrics, fcpMs: controls.fixture.value === 'no-js' ? null : w.performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime ?? null },
      document: { title: d.title, h1Count: d.querySelectorAll('h1').length, h1Visible: !!d.querySelector('h1') && visible(d.querySelector('h1')), robots: d.querySelector('meta[name=robots]')?.content, canonical: d.querySelector('link[rel=canonical]')?.getAttribute('href'), fontsStatus: d.fonts?.status || 'unavailable', imageCount: images.length, loadedImageCount: images.filter(img => img.complete && img.naturalWidth > 0).length, images, sections },
      controls: { store: d.querySelector('[data-change][aria-selected=true]')?.dataset.change, flow: d.querySelector('[data-flow][aria-selected=true]')?.dataset.flow, industry: d.querySelector('[data-industry][aria-selected=true]')?.dataset.industry, formEnabled: d.getElementById('request-fields')?.disabled === false, activeElement: active ? { tag: active.tagName, id: active.id, role: active.getAttribute('role') } : null },
      vendor: { gsapPresent: !!w.gsap, gsapVersion: w.gsap?.version ?? null, scrollTriggerPresent: !!w.ScrollTrigger },
      limitations: ['CSS iframe viewport, not native device emulation', 'No field p75 claim', 'No physical mobile or native screen-reader claim', 'No native CPU/network throttling by this harness', 'Scripted fixtures allow native form events for local request preparation; a capture-phase submit guard prevents default form navigation without stopping page handlers', 'No input values captured; outbound/authenticated navigation blocked by the harness']
    };
  }

  function collect() {
    const snapshot = readSnapshot();
    const same = history.findIndex(item => item.run === snapshot.run && item.scene === snapshot.scene && item.reviewReduced === snapshot.reviewReduced);
    if (same >= 0) history[same] = snapshot; else history.push(snapshot);
    if (history.length > 50) history.shift();
    $('qa-report').textContent = JSON.stringify({ harness: 'Weplace R4 Spatial QA', current: snapshot, records: history }, null, 2);
    status('현재 화면의 검수 관측값을 기록했습니다.');
  }

  function moveToScene() {
    if (!frameReady) return;
    const target = frame.contentDocument.getElementById(controls.scene.value);
    const win = frame.contentWindow;
    const headerHeight = frame.contentDocument.querySelector('.site-header')?.getBoundingClientRect().height || 0;
    if (target) win.scrollTo({ top: controls.scene.value === 'intro' ? 0 : Math.max(0, target.getBoundingClientRect().top + win.scrollY - headerHeight - 16), behavior: 'instant' });
    status(`${controls.scene.options[controls.scene.selectedIndex].text} 장면`);
  }

  function applyReduced() {
    if (!frameReady) return;
    frame.contentWindow.postMessage({ type: 'weplace-motion', reduced: controls.reduced.checked }, window.location.origin);
    if (controls.fixture.value === 'no-js') status('JS 차단: 정적 콘텐츠 확인 중. 모션 메시지 수신 스크립트도 실행되지 않습니다.');
  }

  function guardNavigation(d) {
    const guard = event => {
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      let destination; try { destination = new URL(link.getAttribute('href'), window.location.origin); } catch (_) { return; }
      if (destination.origin !== window.location.origin || destination.pathname !== '/') {
        event.preventDefault(); status('검수 화면 밖 이동을 차단했습니다. 실제 상담·인증 동작은 실행하지 않습니다.');
      }
    };
    d.addEventListener('click', guard, true); cleanups.push(() => d.removeEventListener('click', guard, true));
    // Permit the page's local submit listener to prepare text, while preventing
    // every form's browser-default navigation. Do not stop event propagation.
    const guardSubmit = event => { event.preventDefault(); };
    d.addEventListener('submit', guardSubmit, true);
    cleanups.push(() => d.removeEventListener('submit', guardSubmit, true));
  }

  async function mount() {
    dispose(); frameReady = false; run++; const currentRun = run;
    metrics = null; $('metric-state').textContent = '측정 대기'; status('화면을 다시 로드합니다.');
    const mode = controls.fixture.value;
    frame = document.createElement('iframe'); frame.id = 'review-frame'; frame.title = `Weplace R4 · ${controls.width.value}px · ${mode}`; frame.referrerPolicy = 'no-referrer';
    frame.setAttribute('sandbox', mode === 'no-js' ? 'allow-same-origin' : 'allow-same-origin allow-scripts allow-forms');
    frame.addEventListener('load', () => {
      if (currentRun !== run) return;
      try {
        if (!frame.contentDocument?.getElementById('main')) return;
        frameReady = true; guardNavigation(frame.contentDocument); observePerformance(frame.contentWindow); applyReduced(); moveToScene(); renderMetrics();
        const ready = frame.contentDocument.fonts?.ready || Promise.resolve();
        ready.then(() => { if (currentRun !== run) return; pending = window.setTimeout(() => { if (currentRun === run) collect(); }, 1200); });
      } catch (error) { status(`프레임 검사 실패: ${error.message}`); }
    });
    if (mode === 'no-gsap' || mode === 'no-photo') {
      try {
        // The sole fetch is the same-origin public homepage; no application API is accessed.
        const response = await fetch('/', { credentials: 'omit', cache: 'no-store' });
        if (!response.ok) throw Error(`홈페이지 HTTP ${response.status}`);
        const source = new DOMParser().parseFromString(await response.text(), 'text/html');
        if (mode === 'no-gsap') source.querySelectorAll('script[src]').forEach(script => { if (/(?:^|\/)(?:gsap|ScrollTrigger)(?:\.min)?\.js(?:\?|$)/i.test(script.getAttribute('src'))) script.remove(); });
        if (mode === 'no-photo') source.querySelectorAll('img[src*="example-space.webp"]').forEach(img => { img.src = '/__qa_missing_space_image__.webp'; });
        const base = source.createElement('base'); base.href = window.location.origin + '/'; source.head.prepend(base);
        if (currentRun !== run) return;
        frame.srcdoc = '<!doctype html>\n' + source.documentElement.outerHTML;
      } catch (error) { status(`Fixture 준비 실패: ${error.message}`); return; }
    } else frame.src = '/';
    // Size before insertion so the frame never paints at the browser's default
    // 300 × 150 iframe dimensions and pollutes the measured navigation CLS.
    sizeFrame(); $('frame-shell').replaceChildren(frame);
  }

  controls.width.addEventListener('change', mount);
  controls.fixture.addEventListener('change', mount);
  controls.scene.addEventListener('change', moveToScene);
  controls.reduced.addEventListener('change', applyReduced);
  $('reload').addEventListener('click', mount);
  $('collect').addEventListener('click', collect);
  window.addEventListener('resize', sizeFrame, { passive: true });
  window.addEventListener('pagehide', dispose);
  mount();
})();
