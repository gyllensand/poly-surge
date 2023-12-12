const COLORS = [
  "#dc202e",
  "#2d338b",
  "#76306b",
  "#ea8c2d",
  "#c06e86",
  "#0f9ebe",
  "#1c6ff1",
  "#eb3434",
  "#cb4e4d",
  "#ff48e6",
  "#bd22a8",
  "#249582",
];

export const DARK_COLORS = [...COLORS, "#ffffff", "#30f8a0", "#ffce00"];

export const LIGHT_COLORS = [...COLORS, "#000000"];

export const DARK_BG_COLORS = ["#000000", "#000000", "#111111", "#040b2d"];

export const LIGHT_BG_COLORS = ["#ffffff", "#fff6d1", "#fff6d1", "#dbd8d0"];

export enum Theme {
  Dark = "dark",
  Light = "light",
}

export enum Type {
  BackToBack = 0,
  Facing = 1,
  Winding = 2,
}

export enum ColorMode {
  Plain = 0,
  PlainDiff = 1,
  Separated = 2,
  Gradient = 3,
  EveryOther = 4,
}

export enum Direction {
  Left = "left",
  Right = "right",
}

export const SCALES = [
  {
    index: 0,
    bass: [0, 1, 2, 3],
    melody: [0, 1, 2, 3],
    sequence: [0, 6, 1, 2, 0, 6, 7, 2],
  },
  {
    index: 1,
    bass: [4, 5, 6, 7],
    melody: [4, 5, 6, 7],
    sequence: [0, 5, 1, 2, 0, 6, 1, 2],
  },
  {
    index: 2,
    bass: [8, 9, 10, 11],
    melody: [8, 9, 10, 11],
    sequence: [0, 6, 1, 3, 0, 6, 1, 2],
  },
  {
    index: 3,
    bass: [12, 13, 14, 15],
    melody: [12, 13, 14, 15],
    sequence: [0, 6, 1, 2, 0, 6, 2, 4],
  },
];