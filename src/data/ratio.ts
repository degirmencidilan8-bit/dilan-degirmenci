import type { Ratio } from "./types";

/** Width over height for every ratio the data uses. */
export const RATIO_VALUE: Record<Ratio, number> = {
  "16:9": 16 / 9,
  "21:9": 21 / 9,
  "4:5": 4 / 5,
  "3:4": 3 / 4,
  "4:3": 4 / 3,
  "5:8": 5 / 8,
  "1:1": 1,
  "3:2": 3 / 2,
  "2:3": 2 / 3,
  "9:16": 9 / 16,
};
