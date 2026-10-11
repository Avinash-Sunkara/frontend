import { describe, expect, it } from "vitest";
import { normalizeApiUrl } from "./api";

describe("normalizeApiUrl", () => {
  it("adds the API version path when configured with only the backend origin", () => {
    expect(normalizeApiUrl("https://backend.example.com")).toBe("https://backend.example.com/api/v1");
  });

  it("preserves an explicit API version path", () => {
    expect(normalizeApiUrl("https://backend.example.com/api/v1/")).toBe("https://backend.example.com/api/v1");
  });

  it("preserves a relative same-origin API path", () => {
    expect(normalizeApiUrl("/api/v1")).toBe("/api/v1");
  });

  it("leaves an empty configuration empty", () => {
    expect(normalizeApiUrl(undefined)).toBe("");
  });
});
