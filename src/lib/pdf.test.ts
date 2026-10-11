import { describe, expect, it } from "vitest";
import { searchPdf } from "./pdf";

const fake = (pages: string[]) => ({ numPages: pages.length, getPage: async (n: number) => ({ getTextContent: async () => ({ items: pages[n - 1].split(" ").map((str) => ({ str })) }) }) }) as any;
describe("searchPdf", () => {
  it("finds pages case-insensitively and caches text", async () => {
    const doc = fake(["Intro to arrays", "Binary Search on answers", "Sliding window"]); const cache = new Map<number, string>();
    expect(await searchPdf(doc, "binary", cache)).toEqual([2]); expect(cache.size).toBe(3);
    expect(await searchPdf(doc, "WINDOW", cache)).toEqual([3]);
  });
  it("returns nothing for empty or missing queries", async () => { const doc = fake(["a b"]); expect(await searchPdf(doc, "  ")).toEqual([]); expect(await searchPdf(doc, "zzz")).toEqual([]); });
});
