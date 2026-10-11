import { describe, expect, it } from "vitest";
import { fmtDuration, fmtInr, initials, pct, timeAgo } from "./utils";

describe("utils", () => {
  it("pct handles zero totals and rounds", () => { expect(pct(1, 0)).toBe(0); expect(pct(1, 3)).toBe(33); expect(pct(5, 5)).toBe(100); });
  it("fmtInr formats or falls back", () => { expect(fmtInr(1499)).toBe("₹1,499"); expect(fmtInr(null)).toBe("₹XXX"); });
  it("fmtDuration", () => { expect(fmtDuration(45)).toBe("45m"); expect(fmtDuration(125)).toBe("2h 5m"); });
  it("initials", () => { expect(initials("Asha Rao Kumar")).toBe("AR"); expect(initials("")).toBe("U"); });
  it("timeAgo", () => { expect(timeAgo(new Date(Date.now() - 3 * 3600_000).toISOString())).toBe("3 hours ago"); expect(timeAgo()).toBe(""); });
});
