import { describe, expect, it } from "vitest";
import {
  createAlgorithmSteps,
  parseArrayInput,
  PATTERN_DEFAULTS,
  type PatternName,
} from "./patternAlgorithms";

describe("interactive algorithm traces", () => {
  it("builds an executable trace and final result for every landing-page pattern", () => {
    for (const [name, defaults] of Object.entries(PATTERN_DEFAULTS) as [PatternName, (typeof PATTERN_DEFAULTS)[PatternName]][]) {
      const steps = createAlgorithmSteps(name, defaults.array, { first: defaults.first, second: defaults.second });
      expect(steps.length, name).toBeGreaterThan(1);
      expect(steps.at(-1)?.result, name).toBeDefined();
    }
  });

  it("finds the maximum fixed-size window sum", () => {
    const steps = createAlgorithmSteps("Sliding Window", [1, 2, 3, 4], { first: 2, second: 0 });
    expect(steps.at(-1)?.result).toMatchObject({ title: "Maximum sum: 7" });
    expect(steps.at(-1)?.window).toEqual([2, 3]);
  });

  it("resolves next-greater values while showing stack pushes and pops", () => {
    const steps = createAlgorithmSteps("Monotonic Stack", [2, 1, 3], { first: 0, second: 0 });
    expect(steps.some((step) => step.explanation.includes("Pop index"))).toBe(true);
    expect(steps.at(-1)?.result?.detail).toContain("[3, 3, none]");
  });

  it("narrows the answer space to the minimum feasible speed", () => {
    const steps = createAlgorithmSteps("Binary Search on Answers", [3, 6, 7, 11], { first: 8, second: 0 });
    expect(steps.at(-1)?.result?.title).toBe("Minimum speed: 4");
    expect(steps.some((step) => step.search?.feasible === false)).toBe(true);
    expect(steps.some((step) => step.search?.feasible === true)).toBe(true);
  });

  it("tracks and returns Kadane's maximum subarray", () => {
    const steps = createAlgorithmSteps("Kadane's Algorithm", [-2, 1, -3, 4, -1, 2, 1, -5, 4], { first: 0, second: 0 });
    expect(steps.at(-1)?.result).toMatchObject({ title: "Maximum sum: 6", detail: expect.stringContaining("[4, -1, 2, 1]") });
  });

  it("builds prefix sums and answers inclusive range queries", () => {
    const steps = createAlgorithmSteps("Prefix Sum", [3, 1, 4, 2], { first: 1, second: 2 });
    expect(steps.at(-1)?.result).toMatchObject({ title: "Range sum: 5" });
    expect(steps.at(-1)?.prefix).toEqual([0, 3, 4, 8, 10]);
  });

  it("finds a target pair with two pointers", () => {
    const steps = createAlgorithmSteps("Two-Pointer", [1, 2, 4, 6, 8], { first: 10, second: 0 });
    expect(steps.at(-1)?.result?.title).toBe("Pair found: 2 + 8 = 10");
    expect(steps.some((step) => step.explanation.includes("Move left right"))).toBe(true);
  });
});

describe("custom visualization input", () => {
  it("parses bounded, comma-separated integer arrays", () => {
    expect(parseArrayInput(" 1, 2, -3 ")).toEqual([1, 2, -3]);
    expect(() => parseArrayInput("1")).toThrow("between 2 and 12");
    expect(() => parseArrayInput("1, 2.5")).toThrow("whole number");
    expect(() => parseArrayInput("1,,2")).toThrow("between 2 and 12");
  });

  it("rejects invalid inputs specific to each algorithm", () => {
    expect(() => createAlgorithmSteps("Sliding Window", [1, 2], { first: 3, second: 0 })).toThrow("Window size");
    expect(() => createAlgorithmSteps("Binary Search on Answers", [0, 2], { first: 3, second: 0 })).toThrow("positive pile sizes");
    expect(() => createAlgorithmSteps("Prefix Sum", [1, 2], { first: 1, second: 0 })).toThrow("inclusive range");
    expect(() => createAlgorithmSteps("Two-Pointer", [2, 1], { first: 3, second: 0 })).toThrow("sorted in ascending order");
  });
});
