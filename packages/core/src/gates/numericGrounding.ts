export interface NumericGroundingReport {
  checkedNumbers: string[];
  ungroundedNumbers: string[];
  checkedIntegers: string[];
  ungroundedIntegers: string[];
}

const scannableExtensions = new Set(["csv", "tsv", "json", "txt", "log", "md", "dat"]);
const floatLikePattern = /[-+]?(?:\d+(?:\.\d+)?[eE][-+]?\d+|\d+\.\d+)(?:%)?|(?<![\d.eE+-])\d+%/g;
const integerPattern = /(?<![\d.eE+-])\d{2,}(?![\d.eE+-])/g;
const artifactNumberPattern = /[-+]?(?:\d+(?:\.\d+)?[eE][-+]?\d+|\d+\.\d+|\d+)(?:%)?/g;

export function stripCodeFences(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "");
}

export function targetSectionText(markdown: string): string {
  const text = stripCodeFences(markdown);
  const lines = text.split(/\r?\n/);
  const selected: string[] = [];
  let include = false;

  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const title = normalizeHeading(heading[2] ?? "");
      include = title === "abstract" || title === "results" || title === "result" || title === "discussion";
      continue;
    }
    if (include) selected.push(line);
  }

  return selected.join("\n");
}

export function resultsSectionText(markdown: string): string {
  const text = stripCodeFences(markdown);
  const lines = text.split(/\r?\n/);
  const selected: string[] = [];
  let include = false;

  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      include = normalizeHeading(heading[2] ?? "") === "results";
      continue;
    }
    if (include) selected.push(line);
  }

  return selected.join("\n");
}

function normalizeHeading(value: string): string {
  return value.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
}

export function significantNumbers(text: string): string[] {
  return Array.from(stripCodeFences(text).matchAll(floatLikePattern), (match) => match[0]);
}

export function significantIntegers(text: string): string[] {
  const integers = Array.from(stripCodeFences(text).matchAll(integerPattern), (match) => match[0]);
  return integers.filter((value) => {
    const number = Number(value);
    return Number.isFinite(number) && !(number >= 1900 && number <= 2099);
  });
}

export function groundingReport(body: string, artifactTexts: string[], options: { scope?: "sections" | "full" } = {}): NumericGroundingReport {
  const checkedText = options.scope === "full" ? stripCodeFences(body) : targetSectionText(body);
  const numbers = unique(significantNumbers(checkedText));
  const integers = unique(significantIntegers(checkedText));
  const artifactValues = parseArtifactValues(artifactTexts);
  const artifactIntegers = parseArtifactIntegers(artifactTexts);

  const ungroundedNumbers = numbers.filter((value) => !isGroundedNumber(value, artifactValues));
  const ungroundedIntegers = integers.filter((value) => {
    if (artifactIntegers.has(value)) return false;
    const numeric = Number(value);
    return !artifactValues.some((candidate) => candidate === numeric);
  });

  return {
    checkedNumbers: numbers,
    ungroundedNumbers,
    checkedIntegers: integers,
    ungroundedIntegers
  };
}

export function isScannablePath(path: string | undefined): boolean {
  if (!path) return false;
  const extension = path.split(".").pop()?.toLowerCase();
  return extension ? scannableExtensions.has(extension) : false;
}

function parseArtifactValues(artifactTexts: string[]): number[] {
  const values: number[] = [];
  artifactTexts = artifactTexts.map((text) => text.replace(/(\d),(?=\d{3}\b)/g, "$1"));
  for (const text of artifactTexts) {
    for (const match of text.matchAll(artifactNumberPattern)) {
      const parsed = parseNumericToken(match[0]);
      if (Number.isFinite(parsed)) values.push(parsed);
    }
  }
  return values;
}

function parseArtifactIntegers(artifactTexts: string[]): Set<string> {
  const values = new Set<string>();
  for (const text of artifactTexts) {
    for (const value of significantIntegers(text)) values.add(value);
  }
  return values;
}

function isGroundedNumber(token: string, artifactValues: number[]): boolean {
  const percent = token.endsWith("%");
  const bodyValue = parseNumericToken(token);
  if (!Number.isFinite(bodyValue)) return false;

  const candidates = percent ? [bodyValue, bodyValue / 100] : [bodyValue];
  return candidates.some((candidate) =>
    artifactValues.some((artifactValue) => numericallyEquivalent(candidate, artifactValue, decimalPlacesFor(token, percent)))
  );
}

function parseNumericToken(token: string): number {
  const trimmed = token.trim();
  const isPercent = trimmed.endsWith("%");
  const raw = isPercent ? trimmed.slice(0, -1) : trimmed;
  const value = Number(raw);
  return Number.isFinite(value) ? value : Number.NaN;
}

function decimalPlacesFor(token: string, percent: boolean): number {
  const raw = percent ? token.slice(0, -1) : token;
  const exponentMatch = /e[-+]?\d+$/i.exec(raw);
  const mantissa = exponentMatch ? raw.slice(0, exponentMatch.index) : raw;
  const dot = mantissa.indexOf(".");
  if (dot < 0) return 0;
  const places = Math.min(mantissa.length - dot - 1, 12);
  return percent ? Math.min(places + 2, 12) : places;
}

function numericallyEquivalent(bodyValue: number, artifactValue: number, decimalPlaces: number): boolean {
  const roundedArtifact = roundTo(artifactValue, decimalPlaces);
  const roundedBody = roundTo(bodyValue, decimalPlaces);
  const tolerance = 0.5 * Math.pow(10, -Math.max(decimalPlaces, 0)) + Number.EPSILON;
  return Math.abs(roundedArtifact - roundedBody) <= tolerance;
}

function roundTo(value: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
