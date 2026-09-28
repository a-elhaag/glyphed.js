// Scores the showcase: a 120 BPM motion-graphics track (Am–F–C–G) plus sound effects placed from the
// page's own cue list — pops for every icon that lands, bounces for every ball, swishes, risers and
// impacts on the cuts. All synthesis is plain PCM math: no samples, no dependencies, same output every run.
const RATE = 48000;
const BEAT = 0.5;
const BAR = 2;

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

// Am, F, C, G — one chord per bar. Each: [root midi (octave 3), chord tones as semitone offsets].
const CHORDS = [
  [57, [0, 3, 7]],
  [53, [0, 4, 7]],
  [48, [0, 4, 7]],
  [55, [0, 4, 7]],
];
const chordAt = (t) => CHORDS[Math.floor(t / BAR) % CHORDS.length];
/** Pentatonic-safe melody note from the current chord: degree k climbs through chord tones and octaves. */
function chordNote(t, k, octave = 2) {
  const [root, tones] = chordAt(t);
  const n = ((k % 3) + 3) % 3;
  return root + 12 * (octave + Math.floor(k / 3)) + tones[n];
}

function noiseSource(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return (((r ^ (r >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  };
}

class Bus {
  constructor(length) {
    this.L = new Float32Array(length);
    this.R = new Float32Array(length);
  }
  /** Mix a mono buffer in at time t with equal-power pan (0 = left, 1 = right). */
  add(t, mono, gain = 1, pan = 0.5) {
    const start = Math.floor(t * RATE);
    const gl = Math.cos((pan * Math.PI) / 2) * gain;
    const gr = Math.sin((pan * Math.PI) / 2) * gain;
    for (let i = 0; i < mono.length; i++) {
      const idx = start + i;
      if (idx < 0 || idx >= this.L.length) continue;
      this.L[idx] += mono[i] * gl;
      this.R[idx] += mono[i] * gr;
    }
  }
  addStereo(t, left, right, gain = 1) {
    const start = Math.floor(t * RATE);
    for (let i = 0; i < left.length; i++) {
      const idx = start + i;
      if (idx < 0 || idx >= this.L.length) continue;
      this.L[idx] += left[i] * gain;
      this.R[idx] += right[i] * gain;
    }
  }
}

const buf = (seconds) => new Float32Array(Math.max(1, Math.floor(seconds * RATE)));

// ── Instruments ───────────────────────────────────────────────────────────────
function kickDrum() {
  const out = buf(0.45);
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const f = 48 + 110 * Math.exp(-t / 0.035);
    phase += (2 * Math.PI * f) / RATE;
    const amp = Math.exp(-t / 0.16) * (t < 0.002 ? t / 0.002 : 1);
    const click = t < 0.004 ? (1 - t / 0.004) * 0.35 : 0;
    out[i] = Math.tanh(Math.sin(phase) * amp * 1.6) + click;
  }
  return out;
}

function clap(noise) {
  const out = buf(0.35);
  let low = 0, band = 0;
  const fc = 2 * Math.sin((Math.PI * 1500) / RATE);
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    // Three quick hand hits, then a short room tail.
    const hits = [0, 0.011, 0.023].reduce((a, h) => a + (t >= h ? Math.exp(-(t - h) / 0.006) : 0), 0);
    const tail = Math.exp(-t / 0.09) * 0.6;
    const x = noise();
    low += fc * band;
    const high = x - low - 0.7 * band;
    band += fc * high;
    out[i] = band * (hits * 0.8 + tail) * 1.4;
  }
  return out;
}

function hat(noise, open = false) {
  const out = buf(open ? 0.16 : 0.05);
  let prev = 0, prev2 = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const x = noise();
    const hp = x - 2 * prev + prev2; // crude high-pass: keeps only the sizzle
    prev2 = prev;
    prev = x;
    out[i] = hp * Math.exp(-t / (open ? 0.05 : 0.012)) * 0.35;
  }
  return out;
}

