import { describe, expect, it } from "vitest";
import { sanitize } from "./Rich";

describe("sanitize", () => {
  it("strips scripts, iframes, inline handlers and javascript: urls", () => {
    const out = sanitize('<p onclick="x()">a</p><script>alert(1)</script><iframe src="//e"></iframe><a href="javascript:bad()">l</a>');
    expect(out).not.toMatch(/script|iframe|onclick|javascript:/i);
    expect(out).toContain("<p");
  });
});
