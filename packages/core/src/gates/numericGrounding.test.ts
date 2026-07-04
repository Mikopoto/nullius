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