/** Band-limited saw by additive partials, with a one-pole low-pass for warmth. */
function saw(freq, seconds, { harmonics = 10, cutoff = 2400, attack = 0.005, decay = 0.2, sustain = 0.5, release = 0.05, detune = 0 } = {}) {
  const out = buf(seconds + release);
  const f = freq * Math.pow(2, detune / 1200);
  const maxH = Math.max(1, Math.min(harmonics, Math.floor(18000 / f)));
  const k = 1 - Math.exp((-2 * Math.PI * cutoff) / RATE);
  let lp = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    let s = 0;
    for (let h = 1; h <= maxH; h++) s += Math.sin(2 * Math.PI * f * h * t) / h;
    const env =
      t < attack ? t / attack : t < seconds ? sustain + (1 - sustain) * Math.exp(-(t - attack) / decay) : (sustain + (1 - sustain) * Math.exp(-(seconds - attack) / decay)) * Math.max(0, 1 - (t - seconds) / release);
    lp += (s - lp) * k;
    out[i] = lp * env * 0.6;
  }
  return out;
}

/** Soft mallet/pluck: sine + a little octave, quick decay. */
function pluck(freq, seconds = 0.5, bright = 0.3) {
  const out = buf(seconds);
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const env = Math.min(1, t / 0.003) * Math.exp(-t / (seconds * 0.28));
    out[i] = env * (Math.sin(2 * Math.PI * freq * t) + bright * Math.exp(-t / 0.05) * Math.sin(4 * Math.PI * freq * t) + 0.12 * Math.sin(6 * Math.PI * freq * t) * Math.exp(-t / 0.03));
  }
  return out;
}

/** Bubble pop: a sine that chirps up and settles, very short. */
function pop(freq) {
  const out = buf(0.16);
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const f = freq * (1 + 0.6 * Math.exp(-t / 0.012));
    phase += (2 * Math.PI * f) / RATE;
    out[i] = Math.sin(phase) * Math.min(1, t / 0.002) * Math.exp(-t / 0.045);
  }
  return out;
}

/** Ball bounce: a round, pitched "bop" with a soft body thump under it. */
function bounce(freq, level) {
  const out = buf(0.22);
  let phase = 0, body = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const f = freq * (1 - 0.25 * Math.min(1, t / 0.05));
    phase += (2 * Math.PI * f) / RATE;
    body += (2 * Math.PI * (90 + 60 * Math.exp(-t / 0.02))) / RATE;
    out[i] = (Math.sin(phase) * Math.exp(-t / 0.06) + 0.8 * Math.sin(body) * Math.exp(-t / 0.05)) * Math.min(1, t / 0.0015) * level;
  }
  return out;
}

/** Air: noise through a state-variable band-pass that sweeps, with a smooth envelope. */
function sweepNoise(noise, seconds, f0, f1, { q = 0.6, shape = (p) => Math.sin(Math.PI * p) } = {}) {
  const out = buf(seconds);
  let low = 0, band = 0;
  for (let i = 0; i < out.length; i++) {
    const p = i / out.length;
    const f = f0 * Math.pow(f1 / f0, p);
    const fc = 2 * Math.sin((Math.PI * Math.min(f, 12000)) / RATE);
    const x = noise();
    low += fc * band;
    const high = x - low - q * band;
    band += fc * high;
    out[i] = band * shape(p);
  }
  return out;
}

function riser(noise, seconds) {
  const air = sweepNoise(noise, seconds, 300, 7000, { q: 0.4, shape: (p) => Math.pow(p, 2.2) });
  let phase = 0;
  for (let i = 0; i < air.length; i++) {
    const p = i / air.length;
    phase += (2 * Math.PI * (220 * Math.pow(4, p))) / RATE;
    air[i] = air[i] * 0.9 + Math.sin(phase) * Math.pow(p, 3) * 0.18;
  }
  return air;
}

function impact(noise, soft = false) {
  const out = buf(1.4);
  let phase = 0, low = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    phase += (2 * Math.PI * (38 + 70 * Math.exp(-t / 0.08))) / RATE;
    low += (noise() - low) * (0.02 + 0.2 * Math.exp(-t / 0.05));
    out[i] = (Math.sin(phase) * Math.exp(-t / 0.45) * 1.1 + low * Math.exp(-t / 0.3) * 1.5) * (soft ? 0.5 : 1);
  }
  return out;
}

function chime(freq) {
  const out = buf(1.6);
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    out[i] = Math.min(1, t / 0.002) * (Math.sin(2 * Math.PI * freq * t) * Math.exp(-t / 0.5) + 0.4 * Math.sin(2 * Math.PI * freq * 2.76 * t) * Math.exp(-t / 0.18) + 0.2 * Math.sin(2 * Math.PI * freq * 5.4 * t) * Math.exp(-t / 0.08));
  }
  return out;
}

function keyClick(noise) {
  const out = buf(0.02);
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    out[i] = (Math.sin(2 * Math.PI * 2600 * t) * 0.5 + noise() * 0.3) * Math.exp(-t / 0.003);
  }
  return out;
}

