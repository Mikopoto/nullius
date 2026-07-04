import { describe, expect, it } from "vitest";
import { AITransportError, delayForAttempt, retryAfterSeconds, sendWithRetry } from "./transportPolicy.js";

describe("transport policy", () => {
  it("honors retry-after and retries rate limits", async () => {
    const calls: number[] = [];
    const sleeps: number[] = [];
    const responses = [
      new Response("slow", { status: 429, headers: { "Retry-After": "7" } }),
      new Response("ok", { status: 200 })
    ];
    const response = await sendWithRetry("https://example.invalid", {}, {
      fetchImpl: async () => {
        calls.push(1);
        return responses.shift() ?? new Response("missing", { status: 500 });
      },
      sleep: (seconds) => {
        sleeps.push(seconds);
      },
      jitter: () => 0
    });
    expect(await response.text()).toBe("ok");
    expect(calls.length).toBe(2);
    expect(sleeps[0]).toBeGreaterThanOrEqual(7);
  });

  it("does not retry auth or bad request errors", async () => {
    await expect(sendWithRetry("https://example.invalid", {}, { fetchImpl: async () => new Response("bad key", { status: 401 }) })).rejects.toMatchObject({
      kind: "authFailed"
    });
    await expect(sendWithRetry("https://example.invalid", {}, { fetchImpl: async () => new Response("bad", { status: 400 }) })).rejects.toMatchObject({
      kind: "badRequest"
    });
    await expect(sendWithRetry("https://example.invalid", {}, { fetchImpl: async () => new Response("schema bad", { status: 422 }) })).rejects.toMatchObject({
      kind: "badRequest"
    });
  });

  it("throws a typed rate limit error after exhausted retries", async () => {
    await expect(
      sendWithRetry("https://example.invalid", {}, {
        maxAttempts: 2,
        fetchImpl: async () => new Response("slow", { status: 429 }),
        sleep: () => undefined,
        jitter: () => 0
      })
    ).rejects.toBeInstanceOf(AITransportError);
  });

  it("parses and caps retry-after", () => {
    expect(retryAfterSeconds(new Headers({ "Retry-After": "not-a-number" }))).toBeUndefined();
    expect(retryAfterSeconds(new Headers({ "Retry-After": "-4" }))).toBeUndefined();
    const future = new Date(Date.now() + 60_000).toUTCString();
    expect(retryAfterSeconds(new Headers({ "Retry-After": future }))).toBeGreaterThan(0);
    expect(delayForAttempt(0, 100_000, () => 0)).toBeLessThanOrEqual(120);
    expect(delayForAttempt(0, undefined, () => 1)).toBeGreaterThanOrEqual(1.5);
  });
});

