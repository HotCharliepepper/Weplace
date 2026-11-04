/* Weplace R4 — optional public-page motion. No account, network or storage access. */
(function () {
  'use strict';
  const page = document.body;
  if (!page.classList.contains('home-r4') || page.dataset.r4MotionBound === 'true') return;
  page.dataset.r4MotionBound = 'true';

  const root = document.documentElement;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  root.dataset.r4Motion = 'static';
  // R2 remains the functional controller. Optional script failures cannot hide
  // content or disable tabs, links, the booking explanation or manual requests.
  if (!gsap?.context || !gsap?.matchMedia || !ScrollTrigger?.create) return;

  let context = null;
  let heroEntered = false;
  let reviewReduced = root.dataset.reviewReduced === 'true';
  const entered = new WeakSet();
  const owned = element => Boolean(element?.closest('[data-motion-owner="gsap"]'));

  function unmount() {
    if (context) {
      const previous = context;
      context = null;
      previous.revert();
    }
    root.dataset.r4Motion = 'static';
  }

  function mount({ allowEntrances = true } = {}) {
    unmount();
    if (reviewReduced) {
      heroEntered = true;
      root.dataset.r4Motion = 'reduced';
      return;
    }
    try {
      // Assign before running setup so a setup failure can still fully revert.
      context = gsap.context(() => {}, page);
      context.add(() => {
        const media = gsap.matchMedia();
        let firstMediaPass = true;
        media.add({
          mobile: '(max-width: 639px)',
          tablet: '(min-width: 640px) and (max-width: 1023px)',
          desktop: '(min-width: 1024px)',
          reduce: '(prefers-reduced-motion: reduce)'
        }, mediaContext => {
          const restoring = !allowEntrances || !firstMediaPass;
          firstMediaPass = false;
          const { mobile, desktop, reduce } = mediaContext.conditions;
          if (reduce) {
            heroEntered = true;
            root.dataset.r4Motion = 'reduced';
            return;
          }
          root.dataset.r4Motion = mobile ? 'mobile' : desktop ? 'desktop' : 'tablet';
          const timelines = [];
          const triggers = [];
          const tilt = desktop ? 1.5 : .65;
          const duration = mobile ? .18 : desktop ? .34 : .28;
          const stagger = mobile ? 0 : desktop ? .045 : .03;

          // These timelines are created once per media context and reused.
          // Rapid tab presses never append animations or event listeners.
          function layerTimeline(elements, name) {
            const targets = elements.filter(element => element && owned(element));
            if (!targets.length) return null;
            const timeline = gsap.timeline({
              id: `weplace-r4-${name}`,
              paused: true,
              defaults: { ease: 'power2.out', overwrite: 'auto' }
            });
            targets.forEach((element, index) => {
              const from = mobile
                ? { opacity: .94 }
                : { opacity: .92, y: Math.min(14, 8 + index * 2), rotationY: index % 2 ? -tilt : tilt };
              const to = mobile
                ? { opacity: 1, clearProps: 'opacity' }
                : { opacity: 1, y: 0, rotationY: 0, clearProps: 'transform,opacity' };
              timeline.fromTo(element, from, {
                ...to, duration, immediateRender: false, force3D: false
              }, index * stagger);
            });
            timelines.push(timeline);
            return timeline;
          }

          function replay(timeline) {
            if (!timeline || document.hidden) return;
            timeline.pause(0).invalidate().restart();
          }

          function enterOnce(element, timeline, name) {
            if (!element || !timeline || entered.has(element)) return;
            if (restoring) {
              const bounds = element.getBoundingClientRect();
              if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
                entered.add(element);
                return;
              }
            }
            const trigger = ScrollTrigger.create({
              id: `weplace-r4-enter-${name}`,
              trigger: element,
              start: 'top 86%',
              once: true,
              onEnter: () => {
                entered.add(element);
                replay(timeline);
              }
            });
            triggers.push(trigger);
          }

          const store = document.getElementById('change-panel');
          const storeTimeline = layerTimeline(Array.from(store?.querySelectorAll('[data-store-layer]') || []), 'store');
          enterOnce(store, storeTimeline, 'store');

          const flow = document.querySelector('.flow-board');
          const flowTimeline = layerTimeline([
            ...Array.from(flow?.querySelectorAll('[data-flow-layer]') || []),
            flow?.querySelector('.flow-task')
          ], 'flow');
          enterOnce(flow, flowTimeline, 'flow');

          function drawLine(timeline, path, at) {
            if (!path?.getTotalLength) return;
            let length;
            try { length = path.getTotalLength(); } catch (_) { return; }
            if (!Number.isFinite(length) || length <= 0) return;
            timeline.fromTo(path, {
              strokeDasharray: `${length} ${length}`,
              strokeDashoffset: length
            }, {
              strokeDashoffset: 0,
              duration: .62,
              ease: 'power2.out',
              immediateRender: false,
              clearProps: 'strokeDasharray,strokeDashoffset'
            }, at);
          }

          const proof = document.querySelector('#intro .hero-proof');
          if (!heroEntered) {
            heroEntered = true;
            const bounds = proof?.getBoundingClientRect();
            // Mobile hero/chart remain immediate and static. Neither H1 nor
            // chart axes, values, bars or the truth footnote are ever selected.
            if (!restoring && !mobile && proof && owned(proof) && bounds.bottom > 0 && bounds.top < window.innerHeight) {
              const heroTimeline = gsap.timeline({ id: 'weplace-r4-hero', paused: true });
              heroTimeline.fromTo(proof, { y: 14, rotationX: desktop ? 2 : .75, opacity: .96 }, {
                y: 0, rotationX: 0, opacity: 1, duration: .72,
                ease: 'power2.out', immediateRender: false, force3D: false,
                clearProps: 'transform,opacity'
              }, 0);
              proof.querySelectorAll('.chart-line').forEach(path => drawLine(heroTimeline, path, .08));
              timelines.push(heroTimeline);
              replay(heroTimeline);
            }
          }

          // Optional case migration is opt-in at the card. Unmarked cards stay
          // with R2; marked cards have a line-only reveal and fixed bar geometry.
          if (!mobile) document.querySelectorAll('#cases [data-motion-owner="gsap"]').forEach((card, index) => {
            if (entered.has(card)) return;
            const timeline = gsap.timeline({ id: `weplace-r4-case-${index}`, paused: true });
            card.querySelectorAll('.chart-line').forEach(path => drawLine(timeline, path, 0));
            timelines.push(timeline);
            enterOnce(card, timeline, `case-${index}`);
          });

          function onTabChange(event) {
            if (event.detail?.kind === 'change' && event.target === store) replay(storeTimeline);
            if (event.detail?.kind === 'flow' && event.target.id === 'flow-panel') replay(flowTimeline);
          }
          function onStoreQuestion(event) {
            // Boot and before/after reset events are intentionally motion-free.
            if (event.detail?.fromUser === true && store?.contains(event.target)) replay(storeTimeline);
          }
          function settle() {
            if (document.hidden) timelines.forEach(timeline => {
              if (timeline.isActive()) timeline.progress(1).pause();
            });
          }
          document.addEventListener('weplace:tabchange', onTabChange);
          document.addEventListener('weplace:storequestion', onStoreQuestion);
          document.addEventListener('visibilitychange', settle);
          return () => {
            document.removeEventListener('weplace:tabchange', onTabChange);
            document.removeEventListener('weplace:storequestion', onStoreQuestion);
            document.removeEventListener('visibilitychange', settle);
            triggers.forEach(trigger => trigger.kill());
            // matchMedia/context also revert their saved styles. Explicit kill
            // makes cleanup independent of the current timeline play position.
            timelines.forEach(timeline => timeline.kill());
          };
        }, page);
        return () => media.revert();
      });
    } catch (_) {
      unmount();
      // Decorative failure is intentionally silent; all content already exists.
    }
  }

  try { gsap.registerPlugin(ScrollTrigger); } catch (_) { return; }
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.data?.type !== 'weplace-motion') return;
    const next = Boolean(event.data.reduced);
    if (next === reviewReduced) return;
    reviewReduced = next;
    mount({ allowEntrances: false });
  });
  window.addEventListener('pagehide', unmount);
  window.addEventListener('pageshow', event => { if (event.persisted) mount({ allowEntrances: false }); });
  mount();
})();