// ── Effects ───────────────────────────────────────────────────────────────────
/** Small Schroeder/Freeverb-style room: four combs into two all-passes per side. */
function reverb(bus, { size = 0.82, damp = 0.35, mix = 1 } = {}) {
  const out = new Bus(bus.L.length);
  const tunings = [1557, 1617, 1491, 1422];
  const allpass = [556, 441];
  for (const [src, dst, spread] of [[bus.L, out.L, 0], [bus.R, out.R, 23]]) {
    const acc = new Float32Array(src.length);
    for (const tuning of tunings) {
      const n = tuning + spread;
      const line = new Float32Array(n);
      let idx = 0, store = 0;
      for (let i = 0; i < src.length; i++) {
        const y = line[idx];
        store = y * (1 - damp) + store * damp;
        line[idx] = src[i] * 0.015 + store * size;
        idx = (idx + 1) % n;
        acc[i] += y;
      }
    }
    for (const a of allpass) {
      const n = a + spread;
      const line = new Float32Array(n);
      let idx = 0;
      for (let i = 0; i < acc.length; i++) {
        const b = line[idx];
        line[idx] = acc[i] + b * 0.5;
        acc[i] = b - acc[i];
        idx = (idx + 1) % n;
      }
    }
    for (let i = 0; i < acc.length; i++) dst[i] = acc[i] * mix;
  }
  return out;
}

