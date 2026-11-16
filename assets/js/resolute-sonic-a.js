/* Original 190ms sine signature. No recording, sample, request, or dependency. */
export function createFastSignature(context, delay = 0) {
  const at = context.currentTime + delay;
  const bus = context.createGain();
  bus.gain.setValueAtTime(.5, at);
  bus.connect(context.destination);
  const sources = [], gains = [];
  let finished = false, ended = 0, finish;
  const done = new Promise(resolve => { finish = resolve; });
  function release() {
    if (finished) return;
    finished = true;
    sources.forEach(source => { source.onended = null; source.disconnect(); });
    gains.forEach(gain => gain.disconnect()); bus.disconnect(); finish();
  }
  function tone(start, end, f0, f1, peak, attack) {
    const source = context.createOscillator(), gain = context.createGain();
    source.type = 'sine';
    source.frequency.setValueAtTime(f0, at + start);
    source.frequency.exponentialRampToValueAtTime(f1, at + end);
    gain.gain.setValueAtTime(0, at + start);
    gain.gain.linearRampToValueAtTime(peak, at + start + attack);
    gain.gain.exponentialRampToValueAtTime(.0001, at + end - .008);
    gain.gain.linearRampToValueAtTime(0, at + end);
    source.connect(gain); gain.connect(bus);
    source.onended = () => { if (++ended === 2) release(); };
    sources.push(source); gains.push(gain);
    source.start(at + start); source.stop(at + end);
  }
  try {
    tone(0, .125, 220, 540, .06, .012);
    tone(.105, .19, 660, 610, .032, .008);
  } catch (error) {
    sources.forEach(source => { try { source.stop(); } catch {} });
    release(); throw error;
  }
  return {
    done,
    stop() {
      if (finished) return;
      // Zero the shared output before cancelling scheduled nodes; no overlapping tail.
      bus.gain.cancelScheduledValues(context.currentTime);
      bus.gain.setValueAtTime(0, context.currentTime);
      sources.forEach(source => { try { source.stop(); } catch {} });
      release();
    }
  };
}
