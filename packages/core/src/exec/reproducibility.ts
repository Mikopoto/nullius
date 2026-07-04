const numberPattern = /[-+]?(?:\d+\.\d+|\d+(?:\.\d+)?[eE][-+]?\d+|\d+)/g;

export function canonicallyEqualText(left: string, right: string): boolean {
  const normalizedLeft = canonicalizeText(left);
  const normalizedRight = canonicalizeText(right);
  return normalizedLeft === normalizedRight;
}

export function canonicalizeText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(numberPattern, (token) => normalizeNumericToken(token))
    .trim();
}

function normalizeNumericToken(token: string): string {
  const value = Number(token);
  if (!Number.isFinite(value)) return token;
  return Number.parseFloat(value.toPrecision(10)).toString();
}

