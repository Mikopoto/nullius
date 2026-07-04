import { describe, expect, it } from "vitest";
import { costUSD, emptyCostLedger, formattedCost, recordUsage } from "./tokenCost.js";

describe("token cost accounting", () => {
  it("computes OpenRouter-style per-million pricing and accumulates ledger totals", () => {
    const usage = { promptTokens: 1_000_000, completionTokens: 500_000, reasoningTokens: 10 };
    const cost = costUSD(usage, { inputPricePerMillion: 3, outputPricePerMillion: 15 });
    expect(cost).toBe(10.5);
    const ledger = recordUsage(emptyCostLedger(), usage, cost);
    expect(ledger.callCount).toBe(1);
    expect(ledger.promptTokens).toBe(1_000_000);
    expect(ledger.reasoningTokens).toBe(10);
    expect(ledger.totalCostUSD).toBe(10.5);
    expect(formattedCost(0.0034)).toBe("$0.0034");
  });

  it("treats unknown pricing as unknown rather than free", () => {
    expect(costUSD({ promptTokens: 100, completionTokens: 100 }, { inputPricePerMillion: undefined, outputPricePerMillion: 5 })).toBeUndefined();
    expect(recordUsage(emptyCostLedger(), { promptTokens: 100 }, undefined).hasUnpricedCalls).toBe(true);
  });
});

