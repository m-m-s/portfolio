export type Photo = {
  /** Until it's set, the photo shows as a gray box of the same shape. */
  src?: string;
  alt: string;
  /** Width over height. */
  ratio: number;
};

const SHAPES = {
  "3:2": 3 / 2,
  "2:3": 2 / 3,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "16:9": 16 / 9,
};
type Shape = keyof typeof SHAPES;

const row = (n: number, shapes: Shape[]): Photo[] =>
  shapes.map((shape, i) => ({
    alt: `[IMAGE: row ${n}, photo ${i + 1}]`,
    ratio: SHAPES[shape],
  }));

/** Placeholder rows, in order; swapping in the real photos changes only this list. */
export const photoRows: Photo[][] = [
  row(1, ["3:2", "2:3", "16:9", "3:4", "3:2", "4:3", "2:3"]),
  row(2, [
    "2:3",
    "3:2",
    "3:2",
    "16:9",
    "3:4",
    "4:3",
    "2:3",
    "3:2",
    "4:3",
    "3:4",
  ]),
  row(3, ["16:9", "3:4", "3:2", "2:3", "4:3"]),
  row(4, [
    "3:2",
    "4:3",
    "2:3",
    "3:2",
    "16:9",
    "3:4",
    "3:2",
    "2:3",
    "4:3",
    "16:9",
    "3:2",
    "2:3",
  ]),
];
