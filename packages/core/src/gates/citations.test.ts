import { describe, expect, it } from "vitest";
import { authorFamilyNamesOverlap, familyNames, isAllowedCitation, normalizeDoi, titlesMatch, verifyLiteratureItem } from "./citations.js";

describe("citation matching", () => {
  it("normalizes DOI strings", () => {
    expect(normalizeDoi("https://doi.org/10.1000/ABC")).toBe("10.1000/abc");
    expect(normalizeDoi("doi: 10.1000/ABC")).toBe("10.1000/abc");
  });

  it("rejects subset title spoofs but allows subtitle truncation", () => {
    expect(titlesMatch("Deep Learning", "A Comprehensive Survey of Deep Learning Methods for Medical Image Segmentation and Diagnosis")).toBe(false);
    expect(titlesMatch("Deep Residual Learning for Image Recognition", "Deep Residual Learning for Image Recognition: An Empirical Study")).toBe(true);
  });

  it("extracts family names and ignores et al fillers", () => {
    expect(familyNames("Vaswani et al.")).toEqual(["vaswani"]);
    expect(familyNames("The Team")).toEqual(["team"]);
    expect(authorFamilyNamesOverlap("The Team", "Research Team")).toBe(true);
    expect(authorFamilyNamesOverlap("Vaswani et al.", "Ashish Vaswani, Noam Shazeer")).toBe(true);
    expect(authorFamilyNamesOverlap("Someone Else", "Ashish Vaswani, Noam Shazeer")).toBe(false);
  });

  it("allows only verified or user-imported citations with a source pointer", () => {
    expect(isAllowedCitation({ status: "verified" })).toBe(true);
    expect(isAllowedCitation({ status: "importedByUser", url: "https://example.org" })).toBe(true);
    expect(isAllowedCitation({ status: "importedByUser" })).toBe(false);
    expect(isAllowedCitation({ status: "retracted" })).toBe(false);
  });

  it("verifies DOI metadata with Crossref-style records", async () => {
    const item = await verifyLiteratureItem(
      {
        id: "lit-1",
        title: "Reproducible Manuscripts with Quarto",
        authors: "Allaire",
        year: "2024",
        doi: "https://doi.org/10.1234/example",
        citationKey: "allaire2024",
        status: "unverified",
        notes: ""
      },
      {
        fetchImpl: async () =>
          new Response(
            JSON.stringify({
              message: {
                title: ["Reproducible Manuscripts with Quarto"],
                author: [{ family: "Allaire" }],
                published: { "date-parts": [[2024]] }
              }
            }),
            { status: 200 }
          )
      }
    );
    expect(item.status).toBe("verified");
    expect(item.doi).toBe("10.1234/example");
  });

  it("does not change citation state on network failure", async () => {
    const original = {
      id: "lit-2",
      title: "Unknown",
      authors: "",
      year: "",
      doi: "10.9999/offline",
      citationKey: "offline",
      status: "unverified" as const,
      notes: ""
    };
    const item = await verifyLiteratureItem(original, { fetchImpl: async () => Promise.reject(new Error("offline")) });
    expect(item).toEqual(original);
  });
});
