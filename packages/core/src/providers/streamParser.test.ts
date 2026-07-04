import { describe, expect, it } from "vitest";
import { AITruncationError, assertNotTruncated, StreamParser } from "./streamParser.js";

describe("stream parser", () => {
  it("assembles OpenAI content, reasoning, finish reason, and usage", () => {
    const parser = new StreamParser("openAI");
    const lines = [
      String.raw`data: {"choices":[{"delta":{"reasoning":"thinking about "}}]}`,
      String.raw`data: {"choices":[{"delta":{"reasoning":"slopes"}}]}`,
      String.raw`data: {"choices":[{"delta":{"content":"{\"a\":"}}]}`,
      ": keep-alive comment",
      "",
      String.raw`data: {"choices":[{"delta":{"content":"1}"},"finish_reason":"stop"}]}`,
      String.raw`data: {"choices":[],"usage":{"prompt_tokens":10,"completion_tokens":5,"completion_tokens_details":{"reasoning_tokens":3}}}`,
      "data: [DONE]"
    ];
    const deltas = lines.flatMap((line) => parser.consumeLine(line));
    expect(parser.text).toBe(String.raw`{"a":1}`);
    expect(parser.reasoning).toBe("thinking about slopes");
    expect(parser.finishReason).toBe("stop");
    expect(parser.usage?.promptTokens).toBe(10);
    expect(parser.usage?.reasoningTokens).toBe(3);
    expect(parser.isDone).toBe(true);
    expect(deltas.length).toBe(6);
  });

  it("assembles Anthropic text, thinking, and usage", () => {
    const parser = new StreamParser("anthropic");
    const lines = [
      "event: message_start",
      String.raw`data: {"type":"message_start","message":{"usage":{"input_tokens":42}}}`,
      "event: content_block_delta",
      String.raw`data: {"type":"content_block_delta","delta":{"type":"thinking_delta","thinking":"let me check"}}`,
      String.raw`data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"{\"ok\":true}"}}`,
      String.raw`data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":7}}`,
      String.raw`data: {"type":"message_stop"}`
    ];
    for (const line of lines) parser.consumeLine(line);
    expect(parser.text).toBe(String.raw`{"ok":true}`);
    expect(parser.reasoning).toBe("let me check");
    expect(parser.finishReason).toBe("end_turn");
    expect(parser.usage?.promptTokens).toBe(42);
    expect(parser.usage?.completionTokens).toBe(7);
    expect(parser.isDone).toBe(true);
  });
});


describe("stream truncation", () => {
  it("throws typed truncation errors for provider length stops", () => {
    expect(() => assertNotTruncated("length")).toThrow(AITruncationError);
    expect(() => assertNotTruncated("max_tokens")).toThrow(AITruncationError);
    expect(() => assertNotTruncated("stop")).not.toThrow();
  });
});
