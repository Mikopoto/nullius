import type { Usage } from "./streamParser.js";

export interface ModelPricing {
  inputPricePerMillion?: number | undefined;
  outputPricePerMillion?: number | undefined;
}

export interface RunCostLedger {
  callCount: number;
  promptTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  totalCostUSD: number;
  hasUnpricedCalls: boolean;
}

export function costUSD(usage: Usage, model: ModelPricing | undefined): number | undefined {
  if (!model?.inputPricePerMillion || !model.outputPricePerMillion) return undefined;
  const promptTokens = usage.promptTokens ?? 0;
  const completionTokens = usage.completionTokens ?? 0;
  return (promptTokens * model.inputPricePerMillion + completionTokens * model.outputPricePerMillion) / 1_000_000;
}

export function emptyCostLedger(): RunCostLedger {
  return {
    callCount: 0,
    promptTokens: 0,
    completionTokens: 0,
    reasoningTokens: 0,
    totalCostUSD: 0,
    hasUnpricedCalls: false
  };
}

export function recordUsage(ledger: RunCostLedger, usage: Usage | undefined, cost: number | undefined): RunCostLedger {
  return {
    callCount: ledger.callCount + 1,
    promptTokens: ledger.promptTokens + (usage?.promptTokens ?? 0),
    completionTokens: ledger.completionTokens + (usage?.completionTokens ?? 0),
    reasoningTokens: ledger.reasoningTokens + (usage?.reasoningTokens ?? 0),
    totalCostUSD: ledger.totalCostUSD + (cost ?? 0),
    hasUnpricedCalls: ledger.hasUnpricedCalls || cost === undefined
  };
}

export function formattedCost(cost: number | undefined): string {
  if (cost === undefined) return "$—";
  return cost < 0.01 ? `$${cost.toFixed(4)}` : `$${cost.toFixed(2)}`;
}

