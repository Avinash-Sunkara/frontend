import { describe, expect, it } from "vitest";
import { learningActivityLevel } from "./Heatmap";

describe("learning activity heatmap intensity", () => {
  it("keeps empty and invalid counts neutral", () => {
    expect(learningActivityLevel(0)).toBe(0);
    expect(learningActivityLevel(-1)).toBe(0);
    expect(learningActivityLevel(Number.NaN)).toBe(0);
  });

  it("maps increasing daily counts to progressively stronger levels", () => {
    expect([1, 2, 4, 7].map(learningActivityLevel)).toEqual([1, 2, 3, 4]);
  });
});
