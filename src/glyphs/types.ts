export interface GlyphEntry {
  width: number;
  variantWidths?: number[];
  variants: string[];
}

export type GlyphDatabase = Record<string, GlyphEntry>;
