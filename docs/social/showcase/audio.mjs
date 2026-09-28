// Sound design for the showcase: no music, only the objects on screen. Balls bounce and roll, icons pop
// out of the balls that deliver them, cards flap and thud, the rocket takes off, keys and the mouse
// click. Pens are silent, the way they are in real life. Every sound comes from the page's cue list and
// is synthesised here from plain PCM math, so the result is identical on every render.
const RATE = 48000;

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
  /** Pan that travels from `from` to `to` over the sound's length. */
  addMoving(t, mono, gain, from, to) {
    const start = Math.floor(t * RATE);
    for (let i = 0; i < mono.length; i++) {
      const idx = start + i;
      if (idx < 0 || idx >= this.L.length) continue;
      const pan = from + (to - from) * (i / mono.length);
      this.L[idx] += mono[i] * Math.cos((pan * Math.PI) / 2) * gain;
      this.R[idx] += mono[i] * Math.sin((pan * Math.PI) / 2) * gain;
    }
  }
}

const buf = (seconds) => new Float32Array(Math.max(1, Math.floor(seconds * RATE)));

/** Two-pole state-variable filter over a signal generator; returns { low, band, high } per sample. */
function svf() {
  let low = 0, band = 0;
  return (x, freq, q = 0.7) => {
    const f = 2 * Math.sin((Math.PI * Math.min(freq, 14000)) / RATE);
    low += f * band;
    const high = x - low - q * band;
    band += f * high;
    return { low, band, high };
  };
}

// ── Objects ───────────────────────────────────────────────────────────────────

/** Rubber ball hitting a table: a short pitched "bonk" that bends down, plus the body thump. */
function rubberBounce(noise, pitch, level) {
  const out = buf(0.16);
  const filt = svf();
  let ph = 0, body = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    ph += (2 * Math.PI * pitch * (1 - 0.18 * Math.min(1, t / 0.04))) / RATE;
    body += (2 * Math.PI * (70 + 90 * Math.exp(-t / 0.012))) / RATE;
    const tap = filt(noise(), 2500, 1.2).band * Math.exp(-t / 0.002);
    out[i] = (0.55 * Math.sin(ph) * Math.exp(-t / 0.035) + 0.7 * Math.sin(body) * Math.exp(-t / 0.03) + 0.5 * tap) * Math.min(1, t / 0.0008) * level;
  }
  return out;
}

/** A ball rolling across paper: low, grainy rumble that wobbles with each turn. */
function roll(noise, seconds) {
  const out = buf(seconds);
  const filt = svf();
  for (let i = 0; i < out.length; i++) {
    const p = i / out.length;
    const t = i / RATE;
    const speed = 1 - p * 0.7; // decelerates as it arrives
    const wobble = 0.65 + 0.35 * Math.sin(2 * Math.PI * (7 * speed) * t);
    const env = Math.min(1, p * 8) * (1 - Math.pow(p, 3));
    out[i] = filt(noise(), 180 + 220 * speed, 0.8).band * wobble * env * 1.6;
  }
  return out;
}

/** The icon popping out of its ball: a small bubble pop. Pitch varies a little per icon, not per melody. */
function pop(freq) {
  const out = buf(0.09);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    ph += (2 * Math.PI * freq * (1 + 0.9 * Math.exp(-t / 0.006))) / RATE;
    out[i] = Math.sin(ph) * Math.min(1, t / 0.0015) * Math.exp(-t / 0.02);
  }
  return out;
}

/** Party popper: a sharp snap, then paper confetti fluttering down (soft, no crackle). */
function confetti(noise) {
  const out = buf(1.3);
  const snapF = svf();
  const rustle = svf();
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const snap = snapF(noise(), 3200, 0.9).band * Math.exp(-t / 0.006) * 1.6;
    const flutterEnv = Math.min(1, t / 0.05) * Math.exp(-t / 0.35) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 13 * t));
    out[i] = snap + rustle(noise(), 4200, 1.6).band * flutterEnv * 0.35;
  }
  return out;
}

/** A card flipping over: a quick paper flap. */
function flip(noise) {
  const out = buf(0.22);
  const filt = svf();
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const env = Math.exp(-Math.pow((t - 0.05) / 0.03, 2)) + 0.5 * Math.exp(-Math.pow((t - 0.12) / 0.02, 2));
    out[i] = filt(noise(), 1400 + 1600 * Math.exp(-t / 0.05), 1.1).band * env * 1.3;
  }
  return out;
}

/** Card sliding across the table. */
function slide(noise, seconds = 0.5) {
  const out = buf(seconds);
  const filt = svf();
  for (let i = 0; i < out.length; i++) {
    const p = i / out.length;
    out[i] = filt(noise(), 900, 1.4).band * Math.sin(Math.PI * Math.min(1, p * 1.3)) * (1 - p) * 0.9;
  }
  return out;
}

