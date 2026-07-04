export type SleepFn = (seconds: number) => Promise<void> | void;

export interface SendWithRetryOptions {
  maxAttempts?: number;
  sleep?: SleepFn;
  fetchImpl?: typeof fetch;
  jitter?: () => number;
}

export class AITransportError extends Error {
  readonly kind: "authFailed" | "badRequest" | "rateLimited" | "serverError" | "network";
  readonly statusCode: number | undefined;

  constructor(kind: AITransportError["kind"], message: string, statusCode?: number) {
    super(message);
    this.name = "AITransportError";
    this.kind = kind;
    this.statusCode = statusCode;
  }
}

export const retryAfterCapSeconds = 120;

export function retryAfterSeconds(headers: Headers): number | undefined {
  const value = headers.get("retry-after");
  if (!value) return undefined;
  const trimmed = value.trim();
  const seconds = Number(trimmed);
  if (/^[+-]?\d+(?:\.\d+)?$/.test(trimmed)) return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
  const date = Date.parse(value);
  if (Number.isFinite(date)) return Math.max(0, (date - Date.now()) / 1000);
  return undefined;
}

export function delayForAttempt(attempt: number, retryAfter?: number, jitter = Math.random): number {
  const backoff = Math.min(30, Math.pow(2, attempt));
  const honored = Math.max(backoff, retryAfter ?? 0);
  const jitterSeconds = Math.max(0, Math.min(0.5, jitter() * 0.5));
  return Math.min(retryAfterCapSeconds, honored + jitterSeconds);
}

export async function sendWithRetry(request: RequestInfo | URL, init: RequestInit = {}, options: SendWithRetryOptions = {}): Promise<Response> {
  const maxAttempts = options.maxAttempts ?? 4;
  const sleep = options.sleep ?? defaultSleep;
  const jitter = options.jitter ?? Math.random;
  const fetchImpl = options.fetchImpl ?? fetch;
  let lastNetworkError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(request, init);
      if (response.ok) return response;
      if (response.status === 401 || response.status === 403) {
        throw new AITransportError("authFailed", `Authentication failed with HTTP ${response.status}`, response.status);
      }
      if (response.status === 400 || response.status === 422) {
        throw new AITransportError("badRequest", "Bad request", response.status);
      }
      if (!isRetryableStatus(response.status) || attempt === maxAttempts - 1) {
        throw response.status === 429
          ? new AITransportError("rateLimited", "Rate limit retries exhausted", response.status)
          : new AITransportError("serverError", `HTTP ${response.status}`, response.status);
      }
      await sleep(delayForAttempt(attempt, retryAfterSeconds(response.headers), jitter));
    } catch (error) {
      if (error instanceof AITransportError) throw error;
      lastNetworkError = error;
      if (attempt === maxAttempts - 1) {
        throw new AITransportError("network", `Network retries exhausted: ${String(error)}`);
      }
      await sleep(delayForAttempt(attempt, undefined, jitter));
    }
  }

  throw new AITransportError("network", `Network retries exhausted: ${String(lastNetworkError)}`);
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

function defaultSleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
