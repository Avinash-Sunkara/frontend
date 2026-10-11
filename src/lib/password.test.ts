import { describe, expect, it } from "vitest";
import { passwordProblem } from "./password";

describe("passwordProblem", () => {
  it("accepts a password the backend accepts", () => expect(passwordProblem("Passw0rdOK")).toBeNull());
  it("rejects short, missing-case and missing-digit passwords", () => {
    expect(passwordProblem("Ab1")).toMatch(/8 characters/);
    expect(passwordProblem("password1")).toMatch(/uppercase/);
    expect(passwordProblem("PASSWORD1")).toMatch(/lowercase/);
    expect(passwordProblem("Passwordd")).toMatch(/number/);
  });
});