/** A light card or panel landing flat: low knock plus a soft slap. */
function thud(noise, level) {
  const out = buf(0.25);
  const filt = svf();
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    ph += (2 * Math.PI * (95 + 60 * Math.exp(-t / 0.015))) / RATE;
    const slap = filt(noise(), 700, 0.9).low * Math.exp(-t / 0.018);
    out[i] = (Math.sin(ph) * Math.exp(-t / 0.06) + slap * 1.4) * Math.min(1, t / 0.001) * level;
  }
  return out;
}

/** Mechanical keyboard key: a click on the way down and a softer "thock" off the plate. */
function key(noise, n) {
  const out = buf(0.06);
  const filt = svf();
  const pitch = 190 + ((n * 37) % 70);
  const clickF = 3800 + ((n * 131) % 1400);
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    ph += (2 * Math.PI * pitch) / RATE;
    const click = filt(noise(), clickF, 1.3).band * Math.exp(-t / 0.0015);
    const thock = Math.sin(ph) * Math.exp(-Math.max(0, t - 0.006) / 0.012) * (t > 0.006 ? 1 : 0);
    out[i] = click * 0.9 + thock * 0.5;
  }
  return out;
}

/** Mouse button: sharp micro-switch click (down), a slightly softer one (up). */
function mouse(noise, down) {
  const out = buf(0.03);
  const filt = svf();
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    out[i] = (filt(noise(), down ? 5200 : 4300, 1.5).band * Math.exp(-t / 0.0012) + Math.sin(2 * Math.PI * (down ? 1900 : 1600) * t) * Math.exp(-t / 0.003) * 0.4) * (down ? 1 : 0.7);
  }
  return out;
}

/** Soft notification ding for "Copied". */
function ding() {
  const out = buf(1.0);
  const f = 1318.5;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    out[i] = Math.min(1, t / 0.002) * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.28) + 0.25 * Math.sin(2 * Math.PI * f * 2.02 * t) * Math.exp(-t / 0.09));
  }
  return out;
}

/** A label chip placed on the page: tiny, dry tick. */
function tick(noise, i) {
  const out = buf(0.025);
  const filt = svf();
  for (let k = 0; k < out.length; k++) {
    const t = k / RATE;
    out[k] = filt(noise(), 2400 + (i % 4) * 300, 1.4).band * Math.exp(-t / 0.002) + Math.sin(2 * Math.PI * (900 + (i % 4) * 90) * t) * Math.exp(-t / 0.006) * 0.4;
  }
  return out;
}

/** Air moving: band-passed noise sweeping between two frequencies. */
function whoosh(noise, seconds, f0, f1) {
  const out = buf(seconds);
  const filt = svf();
  for (let i = 0; i < out.length; i++) {
    const p = i / out.length;
    out[i] = filt(noise(), f0 * Math.pow(f1 / f0, p), 0.55).band * Math.pow(Math.sin(Math.PI * p), 1.5);
  }
  return out;
}

/** The rocket: an engine rumble that shakes, ignites, and tears off upward. */
function rocket(noise) {
  const out = buf(2.2);
  const rumble = svf();
  const hiss = svf();
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const idle = t < 0.5 ? Math.min(1, t / 0.2) : 1;
    const shake = 0.75 + 0.25 * Math.sin(2 * Math.PI * 23 * t);
    const lift = t < 0.5 ? 0 : Math.min(1, (t - 0.5) / 0.1);
    const away = t < 0.9 ? 1 : Math.exp(-(t - 0.9) / 0.35);
    const low = rumble(noise(), 90 + 140 * lift, 0.7).band * idle * shake;
    const air = hiss(noise(), 600 + 5000 * Math.min(1, Math.max(0, t - 0.5) / 0.9), 0.5).band * lift;
    out[i] = (low * 1.6 + air * 0.9) * away;
  }
  return out;
}

// ── Mix ───────────────────────────────────────────────────────────────────────
/** A small, dry room so sounds sit in a space without washing out. */
function room(bus) {
  const out = new Bus(bus.L.length);
  for (const [src, dst, spread] of [[bus.L, out.L, 0], [bus.R, out.R, 17]]) {
    const acc = new Float32Array(src.length);
    for (const tuning of [1116, 1188, 1277, 1356]) {
      const n = tuning + spread;
      const line = new Float32Array(n);
      let idx = 0, store = 0;
      for (let i = 0; i < src.length; i++) {
        const y = line[idx];
        store = y * 0.6 + store * 0.4;
        line[idx] = src[i] * 0.02 + store * 0.62;
        idx = (idx + 1) % n;
        acc[i] += y;
      }
    }
    for (let i = 0; i < acc.length; i++) dst[i] = acc[i];
  }
  return out;
}

