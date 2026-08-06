// Synthesized cinematic SFX for the launch splash — no audio files.
// Everything is generated with WebAudio so it stays tiny and instant.
// Timed to the splash scene clock (3.3s). Fails silently when the
// browser blocks autoplay (cold launch before any user gesture).

type AudioContextCtor = typeof AudioContext;

function getCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/** Plays the splash soundscape. Returns a stop/cleanup function. */
export function playSplashAudio(): () => void {
  const Ctor = getCtor();
  if (!Ctor) return () => {};

  let ctx: AudioContext;
  try {
    ctx = new Ctor();
  } catch {
    return () => {};
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const master = ctx.createGain();
  master.gain.value = 0.42;
  master.connect(ctx.destination);
  const t0 = ctx.currentTime + 0.06;

  const brownNoise = (seconds: number): AudioBuffer => {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.4;
    }
    return buf;
  };
  const whiteNoise = (seconds: number): AudioBuffer => {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  };

  try {
    // 1) Deep thunder rumble — swells as the monument appears (0–3.1s)
    const thunder = ctx.createBufferSource();
    thunder.buffer = brownNoise(3.3);
    const thunderLp = ctx.createBiquadFilter();
    thunderLp.type = "lowpass";
    thunderLp.frequency.value = 120;
    const thunderGain = ctx.createGain();
    thunderGain.gain.setValueAtTime(0.0001, t0);
    thunderGain.gain.linearRampToValueAtTime(0.55, t0 + 0.5);
    thunderGain.gain.exponentialRampToValueAtTime(0.001, t0 + 3.1);
    thunder.connect(thunderLp).connect(thunderGain).connect(master);
    thunder.start(t0);
    thunder.stop(t0 + 3.3);

    // Sub-bass bed under everything
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 42;
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.12, t0);
    subGain.gain.exponentialRampToValueAtTime(0.001, t0 + 3.0);
    sub.connect(subGain).connect(master);
    sub.start(t0);
    sub.stop(t0 + 3.1);

    // 2) Electrical crackle — sparks while power builds and ignites
    const crackleAt = [0.92, 1.02, 1.1, 1.22, 1.3, 1.58, 1.68, 1.8, 1.92, 2.04, 2.16];
    for (const offset of crackleAt) {
      const start = t0 + offset;
      const crack = ctx.createBufferSource();
      crack.buffer = whiteNoise(0.05);
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 2800;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.05);
      crack.connect(hp).connect(g).connect(master);
      crack.start(start);
      crack.stop(start + 0.06);
    }

    // 3) Bass impact on the lightning strike (1.2s)
    const impactAt = t0 + 1.2;
    const impact = ctx.createOscillator();
    impact.type = "sine";
    impact.frequency.setValueAtTime(68, impactAt);
    impact.frequency.exponentialRampToValueAtTime(26, impactAt + 0.45);
    const impactGain = ctx.createGain();
    impactGain.gain.setValueAtTime(0.95, impactAt);
    impactGain.gain.exponentialRampToValueAtTime(0.001, impactAt + 0.5);
    impact.connect(impactGain).connect(master);
    impact.start(impactAt);
    impact.stop(impactAt + 0.55);

    // Strike transient — the crack of the bolt
    const snap = ctx.createBufferSource();
    snap.buffer = whiteNoise(0.22);
    const snapLp = ctx.createBiquadFilter();
    snapLp.type = "lowpass";
    snapLp.frequency.setValueAtTime(5200, impactAt);
    snapLp.frequency.exponentialRampToValueAtTime(420, impactAt + 0.2);
    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.5, impactAt);
    snapGain.gain.exponentialRampToValueAtTime(0.001, impactAt + 0.22);
    snap.connect(snapLp).connect(snapGain).connect(master);
    snap.start(impactAt);
    snap.stop(impactAt + 0.25);

    // 4) Metallic power-up sweep as the P ignites (1.5s)
    const powerAt = t0 + 1.5;
    for (const [from, to] of [[180, 520], [272, 786]] as const) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(from, powerAt);
      osc.frequency.exponentialRampToValueAtTime(to, powerAt + 0.5);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1100;
      bp.Q.value = 1.6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, powerAt);
      g.gain.linearRampToValueAtTime(0.14, powerAt + 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, powerAt + 0.55);
      osc.connect(bp).connect(g).connect(master);
      osc.start(powerAt);
      osc.stop(powerAt + 0.6);
    }

    // 5) Soft digital startup chime as the final pulse lands (2.82s)
    const chime = (freq: number, at: number, dur: number, vol: number) => {
      const start = t0 + at;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(g).connect(master);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };
    chime(659.25, 2.82, 0.16, 0.13); // E5
    chime(880.0, 2.96, 0.26, 0.11); // A5
  } catch {
    // Any scheduling error → silence, never break the splash.
  }

  return () => {
    try {
      ctx.close().catch(() => {});
    } catch {}
  };
}