import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  authorFamilyNamesOverlap,
  canonicallyEqualText,
  citationKeys,
  groundingReport,
  significantIntegers,
  significantNumbers,
  StreamParser,
  titlesMatch,
  claimCanEnterManuscript,
  readinessReport,
  stageManuscriptPatch,
  retryAfterSeconds,
  delayForAttempt
} from "@nullius/core";
import type { ConformanceSuite } from "./index.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const vectorsDir = join(root, "vectors");

function loadSuite<TInput, TExpect>(name: string): ConformanceSuite<TInput, TExpect> {
  return JSON.parse(readFileSync(join(vectorsDir, name), "utf8")) as ConformanceSuite<TInput, TExpect>;
}

describe("conformance vectors", () => {
  const numeric = loadSuite<
    { body?: string; artifactTexts?: string[]; text?: string; operation: string },
    Record<string, unknown>
  >("numeric-grounding.json");

  for (const testCase of numeric.cases) {
    it(`${numeric.suite}: ${testCase.name}`, () => {
      if (testCase.input.operation === "groundingReport") {
        const report = groundingReport(testCase.input.body ?? "", testCase.input.artifactTexts ?? []);
        expect(report).toMatchObject(testCase.expect);
      } else if (testCase.input.operation === "significantNumbers") {
        expect(significantNumbers(testCase.input.text ?? "")).toEqual(testCase.expect.values);
      } else if (testCase.input.operation === "significantIntegers") {
        expect(significantIntegers(testCase.input.text ?? "")).toEqual(testCase.expect.values);
      }
    });
  }

  const citations = loadSuite<
    { operation: string; left?: string; right?: string; body?: string },
    Record<string, unknown>
  >("citation-and-repro.json");

  for (const testCase of citations.cases) {
    it(`${citations.suite}: ${testCase.name}`, () => {
      switch (testCase.input.operation) {
        case "titlesMatch":
          expect(titlesMatch(testCase.input.left ?? "", testCase.input.right ?? "")).toBe(testCase.expect.value);
          break;
        case "authorFamilyNamesOverlap":
          expect(authorFamilyNamesOverlap(testCase.input.left ?? "", testCase.input.right ?? "")).toBe(testCase.expect.value);
          break;
        case "citationKeys":
          expect(new Set(citationKeys(testCase.input.body ?? ""))).toEqual(new Set(testCase.expect.values as string[]));
          break;
        case "canonicallyEqualText":
          expect(canonicallyEqualText(testCase.input.left ?? "", testCase.input.right ?? "")).toBe(testCase.expect.value);
          break;
      }
    });
  }

  const streams = loadSuite<
    { dialect: "openAI" | "anthropic"; lines: string[] },
    { text: string; reasoning: string; finishReason?: string; promptTokens?: number; completionTokens?: number; reasoningTokens?: number; isDone: boolean }
  >("streaming.json");

  for (const testCase of streams.cases) {
    it(`${streams.suite}: ${testCase.name}`, () => {
      const parser = new StreamParser(testCase.input.dialect);
      for (const line of testCase.input.lines) parser.consumeLine(line);
      expect(parser.text).toBe(testCase.expect.text);
      expect(parser.reasoning).toBe(testCase.expect.reasoning);
      expect(parser.finishReason).toBe(testCase.expect.finishReason);
      expect(parser.usage?.promptTokens).toBe(testCase.expect.promptTokens);
      expect(parser.usage?.completionTokens).toBe(testCase.expect.completionTokens);
      expect(parser.usage?.reasoningTokens).toBe(testCase.expect.reasoningTokens);
      expect(parser.isDone).toBe(testCase.expect.isDone);
    });
  }


  const transport = loadSuite<
    { operation: "retryAfterSeconds" | "delayForAttempt"; headers?: Record<string, string>; attempt?: number; retryAfter?: number; jitter?: number },
    { value: number | null }
  >("transport-policy.json");

  for (const testCase of transport.cases) {
    it(`${transport.suite}: ${testCase.name}`, () => {
      if (testCase.input.operation === "retryAfterSeconds") {
        expect(retryAfterSeconds(new Headers(testCase.input.headers ?? {})) ?? null).toBe(testCase.expect.value);
      } else {
        expect(delayForAttempt(testCase.input.attempt ?? 0, testCase.input.retryAfter, () => testCase.input.jitter ?? 0)).toBe(testCase.expect.value);
      }
    });
  }

  const gateSuite = loadSuite<
    {
      operation: "claimCanEnterManuscript" | "readinessReport" | "stageManuscriptPatch";
      project: Parameters<typeof readinessReport>[0];
      claimId?: string;
      body?: string;
      artifactTexts?: string[];
    },
    Record<string, unknown>
  >("evidence-gates.json");

  for (const testCase of gateSuite.cases) {
    it(`${gateSuite.suite}: ${testCase.name}`, () => {
      switch (testCase.input.operation) {
        case "claimCanEnterManuscript": {
          const claim = testCase.input.project.claims.find((item) => item.id === testCase.input.claimId);
          expect(claim).toBeDefined();
          expect(claimCanEnterManuscript(claim!, testCase.input.project)).toBe(testCase.expect.value);
          break;
        }
        case "readinessReport": {
          const report = readinessReport(testCase.input.project, "standard", {
            artifactExists: () => true,
            artifactText: (evidence) => evidence.summary
          });
          expect(report).toMatchObject(testCase.expect);
          break;
        }
        case "stageManuscriptPatch": {
          const patch = stageManuscriptPatch(testCase.input.project, testCase.input.body ?? "", {
            autoApprove: true,
            artifactTexts: testCase.input.artifactTexts ?? []
          });
          expect(patch).toMatchObject(testCase.expect);
          break;
        }
      }
    });
  }
});