export function scoreShowcase({ total, events }) {
  const length = Math.ceil((total + 1.5) * RATE);
  const dry = new Bus(length);
  const send = new Bus(length);
  const noise = noiseSource(5);
  const put = (t, s, gain, pan = 0.5, wet = 0.15) => {
    dry.add(t, s, gain, pan);
    send.add(t, s, gain * wet, pan);
  };

  for (const e of events) {
    const x = e.x ?? 0.5;
    switch (e.type) {
      case "bounce": {
        const i = e.i ?? 0;
        put(e.t, rubberBounce(noise, 420 + (i % 5) * 45, e.level ?? 1), 0.55, 0.3 + (i % 5) * 0.1);
        break;
      }
      case "pop": {
        // Deterministic spread of pitch so a cascade sounds like many small objects, not a tune.
        const k = Math.round(e.t * 1000);
        put(e.t, pop(700 + ((k * 7919) % 500)), 0.3 * (e.level ?? 1), 0.2 + 0.6 * x, 0.1);
        break;
      }
      case "roll":
        dry.addMoving(e.t, roll(noise, e.dur ?? 0.75), 0.5, 0.05, 0.5);
        break;
      case "swell":
        put(e.t, whoosh(noise, 0.55, 250, 1600), 0.28, 0.5, 0.2);
        break;
      case "whoosh":
        put(e.t, e.down ? whoosh(noise, e.dur ?? 0.8, 2600, 300) : whoosh(noise, e.dur ?? 0.8, 400, 2400), 0.22, 0.5, 0.2);
        break;
      case "confetti":
        put(e.t, confetti(noise), 0.5 * (e.level ?? 1), 0.5, 0.25);
        break;
      case "flip":
        put(e.t, flip(noise), 0.45, 0.3 + (e.i ?? 0) * 0.15);
        break;
      case "slide":
        dry.addMoving(e.t, slide(noise, 0.55), 0.4, 0.9, 0.7);
        break;
      case "thud":
        put(e.t, thud(noise, e.level ?? 1), 0.6, 0.5);
        break;
      case "key":
        put(e.t, key(noise, e.n ?? 0), 0.22, 0.55 + (((e.n ?? 0) % 5) - 2) * 0.03, 0.05);
        break;
      case "mouse-down":
        put(e.t, mouse(noise, true), 0.5, 0.6, 0.05);
        break;
      case "mouse-up":
        put(e.t, mouse(noise, false), 0.5, 0.6, 0.05);
        break;
      case "ding":
        put(e.t, ding(), 0.16, 0.45, 0.3);
        break;
      case "tick":
        put(e.t, tick(noise, e.i ?? 0), 0.3, 0.35 + ((e.i ?? 0) % 7) * 0.05);
        break;
      case "rocket":
        dry.addMoving(e.t, rocket(noise), 0.55, 0.5, 0.6);
        send.add(e.t, rocket(noise), 0.08);
        break;
    }
  }

  const wet = room(send);
  const L = new Float32Array(length);
  const R = new Float32Array(length);
  const end = total * RATE;
  let rawPeak = 0;
  for (let i = 0; i < length; i++) {
    const fade = i > end - 0.5 * RATE ? Math.max(0, (end - i) / (0.5 * RATE)) : 1;
    L[i] = (dry.L[i] + wet.L[i]) * fade;
    R[i] = (dry.R[i] + wet.R[i]) * fade;
    rawPeak = Math.max(rawPeak, Math.abs(L[i]), Math.abs(R[i]));
  }
  compress(L, R, rawPeak * 0.22, 4);
  let peak = 0;
  for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  return wav(L, R, peak > 0 ? 0.89 / peak : 1);
}

/**
 * Look-ahead peak compressor. A few stacked transients (five balls landing at once, a card slam)
 * would otherwise set the normalisation and leave everything else too quiet. Gain reacts ~3 ms early
 * and recovers over ~80 ms, so short hits are tamed without pumping or crunch.
 */
function compress(L, R, threshold, ratio) {
  const n = L.length;
  const env = new Float32Array(n);
  const rel = Math.exp(-1 / (0.08 * RATE));
  const look = Math.exp(-1 / (0.003 * RATE));
  let e = 0;
  for (let i = 0; i < n; i++) {
    e = Math.max(Math.abs(L[i]), Math.abs(R[i]), e * rel);
    env[i] = e;
  }
  for (let i = n - 2; i >= 0; i--) env[i] = Math.max(env[i], env[i + 1] * look);
  for (let i = 0; i < n; i++) {
    const g = env[i] > threshold ? Math.pow(threshold / env[i], 1 - 1 / ratio) : 1;
    L[i] *= g;
    R[i] *= g;
  }
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
