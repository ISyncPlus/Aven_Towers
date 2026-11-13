export type V3 = [number, number, number];
export type Part = { p: V3; s: V3; r?: V3 };
export type Parts = Record<string, Part[]>;
