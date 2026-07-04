import { describe, expect, it } from "vitest";
import { complete, completeJSON } from "./aiProvider.js";

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

describe("AI provider transport facade", () => {
  it("builds OpenAI-compatible requests and parses content/null safely", async () => {
    let capturedBody: Record<string, unknown> | undefined;
    const fetchImpl = async (_url: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return jsonResponse({
        choices: [{ message: { content: null }, finish_reason: "stop" }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          completion_tokens_details: { reasoning_tokens: 3 }
        }
      });
    };

    const completion = await complete("system", "user", {
      kind: "openai",
      model: "gpt-4.1",
      apiKey: "test"
    }, { fetchImpl });

    expect(completion.text).toBe("");
    expect(completion.usage?.reasoningTokens).toBe(3);
    expect(capturedBody?.response_format).toEqual({ type: "json_object" });
    expect(capturedBody?.temperature).toBe(0.25);
  });

  it("omits temperature for reasoning-class models", async () => {
    let capturedBody: Record<string, unknown> | undefined;
    const fetchImpl = async (_url: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return jsonResponse({ choices: [{ message: { content: "{\"ok\":true}" }, finish_reason: "stop" }] });
    };
    await complete("system", "user", { kind: "openai", model: "gpt-5", apiKey: "test" }, { fetchImpl });
    expect(capturedBody).not.toHaveProperty("temperature");
  });

  it("parses JSON from fenced model responses", async () => {
    const fetchImpl = async () =>
      jsonResponse({
        choices: [{ message: { content: "```json\n{\"ok\":true}\n```" }, finish_reason: "stop" }]
      });
    const parsed = await completeJSON<{ ok: boolean }>("system", "user", { kind: "openrouter", model: "model", apiKey: "key" }, { fetchImpl });
    expect(parsed.ok).toBe(true);
  });

  it("builds Anthropic messages requests and maps usage", async () => {
    let capturedBody: Record<string, unknown> | undefined;
    const fetchImpl = async (_url: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return jsonResponse({
        content: [{ type: "text", text: "{\"ok\":true}" }],
        stop_reason: "end_turn",
        usage: { input_tokens: 42, output_tokens: 7 }
      });
    };
    const completion = await complete("system", "user", { kind: "anthropic", model: "claude-sonnet-4", apiKey: "key" }, { fetchImpl });
    expect(capturedBody?.system).toBe("system");
    expect(capturedBody?.max_tokens).toBe(32000);
    expect(completion.usage?.promptTokens).toBe(42);
    expect(completion.usage?.completionTokens).toBe(7);
  });
});

