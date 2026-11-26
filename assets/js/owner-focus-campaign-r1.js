/* WEPLACE / Owner Focus R1 — visual-only 15s web storyboard. No network, data collection or analytics. */
(() => {
  'use strict';
  const scenes = Array.from(document.querySelectorAll('[data-of-scene]'));
  const progress = document.getElementById('of-progress');
  const clock = document.getElementById('of-clock');
  const toggle = document.getElementById('of-toggle');
  const restart = document.getElementById('of-restart');
  if (!scenes.length || !progress || !clock || !toggle || !restart) return;
  const total = 15000;
  const boundaries = [3800, 7200, 11300, total];
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let elapsed = 0, playing = !reduced, last = 0, current = -1;
  const format = ms => '00:' + String(Math.floor(ms / 1000)).padStart(2, '0');
  function render() {
    let index = boundaries.findIndex(end => elapsed < end);
    if (index < 0) index = scenes.length - 1;
    if (index !== current) {
      scenes.forEach((scene, i) => {
        const active = i === index;
        scene.classList.toggle('active', active);
        scene.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      current = index;
    }
    progress.style.width = (elapsed / total * 100).toFixed(2) + '%';
    clock.textContent = format(elapsed) + ' / 00:15';
    toggle.textContent = playing ? '일시정지' : (elapsed >= total ? '다시 재생' : '재생');
    toggle.setAttribute('aria-pressed', playing ? 'false' : 'true');
  }
  function frame(ts) {
    if (playing) {
      if (last) elapsed = Math.min(total, elapsed + Math.max(0, Math.min(120, ts - last)));
      last = ts;
      if (elapsed >= total) { playing = false; last = 0; }
      render();
    } else last = 0;
    window.requestAnimationFrame(frame);
  }
  toggle.addEventListener('click', () => {
    if (elapsed >= total) elapsed = 0;
    playing = !playing; last = 0; render();
  });
  restart.addEventListener('click', () => { elapsed = 0; current = -1; playing = true; last = 0; render(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) { playing = false; last = 0; render(); }
  });
  render();
  window.requestAnimationFrame(frame);
})();
