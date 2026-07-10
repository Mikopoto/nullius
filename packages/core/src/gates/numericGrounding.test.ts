import { describe, expect, it } from "vitest";
import { groundingReport, significantIntegers, significantNumbers } from "./numericGrounding.js";

describe("numeric grounding", () => {
  it("extracts significant decimal and percent values but skips integers", () => {
    expect(significantNumbers("500 samples, slope 2.03, error 1.2e-3, rate 95.4%, year 2024")).toEqual([
      "2.03",
      "1.2e-3",
      "95.4%"
    ]);
  });

  it("grounds rounded values and percentages without substring matching", () => {
    expect(groundingReport("# Results\nThe slope is 2.03.", ["slope,2.0347"]).ungroundedNumbers).toEqual([]);
    expect(groundingReport("# Results\nAccuracy reached 95.4%.", ["accuracy,0.954"]).ungroundedNumbers).toEqual([]);
    expect(groundingReport("# Results\nThe effect size was 0.87.", ["metric,value\nother,10.873"]).ungroundedNumbers).toEqual(["0.87"]);
  });

  it("checks Abstract, Results, and Discussion but ignores Methods", () => {
    const body = [
      "# Abstract",
      "Accuracy reached 99.1%.",
      "# Methods",
      "Alpha was 0.05.",
      "# Discussion",
      "The slope of 7.77 is striking."
    ].join("\n");
    const report = groundingReport(body, ["accuracy,0.5\nslope,2.0"]);
    expect(report.ungroundedNumbers).toContain("99.1%");
    expect(report.ungroundedNumbers).toContain("7.77");
    expect(report.ungroundedNumbers).not.toContain("0.05");
  });

  it("puts fabricated integers in a non-blocking bucket, ignores years, and skips exponent parts", () => {
    expect(significantIntegers("Collected in 2024 and revised in 1999. Values were 1e20 and 3.4e-12.")).toEqual([]);
    const report = groundingReport("# Results\nWe observed 4212 responders.", ["count,17"]);
    expect(report.ungroundedIntegers).toEqual(["4212"]);
  });
});

describe("round 6 gate hardening", () => {
  it("hard-blocks integer percentages as numbers, grounded via /100", () => {
    const body = "# Results\nAccuracy reached 95% on the held-out set.";
    const ungrounded = groundingReport(body, ["{}"]);
    expect(ungrounded.checkedNumbers).toContain("95%");
    expect(ungrounded.ungroundedNumbers).toContain("95%");
    const grounded = groundingReport(body, ['{"accuracy": 0.95}']);
    expect(grounded.ungroundedNumbers).toEqual([]);
  });

  it("grounds integers by value across formatting (thousands separators, trailing .0)", () => {
    const body = "# Results\nWe analyzed 4212 records.";
    expect(groundingReport(body, ["count,4212.0"]).ungroundedIntegers).toEqual([]);
    expect(groundingReport(body, ["total: 4,212 rows"]).ungroundedIntegers).toEqual([]);
    expect(groundingReport(body, ["count,999"]).ungroundedIntegers).toContain("4212");
  });

  it("full scope catches a fabricated decimal hidden in Methods", () => {
    const body = "# Methods\nWe set alpha to 0.0731 for no reason.\n# Results\nAll good.";
    expect(groundingReport(body, ["{}"]).ungroundedNumbers).toEqual([]);
    expect(groundingReport(body, ["{}"], { scope: "full" }).ungroundedNumbers).toContain("0.0731");
  });
});