// ── Arrangement ───────────────────────────────────────────────────────────────
export function scoreShowcase({ total, events }) {
  const length = Math.ceil((total + 2) * RATE);
  const drums = new Bus(length);
  const music = new Bus(length); // sidechained to the kick
  const sfx = new Bus(length);
  const send = new Bus(length); // reverb send
  const noise = noiseSource(11);

  const groove = (t) => (t >= 6 && t < 38) || (t >= 44 && t < 50);
  const breakdown = (t) => t >= 38 && t < 44;
  const kickTimes = [];

  const K = kickDrum();
  const C = clap(noise);
  for (let t = 0; t < total; t += BEAT / 2) {
    const beat = Math.round(t / BEAT * 2) / 2;
    const onBeat = Math.abs(beat - Math.round(beat)) < 1e-6;
    const beatInBar = Math.round(beat) % 4;
    if (groove(t) && onBeat) {
      drums.add(t, K, 0.95);
      kickTimes.push(t);
    }
    if ((groove(t) || breakdown(t)) && onBeat && (beatInBar === 1 || beatInBar === 3)) {
      drums.add(t, C, 0.42, 0.55);
      send.add(t, C, 0.25);
    }
    // Hats: soft 16ths build through the intro; off-beat opens in the groove.
    if (t < 6 && t > 1) drums.add(t, hat(noise), 0.12 + 0.2 * (t / 6), 0.62);
    if (groove(t)) {
      drums.add(t, hat(noise, !onBeat), onBeat ? 0.18 : 0.3, onBeat ? 0.4 : 0.6);
    }
  }
  for (let t = 6; t < total; t += BEAT / 4) {
    if (groove(t) && Math.round(t * 8) % 2 === 1) drums.add(t, hat(noise), 0.1, 0.7);
  }
  // Last hit: kick + crash-ish air on the final chord.
  drums.add(50, K, 1);
  kickTimes.push(50);

  // Bass: driving 8ths on the root, octave pop on the last of each beat pair.
  for (let t = 6; t < 50; t += BEAT / 2) {
    if (!groove(t)) continue;
    const [root] = chordAt(t);
    const step = Math.round(t / (BEAT / 2)) % 4;
    const note = root - 24 + (step === 3 ? 12 : 0);
    music.add(t, saw(midi(note), BEAT / 2 - 0.02, { harmonics: 8, cutoff: 900, decay: 0.12, sustain: 0.55 }), 0.5);
  }

  // Pad: one warm chord per bar all the way through (quieter in the intro).
  for (let bar = 0; bar * BAR < total; bar++) {
    const t = bar * BAR;
    const [root, tones] = chordAt(t);
    const level = t < 6 ? 0.08 : breakdown(t) ? 0.14 : 0.1;
    for (const n of tones) {
      for (const d of [-7, 7]) {
        const v = saw(midi(root + n), BAR, { harmonics: 6, cutoff: t < 6 || breakdown(t) ? 900 : 1600, attack: 0.25, decay: 1, sustain: 0.8, release: 0.3, detune: d });
        music.add(t, v, level, d < 0 ? 0.3 : 0.7);
      }
    }
  }

  // Stabs on the off-beats in the groove.
  for (let t = 6 + BEAT / 2; t < 50; t += BEAT) {
    if (!groove(t)) continue;
    const [root, tones] = chordAt(t);
    for (const n of tones) {
      const v = saw(midi(root + 12 + n), 0.12, { harmonics: 9, cutoff: 3200, decay: 0.06, sustain: 0.2, release: 0.08 });
      music.add(t, v, 0.09, 0.5 + (n - 4) * 0.04);
      send.add(t, v, 0.05);
    }
  }

  // Arpeggio: 16ths through the icon and chart sections, filtered in the breakdown.
  const arpOn = (t) => (t >= 14 && t < 24) || (t >= 30 && t < 38) || breakdown(t) || (t >= 44 && t < 50);
  const pattern = [0, 1, 2, 3, 2, 1, 2, 4];
  for (let t = 14; t < 50; t += BEAT / 4) {
    if (!arpOn(t)) continue;
    const step = Math.round(t / (BEAT / 4));
    const note = chordNote(t, pattern[step % pattern.length], 2);
    const v = pluck(midi(note), 0.28, breakdown(t) ? 0.1 : 0.35);
    music.add(t, v, breakdown(t) ? 0.09 : 0.11, step % 2 ? 0.3 : 0.7);
    send.add(t, v, 0.07);
  }

  // Intro: a gentle bell melody over the pad while the balls drop.
  [[0, 0], [0.5, 2], [1, 3], [1.5, 4], [2, 3], [3, 5], [3.5, 4], [4, 6]].forEach(([t, k]) => {
    const v = chime(midi(chordNote(t, k, 2)));
    music.add(t, v, 0.12, 0.5);
    send.add(t, v, 0.12);
  });

  // ── SFX from the page's cues ────────────────────────────────────────────────
  for (const e of events) {
    const x = e.x ?? 0.5;
    switch (e.type) {
      case "pop": {
        if (e.chord) {
          for (const k of [0, 1, 2, 3]) sfx.add(e.t, pop(midi(chordNote(e.t, k, 3))), 0.22 * (e.level ?? 1), 0.3 + k * 0.13);
        } else {
          const v = pop(midi(chordNote(e.t, e.deg ?? 0, 3)));
          sfx.add(e.t, v, 0.26 * (e.level ?? 1), 0.2 + 0.6 * x);
          send.add(e.t, v, 0.1);
        }
        break;
      }
      case "bounce": {
        const v = bounce(midi(chordNote(e.t, e.i ?? 0, 2)), e.level ?? 1);
        sfx.add(e.t, v, 0.4, 0.25 + ((e.i ?? 0) % 5) * 0.12);
        send.add(e.t, v, 0.05);
        break;
      }
      case "swish":
        sfx.add(e.t, sweepNoise(noise, 0.35, 900, 5000, { q: 0.5 }), 0.1, 0.55);
        break;
      case "roll": {
        // Rumble of the ball rolling in, travelling left to right.
        const v = sweepNoise(noise, 0.75, 120, 500, { q: 0.9, shape: (p) => Math.sin(Math.PI * Math.min(1, p * 1.2)) * (0.7 + 0.3 * Math.sin(p * 60)) });
        const L = v.map((s, i) => s * Math.cos((i / v.length) * Math.PI / 2));
        const R = v.map((s, i) => s * Math.sin((i / v.length) * Math.PI / 2));
        sfx.addStereo(e.t, L, R, 0.35);
        break;
      }
      case "riser":
        sfx.add(e.t, riser(noise, 1.0), 0.16, 0.5);
        break;
      case "impact":
        sfx.add(e.t, impact(noise, e.soft), e.soft ? 0.35 : 0.5, 0.5);
        send.add(e.t, impact(noise, true), 0.15);
        break;
      case "marker":
        sfx.add(e.t, sweepNoise(noise, e.dur ?? 0.5, 1500, 3500, { q: 1.2, shape: (p) => Math.sin(Math.PI * p) * 0.8 }), 0.06, 0.6);
        break;
      case "key":
        sfx.add(e.t, keyClick(noise), 0.1, 0.45 + ((e.n ?? 0) % 3) * 0.05);
        break;
      case "click":
        sfx.add(e.t, keyClick(noise), 0.35, 0.6);
        break;
      case "chime":
        for (const [dt, k] of [[0, 3], [0.12, 5]]) {
          const v = chime(midi(chordNote(e.t, k, 2)));
          sfx.add(e.t + dt, v, 0.16, 0.55);
          send.add(e.t + dt, v, 0.15);
        }
        break;
      case "rocket": {
        const v = sweepNoise(noise, 1.6, 200, 6000, { q: 0.35, shape: (p) => Math.min(1, p * 3) * (1 - p) });
        const L = v.map((s, i) => s * Math.cos((0.5 + 0.4 * (i / v.length)) * Math.PI / 2));
        const R = v.map((s, i) => s * Math.sin((0.5 + 0.4 * (i / v.length)) * Math.PI / 2));
        sfx.addStereo(e.t, L, R, 0.3);
        break;
      }
      case "sweep":
        sfx.add(e.t, sweepNoise(noise, 0.6, 400, 4000, { q: 0.5 }), 0.1, 0.5);
        break;
      case "finale": {
        const [root, tones] = chordAt(e.t);
        for (const n of [...tones, 12]) {
          for (const d of [-9, 9]) {
            const v = saw(midi(root + n), 2.4, { harmonics: 10, cutoff: 2600, attack: 0.01, decay: 0.8, sustain: 0.3, release: 0.4, detune: d });
            music.add(e.t, v, 0.12, d < 0 ? 0.3 : 0.7);
            send.add(e.t, v, 0.08);
          }
        }
        sfx.add(e.t, sweepNoise(noise, 2.2, 6000, 2500, { q: 0.3, shape: (p) => Math.exp(-p * 3) }), 0.2, 0.5);
        break;
      }
      case "outro":
        sfx.add(e.t, sweepNoise(noise, 1.0, 5000, 300, { q: 0.5 }), 0.14, 0.5);
        break;
    }
  }

  // ── Mix ─────────────────────────────────────────────────────────────────────
  // Sidechain: duck the musical bed under every kick for the classic pump.
  const duck = new Float32Array(length).fill(1);
  for (const k of kickTimes) {
    const s = Math.floor(k * RATE);
    for (let i = 0; i < 0.3 * RATE; i++) {
      const idx = s + i;
      if (idx >= length) break;
      const d = 1 - 0.6 * Math.exp(-i / RATE / 0.09) * Math.min(1, i / (0.004 * RATE));
      duck[idx] = Math.min(duck[idx], d);
    }
  }
  const room = reverb(send, { size: 0.84, damp: 0.3 });
  const L = new Float32Array(length);
  const R = new Float32Array(length);
  let hpL = 0, hpR = 0, prevL = 0, prevR = 0;
  const end = total * RATE;
  let rawPeak = 0;
  for (let i = 0; i < length; i++) {
    const l = drums.L[i] + music.L[i] * duck[i] + sfx.L[i] + room.L[i] * 0.9;
    const r = drums.R[i] + music.R[i] * duck[i] + sfx.R[i] + room.R[i] * 0.9;
    // DC blocker.
    hpL = 0.999 * (hpL + l - prevL); prevL = l;
    hpR = 0.999 * (hpR + r - prevR); prevR = r;
    const fade = Math.min(1, i / (0.05 * RATE)) * (i > end - 0.6 * RATE ? Math.max(0, (end - i) / (0.6 * RATE)) : 1);
    L[i] = hpL * fade;
    R[i] = hpR * fade;
    rawPeak = Math.max(rawPeak, Math.abs(L[i]), Math.abs(R[i]));
  }
  // Scale so only the loudest transients touch the soft clipper, then normalise to -1 dBFS.
  // Driving tanh harder would be louder but audibly crunchy.
  const drive = rawPeak > 0 ? 1.15 / rawPeak : 1;
  let peak = 0;
  for (let i = 0; i < length; i++) {
    L[i] = Math.tanh(L[i] * drive);
    R[i] = Math.tanh(R[i] * drive);
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  return wav(L, R, peak > 0 ? 0.89 / peak : 1);
}

function wav(L, R, norm) {
  const frames = L.length;
  const data = Buffer.alloc(frames * 4);
  for (let i = 0; i < frames; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), i * 4 + 2);
  }
  const head = Buffer.alloc(44);
  head.write("RIFF", 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write("WAVE", 8);
  head.write("fmt ", 12);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(2, 22);
  head.writeUInt32LE(RATE, 24);
  head.writeUInt32LE(RATE * 4, 28);
  head.writeUInt16LE(4, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}
