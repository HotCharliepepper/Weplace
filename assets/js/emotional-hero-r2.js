/* Emotional Hero R2. Native scrolling, finite entrances, visible HTML fallback. */
(function () {
  'use strict';
  const host = document.querySelector('[data-emotional-hero]');
  if (!host) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const toggle = host.querySelector('[data-hero-motion]');
  const gs = window.gsap, st = window.ScrollTrigger;
  const scenes = [...host.querySelectorAll('[data-hero-scene]')];
  const entered = new WeakSet();
  let context = null, manualReduced = false;

  function constrained() {
    return Boolean((connection && (connection.saveData || /^(slow-2g|2g|3g)$/.test(connection.effectiveType)))
      || (navigator.deviceMemory && navigator.deviceMemory <= 2)
      || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2));
  }
  function settle() {
    if (context) { context.revert(); context = null; }
  }
  function mode() {
    if (reduced.matches || manualReduced) return 'reduced';
    if (constrained()) return 'low-resource';
    return gs?.context && st?.create ? 'gsap' : 'static';
  }
  function mount() {
    settle();
    const state = mode();
    host.dataset.heroMotion = state;
    toggle.hidden = state === 'static' || state === 'low-resource';
    toggle.disabled = reduced.matches;
    toggle.setAttribute('aria-pressed', String(state === 'reduced'));
    toggle.textContent = state === 'reduced' ? '움직임 줄이기 · 켜짐' : '움직임 줄이기';
    if (state !== 'gsap') return;
    try {
      gs.registerPlugin(st);
      context = gs.context(() => {}, host);
      context.add(() => {
        scenes.forEach((scene, index) => {
          if (entered.has(scene)) return;
          const entrance = () => {
            entered.add(scene);
            if (document.hidden) return;
            const lines = scene.querySelectorAll('[data-hero-reveal]');
            const tl = gs.timeline({id: 'weplace-emotional-' + index, defaults: {ease: 'power2.out'}});
            lines.forEach((line, i) => tl.fromTo(line, {opacity: 0, y: 16}, {
              opacity: 1, y: 0, duration: 1.45, immediateRender: true,
              clearProps: 'opacity,transform'
            }, i * (index === 0 ? .48 : .34)));
          };
          if (index === 0 && !location.hash && window.scrollY < 100) entrance();
          else st.create({id: 'weplace-emotional-trigger-' + index, trigger: scene,
            start: 'top 70%', once: true, onEnter: () => context?.add(entrance)});
        });
      });
    } catch (_) {
      settle(); host.dataset.heroMotion = 'static'; toggle.hidden = true;
    }
  }
  toggle.addEventListener('click', () => { manualReduced = !manualReduced; mount(); });
  reduced.addEventListener('change', mount);
  connection?.addEventListener?.('change', mount);
  // Tab changes and history restoration must never strand text at zero opacity.
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); else mount(); });
  window.addEventListener('pagehide', settle);
  window.addEventListener('pageshow', event => { if (event.persisted) mount(); });
  host.addEventListener('focusin', event => {
    if (event.target === toggle) return;
    const scene = event.target.closest('[data-hero-scene]');
    if (!scene || !gs) return;
    const targets = scene.querySelectorAll('[data-hero-reveal]');
    gs.killTweensOf(targets);
    gs.set(targets, {clearProps: 'opacity,transform'});
  });
  host.querySelectorAll('img').forEach(img => {
    const fail = () => { img.hidden = true; img.closest('figure')?.classList.add('image-unavailable'); };
    img.addEventListener('error', fail);
    if (img.complete && !img.naturalWidth) fail();
  });
  mount();
})();
