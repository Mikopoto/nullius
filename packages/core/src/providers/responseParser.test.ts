import { describe, expect, it } from "vitest";
import { extractJSONObject, parseJSONFromResponse } from "./responseParser.js";

describe("AI response parser", () => {
  it("strips only wrapping markdown fences", () => {
    const text = [
      "```json",
      "{",
      "  \"generatedCode\": \"```python\\nprint(1)\\n```\",",
      "  \"ok\": true",
      "}",
      "```"
    ].join("\n");
    const parsed = parseJSONFromResponse<{ generatedCode: string; ok: boolean }>(text);
    expect(parsed.ok).toBe(true);
    expect(parsed.generatedCode).toContain("```python");
  });

  it("extracts the first balanced object from prose", () => {
    expect(extractJSONObject("Here is the result: {\"a\":{\"b\":1}} trailing")).toBe("{\"a\":{\"b\":1}}");
  });
});

