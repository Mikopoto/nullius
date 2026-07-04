import type { LiteratureItem } from "../model/schemas.js";

const stopWords = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "is",
  "of",
  "on",
  "the",
  "to",
  "with"
]);

const authorFillers = new Set(["et", "al", "and", "others"]);

export function normalizeDoi(doi: string): string {
  return doi
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "")
    .replace(/^doi:\s*/, "");
}

export function titleTokens(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0 && !stopWords.has(token));
}

export function titlesMatch(left: string, right: string): boolean {
  const leftTokens = new Set(titleTokens(left));
  const rightTokens = new Set(titleTokens(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) return false;
  const overlap = intersectionSize(leftTokens, rightTokens);
  const dice = (2 * overlap) / (leftTokens.size + rightTokens.size);
  const ratio = Math.min(leftTokens.size, rightTokens.size) / Math.max(leftTokens.size, rightTokens.size);
  return dice >= 0.75 && ratio >= 0.5;
}

export function familyNames(authorText: string): string[] {
  return authorText
    .split(/[,;]|(?:\s+and\s+)/i)
    .map((chunk) =>
      chunk
        .toLowerCase()
        .replace(/[^\p{L}\s-]/gu, " ")
        .split(/\s+/)
        .filter((part) => part.length > 0 && !authorFillers.has(part))
    )
    .map((parts) => parts.at(-1))
    .filter((part): part is string => Boolean(part));
}

export function authorFamilyNamesOverlap(left: string, right: string): boolean {
  const leftNames = new Set(familyNames(left));
  const rightNames = new Set(familyNames(right));
  return intersectionSize(leftNames, rightNames) > 0;
}

export function isAllowedCitation(item: Pick<LiteratureItem, "status" | "doi" | "url">): boolean {
  if (item.status === "verified") return true;
  return item.status === "importedByUser" && Boolean(item.doi || item.url);
}

export async function verifyLiteratureItem(
  item: LiteratureItem,
  options: { fetchImpl?: typeof fetch } = {}
): Promise<LiteratureItem> {
  if (!item.doi) {
    if (item.status === "importedByUser" && item.url) return item;
    return { ...item, status: item.status === "rejected" ? "rejected" : "unverified" };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const doi = normalizeDoi(item.doi);
  let response: Response;
  try {
    response = await fetchImpl(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  } catch {
    return item;
  }

  if (response.status === 404) return { ...item, doi, status: "rejected" };
  if (!response.ok) return item;

  const body = (await response.json()) as CrossrefResponse;
  const work = body.message;
  if (hasRetractionSignal(work.relation)) return { ...item, doi, status: "retracted" };

  const crossrefTitle = work.title?.[0] ?? "";
  const crossrefAuthors = (work.author ?? []).map((author) => author.family ?? "").filter(Boolean).join(", ");
  const crossrefYear = String(work.published?.["date-parts"]?.[0]?.[0] ?? work.issued?.["date-parts"]?.[0]?.[0] ?? "");

  const titleOK = titlesMatch(item.title, crossrefTitle);
  const authorsOK = item.authors.trim().length === 0 || authorFamilyNamesOverlap(item.authors, crossrefAuthors);
  const yearOK = item.year.trim().length === 0 || crossrefYear.length === 0 || Math.abs(Number(item.year) - Number(crossrefYear)) <= 1;
  return {
    ...item,
    doi,
    status: titleOK && authorsOK && yearOK ? "verified" : "rejected"
  };
}

interface CrossrefResponse {
  message: {
    title?: string[];
    author?: Array<{ family?: string }>;
    published?: { "date-parts"?: number[][] };
    issued?: { "date-parts"?: number[][] };
    relation?: unknown;
  };
}

function hasRetractionSignal(relation: unknown): boolean {
  return /retraction|withdrawal|removal/i.test(JSON.stringify(relation ?? {}));
}

function intersectionSize(left: Set<string>, right: Set<string>): number {
  let count = 0;
  for (const value of left) {
    if (right.has(value)) count += 1;
  }
  return count;
}
