import { describe, expect, it } from "vitest";
import { parseProgramPrompt, toBody, writeProgramPrompt } from "./ResourceManager";

describe("ResourceManager payload helpers", () => {
  it("serializes arrays as repeated multipart fields alongside uploaded files", () => {
    const file = new File(["image"], "problem.png", { type: "image/png" });
    const body = toBody([
      { name: "tags", label: "Tags", type: "tags" },
      { name: "companyIds", label: "Companies", type: "multiselect" },
      { name: "images", label: "Images", type: "file", multiple: true },
    ], {
      tags: ["two-pointers", "array"],
      companyIds: ["company-1", "company-2"],
      images: [file],
    });

    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).getAll("tags")).toEqual(["two-pointers", "array"]);
    expect((body as FormData).getAll("companyIds")).toEqual(["company-1", "company-2"]);
    expect((body as FormData).has("tags[]")).toBe(false);
    expect((body as FormData).getAll("images")).toHaveLength(1);
  });

  it("preserves program code and its language in an editable prompt", () => {
    const prompt = writeProgramPrompt({
      statement: "<p>What does this program print?</p>",
      code: 'print("value < 3 & ready")\nprint("done")',
      language: "python",
    });

    expect(prompt).toContain("<pre data-program-code-block>");
    expect(parseProgramPrompt(prompt)).toEqual({
      statement: "<p>What does this program print?</p>",
      code: 'print("value < 3 & ready")\nprint("done")',
      language: "python",
    });
  });
});
