import type { GlyphDatabase } from "./types.js";
export type { GlyphEntry, GlyphDatabase } from "./types.js";

import { letterA } from "./letters/letter-a.js";
import { letterAUpper } from "./letters/letter-a-upper.js";
import { letterB } from "./letters/letter-b.js";
import { letterBUpper } from "./letters/letter-b-upper.js";
import { letterC } from "./letters/letter-c.js";
import { letterCUpper } from "./letters/letter-c-upper.js";
import { letterD } from "./letters/letter-d.js";
import { letterDUpper } from "./letters/letter-d-upper.js";
import { letterE } from "./letters/letter-e.js";
import { letterEUpper } from "./letters/letter-e-upper.js";
import { letterF } from "./letters/letter-f.js";
import { letterFUpper } from "./letters/letter-f-upper.js";
import { letterG } from "./letters/letter-g.js";
import { letterGUpper } from "./letters/letter-g-upper.js";
import { letterH } from "./letters/letter-h.js";
import { letterHUpper } from "./letters/letter-h-upper.js";
import { letterI } from "./letters/letter-i.js";
import { letterIUpper } from "./letters/letter-i-upper.js";
import { letterJ } from "./letters/letter-j.js";
import { letterJUpper } from "./letters/letter-j-upper.js";
import { letterK } from "./letters/letter-k.js";
import { letterKUpper } from "./letters/letter-k-upper.js";
import { letterL } from "./letters/letter-l.js";
import { letterLUpper } from "./letters/letter-l-upper.js";
import { letterM } from "./letters/letter-m.js";
import { letterMUpper } from "./letters/letter-m-upper.js";
import { letterN } from "./letters/letter-n.js";
import { letterNUpper } from "./letters/letter-n-upper.js";
import { letterO } from "./letters/letter-o.js";
import { letterOUpper } from "./letters/letter-o-upper.js";
import { letterP } from "./letters/letter-p.js";
import { letterPUpper } from "./letters/letter-p-upper.js";
import { letterQ } from "./letters/letter-q.js";
import { letterQUpper } from "./letters/letter-q-upper.js";
import { letterR } from "./letters/letter-r.js";
import { letterRUpper } from "./letters/letter-r-upper.js";
import { letterS } from "./letters/letter-s.js";
import { letterSUpper } from "./letters/letter-s-upper.js";
import { letterT } from "./letters/letter-t.js";
import { letterTUpper } from "./letters/letter-t-upper.js";
import { letterU } from "./letters/letter-u.js";
import { letterUUpper } from "./letters/letter-u-upper.js";
import { letterV } from "./letters/letter-v.js";
import { letterVUpper } from "./letters/letter-v-upper.js";
import { letterW } from "./letters/letter-w.js";
import { letterWUpper } from "./letters/letter-w-upper.js";
import { letterX } from "./letters/letter-x.js";
import { letterXUpper } from "./letters/letter-x-upper.js";
import { letterY } from "./letters/letter-y.js";
import { letterYUpper } from "./letters/letter-y-upper.js";
import { letterZ } from "./letters/letter-z.js";
import { letterZUpper } from "./letters/letter-z-upper.js";
import { digit0 } from "./digits/digit-0.js";
import { digit1 } from "./digits/digit-1.js";
import { digit2 } from "./digits/digit-2.js";
import { digit3 } from "./digits/digit-3.js";
import { digit4 } from "./digits/digit-4.js";
import { digit5 } from "./digits/digit-5.js";
import { digit6 } from "./digits/digit-6.js";
import { digit7 } from "./digits/digit-7.js";
import { digit8 } from "./digits/digit-8.js";
import { digit9 } from "./digits/digit-9.js";
import { punctPeriod } from "./punctuation/punct-period.js";
import { punctComma } from "./punctuation/punct-comma.js";
import { punctExclamation } from "./punctuation/punct-exclamation.js";
import { punctQuestion } from "./punctuation/punct-question.js";
import { punctApostrophe } from "./punctuation/punct-apostrophe.js";
import { punctHyphen } from "./punctuation/punct-hyphen.js";
import { space } from "./space.js";

export const glyphs: GlyphDatabase = {
  " ": space,
  A: letterAUpper,
  a: letterA,
  B: letterBUpper,
  b: letterB,
  C: letterCUpper,
  c: letterC,
  D: letterDUpper,
  d: letterD,
  E: letterEUpper,
  e: letterE,
  F: letterFUpper,
  f: letterF,
  G: letterGUpper,
  g: letterG,
  H: letterHUpper,
  h: letterH,
  I: letterIUpper,
  i: letterI,
  J: letterJUpper,
  j: letterJ,
  K: letterKUpper,
  k: letterK,
  L: letterLUpper,
  l: letterL,
  M: letterMUpper,
  m: letterM,
  N: letterNUpper,
  n: letterN,
  O: letterOUpper,
  o: letterO,
  P: letterPUpper,
  p: letterP,
  Q: letterQUpper,
  q: letterQ,
  R: letterRUpper,
  r: letterR,
  S: letterSUpper,
  s: letterS,
  T: letterTUpper,
  t: letterT,
  U: letterUUpper,
  u: letterU,
  V: letterVUpper,
  v: letterV,
  W: letterWUpper,
  w: letterW,
  X: letterXUpper,
  x: letterX,
  Y: letterYUpper,
  y: letterY,
  Z: letterZUpper,
  z: letterZ,
  "0": digit0,
  "1": digit1,
  "2": digit2,
  "3": digit3,
  "4": digit4,
  "5": digit5,
  "6": digit6,
  "7": digit7,
  "8": digit8,
  "9": digit9,
  ".": punctPeriod,
  ",": punctComma,
  "!": punctExclamation,
  "?": punctQuestion,
  "'": punctApostrophe,
  "-": punctHyphen,
};
