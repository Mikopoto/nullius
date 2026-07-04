import { parseJSONFromResponse } from "./responseParser.js";
import { assertNotTruncated, StreamParser, type StreamDelta, type Usage } from "./streamParser.js";
import { sendWithRetry } from "./transportPolicy.js";

export type ProviderKind = "openrouter" | "openai" | "anthropic" | "customOpenAICompatible";

export interface AIProviderConfig {
  kind: ProviderKind;
  model: string;
  apiKey: string;
  baseURL?: string;
  reasoningEffort?: "none" | "low" | "medium" | "high";
  supportsJSONResponseFormat?: boolean;
}

export interface AICompletion {
  text: string;
  reasoning: string;
  usage?: Usage | undefined;
  finishReason?: string | undefined;
}

export type StreamSink = (delta: StreamDelta) => void;

export async function complete(
  systemPrompt: string,
  userPrompt: string,
  config: AIProviderConfig,
  options: { stream?: StreamSink; fetchImpl?: typeof fetch } = {}
): Promise<AICompletion> {
  if (config.kind === "anthropic") {
    return completeAnthropic(systemPrompt, userPrompt, config, options);
  }
  return completeOpenAICompatible(systemPrompt, userPrompt, config, options);
}

export async function completeJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  config: AIProviderConfig,
  options: { fetchImpl?: typeof fetch } = {}
): Promise<T> {
  const completion = await complete(systemPrompt, userPrompt, config, options);
  return parseJSONFromResponse<T>(completion.text);
}

function endpoint(config: AIProviderConfig): string {
  switch (config.kind) {
    case "openai":
      return "https://api.openai.com/v1/chat/completions";
    case "openrouter":
      return "https://openrouter.ai/api/v1/chat/completions";
    case "customOpenAICompatible":
      if (!config.baseURL) throw new Error("customOpenAICompatible requires baseURL");
      return config.baseURL;
    case "anthropic":
      return "https://api.anthropic.com/v1/messages";
  }
}

function shouldOmitTemperature(model: string): boolean {
  const normalized = model.toLowerCase();
  return ["o1", "o3", "o4", "gpt-5", "gpt5", "reasoner", "reasoning", "qwq", "deepseek-r"].some((marker) => normalized.includes(marker));
}

function maxOutputTokensFor(model: string): number {
  const normalized = model.toLowerCase();
  if (!normalized.includes("claude")) return 8192;
  if (["claude-3-5", "claude-3.5", "claude-3-haiku", "claude-3-opus", "claude-3-sonnet", "claude-2", "claude-instant"].some((marker) => normalized.includes(marker))) {
    return 8192;
  }
  return 32000;
}

async function completeOpenAICompatible(
  systemPrompt: string,
  userPrompt: string,
  config: AIProviderConfig,
  options: { stream?: StreamSink; fetchImpl?: typeof fetch }
): Promise<AICompletion> {
  const stream = Boolean(options.stream);
  const body: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    stream
  };
  if (!shouldOmitTemperature(config.model)) body.temperature = 0.25;
  if (config.supportsJSONResponseFormat !== false) body.response_format = { type: "json_object" };
  if (stream) body.stream_options = { include_usage: true };
  if (config.kind === "openrouter" && config.reasoningEffort && config.reasoningEffort !== "none") {
    body.reasoning = { effort: config.reasoningEffort, exclude: false };
  }

  const response = await sendWithRetry(
    endpoint(config),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        ...(config.kind === "openrouter" ? { "HTTP-Referer": "https://localhost/nullius", "X-Title": "Nullius" } : {})
      },
      body: JSON.stringify(body)
    },
    retryOptions(options.fetchImpl)
  );

  if (stream) return readSSE(response, "openAI", options.stream);

  const payload = (await response.json()) as OpenAIChatResponse;
  const choice = payload.choices?.[0];
  assertNotTruncated(choice?.finish_reason);
  return {
    text: choice?.message?.content ?? "",
    reasoning: choice?.message?.reasoning ?? "",
    finishReason: choice?.finish_reason,
    usage: openAIUsage(payload.usage)
  };
}

async function completeAnthropic(
  systemPrompt: string,
  userPrompt: string,
  config: AIProviderConfig,
  options: { stream?: StreamSink; fetchImpl?: typeof fetch }
): Promise<AICompletion> {
  const stream = Boolean(options.stream);
  const response = await sendWithRetry(
    endpoint(config),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: config.model,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: maxOutputTokensFor(config.model),
        stream
      })
    },
    retryOptions(options.fetchImpl)
  );

  if (stream) return readSSE(response, "anthropic", options.stream);

  const payload = (await response.json()) as AnthropicResponse;
  assertNotTruncated(payload.stop_reason);
  return {
    text: payload.content?.map((part) => (part.type === "text" ? part.text : "")).join("") ?? "",
    reasoning: payload.content?.map((part) => (part.type === "thinking" ? part.thinking : "")).join("") ?? "",
    finishReason: payload.stop_reason,
    usage: {
      promptTokens: payload.usage?.input_tokens,
      completionTokens: payload.usage?.output_tokens
    }
  };
}

async function readSSE(response: Response, dialect: "openAI" | "anthropic", stream: StreamSink | undefined): Promise<AICompletion> {
  const parser = new StreamParser(dialect);
  const reader = response.body?.getReader();
  if (!reader) return { text: "", reasoning: "" };
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      for (const delta of parser.consumeLine(line)) stream?.(delta);
    }
  }
  if (buffer.length > 0) {
    for (const delta of parser.consumeLine(buffer)) stream?.(delta);
  }
  assertNotTruncated(parser.finishReason);
  return {
    text: parser.text,
    reasoning: parser.reasoning,
    usage: parser.usage,
    finishReason: parser.finishReason
  };
}

function openAIUsage(usage: OpenAIUsage | undefined): Usage | undefined {
  if (!usage) return undefined;
  return {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    reasoningTokens: usage.completion_tokens_details?.reasoning_tokens
  };
}

function retryOptions(fetchImpl: typeof fetch | undefined) {
  return fetchImpl ? { fetchImpl } : {};
}

interface OpenAIChatResponse {
  choices?: Array<{
    finish_reason?: string;
    message?: {
      content?: string | null;
      reasoning?: string;
    };
  }>;
  usage?: OpenAIUsage;
}

interface OpenAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  completion_tokens_details?: {
    reasoning_tokens?: number;
  };
}

interface AnthropicResponse {
  content?: Array<{ type: "text"; text: string } | { type: "thinking"; thinking: string }>;
  stop_reason?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}
