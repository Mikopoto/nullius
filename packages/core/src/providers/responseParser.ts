export class AIResponseParseError extends Error {
  readonly snippet: string;

  constructor(message: string, snippet: string) {
    super(message);
    this.name = "AIResponseParseError";
    this.snippet = trimForDisplay(snippet);
  }
}

export function extractJSONObject(text: string): string {
  let candidate = text.trim();

  if (candidate.startsWith("```")) {
    const lines = candidate.split(/\r?\n/);
    if (lines[0]?.trim().startsWith("```")) lines.shift();
    if (lines.at(-1)?.trim() === "```") lines.pop();
    candidate = lines.join("\n").trim();
  }

  if (candidate.startsWith("{") && candidate.endsWith("}")) return candidate;

  const balanced = firstBalancedJSONObject(candidate);
  if (balanced) return balanced;

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end >= start) return candidate.slice(start, end + 1);
  throw new AIResponseParseError("No JSON object found in model response", text);
}

export function parseJSONFromResponse<T = unknown>(text: string): T {
  const json = extractJSONObject(text);
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    throw new AIResponseParseError(`Invalid JSON: ${String(error)}`, json);
  }
}

export function firstBalancedJSONObject(text: string): string | undefined {
  const start = text.indexOf("{");
  if (start < 0) return undefined;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return undefined;
}

export function trimForDisplay(text: string, limit = 900): string {
  const compact = text.trim();
  return compact.length <= limit ? compact : `${compact.slice(0, limit)}...`;
}

