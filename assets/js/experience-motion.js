(function () {
  'use strict';
  // Presentation only: no analytics, storage, requests, gestures or business state.
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var connection = navigator.connection;
  var manualReduce = false;
  var active = new Map();
  function constrained() { return !!(connection && (connection.saveData || /^(slow-)?2g$/.test(connection.effectiveType || ''))); }
  function reduced() { return manualReduce || !!(media && media.matches) || constrained(); }
  function cancel(node) {
    var animation = active.get(node);
    if (animation) { active.delete(node); animation.cancel(); }
  }
  function stopAll() { Array.from(active.keys()).forEach(cancel); }
  function syncPreference() {
    root.dataset.motion = reduced() ? 'reduced' : 'full';
    if (reduced()) stopAll();
    document.querySelectorAll('[data-motion-toggle]').forEach(function (button) {
      button.hidden = false;
      button.disabled = !!(media && media.matches) || constrained();
      button.setAttribute('aria-pressed', String(reduced()));
      button.textContent = button.disabled ? '기기 설정으로 움직임 줄임' : manualReduce ? '움직임 줄임 · 다시 켜기' : '움직임 줄이기';
    });
  }
  function play(node, kind, direction) {
    if (!node) return;
    cancel(node);
    // Content is committed first and remains visible even if animation is unsupported.
    if (reduced() || typeof node.animate !== 'function' || node.hidden) return;
    var style = getComputedStyle(root);
    var token = kind === 'reveal' ? '--motion-reveal' : kind === 'expand' ? '--motion-expand' : '--motion-switch';
    var duration = parseFloat(style.getPropertyValue(token)) || (kind === 'reveal' ? 480 : kind === 'expand' ? 320 : 260);
    var ease = style.getPropertyValue('--motion-ease').trim() || 'cubic-bezier(.2,.75,.2,1)';
    var frames = [{opacity: 0.55, transform: 'translateY(12px)'}, {opacity: 1, transform: 'translateY(0)'}];
    if (kind === 'switch') frames = [{opacity: 0.65, transform: 'translateX(' + (direction === 'before' ? '-8px' : '8px') + ')'}, {opacity: 1, transform: 'translateX(0)'}];
    if (kind === 'wipe' && window.CSS && CSS.supports('clip-path', 'inset(0 0 0 0)')) {
      frames = [{clipPath: direction === 'before' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', opacity: 0.8}, {clipPath: 'inset(0 0 0 0)', opacity: 1}];
      duration = parseFloat(style.getPropertyValue('--motion-wipe')) || 320;
    }
    try {
      var animation = node.animate(frames, {duration: duration, easing: ease, fill: 'none'});
      active.set(node, animation);
      var done = function () { if (active.get(node) === animation) active.delete(node); };
      animation.onfinish = done;
      animation.oncancel = done;
    } catch (_) { /* Motion failure must not interrupt a choice or hide information. */ }
  }
  window.WeplaceMotion = {play: play, cancel: cancel, isReduced: reduced};
  document.querySelectorAll('[data-motion-toggle]').forEach(function (button) {
    button.addEventListener('click', function () { manualReduce = !manualReduce; syncPreference(); });
  });
  if (media && media.addEventListener) media.addEventListener('change', syncPreference);
  else if (media && media.addListener) media.addListener(syncPreference);
  if (connection && connection.addEventListener) connection.addEventListener('change', syncPreference);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopAll(); });
  window.addEventListener('pagehide', stopAll);
  syncPreference();

  // One entrance per scene; no hidden initial styles or scroll interception.
  if (window.IntersectionObserver) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        play(entry.target, 'reveal');
      });
    }, {threshold: 0.15});
    document.querySelectorAll('[data-motion-reveal]').forEach(function (node) { observer.observe(node); });
  }
})();
