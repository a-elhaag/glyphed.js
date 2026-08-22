// Synthesizes a soft ambient pad + per-letter "pencil tick" WAV, timed against
// the reel's own drawing timeline. No audio assets, no deps — just PCM math.
const SAMPLE_RATE = 44100;
const UNDERLINE_MS = 480;

function drawDurationMs(text, STAGGER_MS, STROKE_MS) {
  return text.replace(/\s+/g, "").length * STAGGER_MS + STROKE_MS;
}

/** Mirrors reel.html's playPhrase timing to find when each letter is drawn. */
export function buildTickTimeline({ phrases, STAGGER_MS, STROKE_MS, HOLD_MS, FADE_MS }) {
  const ticks = [];
  let t = 0;
  for (const { h1, proof } of phrases) {
    const h1Letters = h1.replace(/\s+/g, "").length;
    for (let i = 0; i < h1Letters; i++) ticks.push(t + i * STAGGER_MS);

    const h1Draw = drawDurationMs(h1, STAGGER_MS, STROKE_MS);
    const proofStart = t + h1Draw + UNDERLINE_MS;
    const proofLetters = proof.replace(/\s+/g, "").length;
    for (let i = 0; i < proofLetters; i++) ticks.push(proofStart + i * STAGGER_MS);

    const proofDraw = drawDurationMs(proof, STAGGER_MS, STROKE_MS);
    t = proofStart + proofDraw + HOLD_MS + FADE_MS;
  }
  return ticks;
}

function synthesize(durationMs, ticks) {
  const totalSamples = Math.ceil(SAMPLE_RATE * (durationMs / 1000 + 0.3));
  const buf = new Float64Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const tSec = i / SAMPLE_RATE;
    const pad = 0.022 * Math.sin(2 * Math.PI * 110 * tSec) + 0.014 * Math.sin(2 * Math.PI * 164.81 * tSec);
    const tremolo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.15 * tSec);
    buf[i] = pad * tremolo;
  }

  const tickLen = Math.floor(SAMPLE_RATE * 0.02);
  for (const tickMs of ticks) {
    const start = Math.floor(SAMPLE_RATE * (tickMs / 1000));
    for (let j = 0; j < tickLen; j++) {
      const idx = start + j;
      if (idx < 0 || idx >= totalSamples) continue;
      const decay = Math.exp(-j / (SAMPLE_RATE * 0.004));
      buf[idx] += (Math.random() * 2 - 1) * decay * 0.2;
    }
  }

  const int16 = new Int16Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    int16[i] = Math.round(Math.max(-1, Math.min(1, buf[i])) * 32767);
  }
  return int16;
}

function wavBuffer(int16) {
  const dataSize = int16.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32); // block align
  buf.writeUInt16LE(16, 34); // bits per sample
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  Buffer.from(int16.buffer).copy(buf, 44);
  return buf;
}

export function synthesizeReelAudio(config) {
  const ticks = buildTickTimeline(config);
  const samples = synthesize(config.totalMs, ticks);
  return wavBuffer(samples);
}
