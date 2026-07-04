import { z } from "zod";

export type StreamDialect = "openAI" | "anthropic";

export class AITruncationError extends Error {
  readonly finishReason: string;

  constructor(finishReason: string) {
    super(`AI output was truncated: ${finishReason}`);
    this.name = "AITruncationError";
    this.finishReason = finishReason;
  }
}

export function assertNotTruncated(finishReason: string | undefined): void {
  if (finishReason === "length" || finishReason === "max_tokens") {
    throw new AITruncationError(finishReason);
  }
}

export type StreamDelta =
  | { type: "content"; text: string }
  | { type: "reasoning"; text: string }
  | { type: "usage"; usage: Usage }
  | { type: "done" };

export interface Usage {
  promptTokens?: number | undefined;
  completionTokens?: number | undefined;
  reasoningTokens?: number | undefined;
}

const OpenAIUsageSchema = z.object({
  prompt_tokens: z.number().optional(),
  completion_tokens: z.number().optional(),
  completion_tokens_details: z
    .object({
      reasoning_tokens: z.number().optional()
    })
    .optional()
});

export class StreamParser {
  readonly dialect: StreamDialect;
  text = "";
  reasoning = "";
  usage: Usage | undefined;
  finishReason: string | undefined;
  isDone = false;

  constructor(dialect: StreamDialect) {
    this.dialect = dialect;
  }

  consumeLine(line: string): StreamDelta[] {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith(":")) return [];
    if (!trimmed.startsWith("data:")) return [];

    const payload = trimmed.slice("data:".length).trim();
    if (payload === "[DONE]") {
      this.isDone = true;
      return [{ type: "done" }];
    }

    const parsed = safeJson(payload);
    if (!parsed) return [];

    return this.dialect === "openAI" ? this.consumeOpenAI(parsed) : this.consumeAnthropic(parsed);
  }

  private consumeOpenAI(value: unknown): StreamDelta[] {
    const deltas: StreamDelta[] = [];
    const root = value as Record<string, unknown>;
    const choices = Array.isArray(root.choices) ? root.choices : [];

    for (const choice of choices) {
      const choiceObject = choice as Record<string, unknown>;
      if (typeof choiceObject.finish_reason === "string") this.finishReason = choiceObject.finish_reason;
      const delta = (choiceObject.delta ?? {}) as Record<string, unknown>;
      if (typeof delta.reasoning === "string") {
        this.reasoning += delta.reasoning;
        deltas.push({ type: "reasoning", text: delta.reasoning });
      }
      if (typeof delta.content === "string") {
        this.text += delta.content;
        deltas.push({ type: "content", text: delta.content });
      }
    }

    const usage = OpenAIUsageSchema.safeParse(root.usage);
    if (usage.success) {
      this.usage = compactUsage({
        promptTokens: usage.data.prompt_tokens,
        completionTokens: usage.data.completion_tokens,
        reasoningTokens: usage.data.completion_tokens_details?.reasoning_tokens
      });
      deltas.push({ type: "usage", usage: this.usage });
    }

    return deltas;
  }

  private consumeAnthropic(value: unknown): StreamDelta[] {
    const deltas: StreamDelta[] = [];
    const root = value as Record<string, unknown>;

    if (root.type === "message_start") {
      const usage = ((root.message as Record<string, unknown> | undefined)?.usage ?? {}) as Record<string, unknown>;
      if (typeof usage.input_tokens === "number") {
        this.usage = { ...this.usage, promptTokens: usage.input_tokens };
        deltas.push({ type: "usage", usage: this.usage });
      }
    }

    if (root.type === "content_block_delta") {
      const delta = (root.delta ?? {}) as Record<string, unknown>;
      if (delta.type === "thinking_delta" && typeof delta.thinking === "string") {
        this.reasoning += delta.thinking;
        deltas.push({ type: "reasoning", text: delta.thinking });
      }
      if (delta.type === "text_delta" && typeof delta.text === "string") {
        this.text += delta.text;
        deltas.push({ type: "content", text: delta.text });
      }
    }

    if (root.type === "message_delta") {
      const delta = (root.delta ?? {}) as Record<string, unknown>;
      if (typeof delta.stop_reason === "string") this.finishReason = delta.stop_reason;
      const usage = (root.usage ?? {}) as Record<string, unknown>;
      if (typeof usage.output_tokens === "number") {
        this.usage = { ...this.usage, completionTokens: usage.output_tokens };
        deltas.push({ type: "usage", usage: this.usage });
      }
    }

    if (root.type === "message_stop") {
      this.isDone = true;
      deltas.push({ type: "done" });
    }

    return deltas;
  }
}

function compactUsage(usage: Usage): Usage {
  return Object.fromEntries(
    Object.entries(usage).filter(([, value]) => value !== undefined)
  ) as Usage;
}

function safeJson(payload: string): unknown | null {
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
