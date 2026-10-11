import { z } from "zod";

/** Mirrors the backend rule (validators/auth.ts): 8-128 characters with a lowercase letter, an uppercase letter and a number. */
export const PASSWORD_HINT = "At least 8 characters with an uppercase letter, a lowercase letter and a number.";
export const passwordRule = z.string().min(8, "At least 8 characters").max(128, "At most 128 characters")
  .regex(/[a-z]/, "Include a lowercase letter").regex(/[A-Z]/, "Include an uppercase letter").regex(/\d/, "Include a number");
/** First problem with a candidate password, or null when it is acceptable. */
export const passwordProblem = (pw: string) => { const r = passwordRule.safeParse(pw); return r.success ? null : r.error.issues[0].message; };
