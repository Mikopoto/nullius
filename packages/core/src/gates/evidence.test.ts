import { describe, expect, it } from "vitest";
import type { Claim, EvidenceItem, GateProject, LiteratureItem, Patch } from "../index.js";
import {
  applyPatchIfValid,
  citationKeys,
  claimCanEnterManuscript,
  foundSectionCount,
  internalOutputLeakTerms,
  normalizedTextHash,
  patchCanApply,
  readinessReport,
  stageManuscriptPatch
} from "./evidence.js";

describe("evidence gate helpers", () => {
  it("extracts bracketed and bare citation keys", () => {
    const body = "As shown [@vaswani2017] and confirmed [@he2016; @smith2020], see also @doe2021.";
    expect(new Set(citationKeys(body))).toEqual(new Set(["vaswani2017", "he2016", "smith2020", "doe2021"]));
  });

  it("does not treat emails or numeric-leading keys as citation keys", () => {
    expect(citationKeys("contact someone@example.org for data")).toEqual([]);
    expect(citationKeys("Bad keys [@2024fake] and @123abc are ignored, but @smith2024 remains.")).toEqual(["smith2024"]);
  });
});

function executionEvidence(id = "ev-fit", exitCode = 0, path = "artifacts/fit.csv"): EvidenceItem {
  return {
    id,
    type: "execution",
    title: "Run output",
    summary: "metric,value\nslope,2.0\n",
    path,
    createdAt: new Date(0).toISOString(),
    sourceActivityId: "activity-run",
    sourceActivityType: "execution",
    validation: "valid",
    review: "approved",
    execution: {
      producingCommand: "python analysis.py",
      exitCode,
      stdoutPath: "logs/stdout.log",
      stderrPath: "logs/stderr.log",
      artifactPaths: [path],
      sha256ByPath: { [path]: "abc" },
      environmentSummary: "python"
    }
  };
}

function resultClaim(evidenceId = "ev-fit", id = "claim-fit"): Claim {
  return {
    id,
    text: "The fit slope is 2.0.",
    type: "result",
    supportRefs: [{ targetType: "evidence", targetId: evidenceId, role: "primary", validation: "valid" }],
    validation: "valid",
    review: "approved",
    qmdPatchIds: []
  };
}

function readyBody(): string {
  return [
    "# Abstract",
    "Summary text.",
    "# Introduction",
    "Background text.",
    "# Methods",
    "Method text.",
    "# Results",
    "The fit slope is 2.0.",
    "# Discussion",
    "Discussion text.",
    "# Limitations",
    "Limitation text.",
    "# References",
    "Reference list."
  ].join("\n");
}

function readyProject(): GateProject {
  const evidenceA = executionEvidence("ev-a", 0, "artifacts/fit.csv");
  const evidenceB = executionEvidence("ev-b", 0, "artifacts/fit2.csv");
  return {
    manuscriptBody: readyBody(),
    evidence: [evidenceA, evidenceB],
    claims: [resultClaim(evidenceA.id, "claim-a"), resultClaim(evidenceB.id, "claim-b")],
    literature: [],
    patches: []
  };
}

describe("claim gates", () => {
  it("requires result claims to have approved primary execution evidence with exit code 0", () => {
    const project = readyProject();
    expect(claimCanEnterManuscript(project.claims[0]!, project)).toBe(true);

    project.evidence[0] = executionEvidence("ev-a", 1);
    expect(claimCanEnterManuscript(project.claims[0]!, project)).toBe(false);

    project.evidence[0] = { ...executionEvidence("ev-a", 0), type: "table", execution: undefined };
    expect(claimCanEnterManuscript(project.claims[0]!, project)).toBe(false);
  });

  it("requires background claims to cite verified or sourced user-imported literature", () => {
    const literature: LiteratureItem = {
      id: "lit-1",
      title: "Prior work",
      authors: "",
      year: "",
      citationKey: "prior2024",
      status: "unverified",
      notes: ""
    };
    const claim: Claim = {
      id: "bg-1",
      text: "Prior work established the baseline.",
      type: "background",
      supportRefs: [{ targetType: "citation", targetId: "lit-1", role: "background", validation: "valid" }],
      validation: "valid",
      review: "approved",
      qmdPatchIds: []
    };
    const project: GateProject = { manuscriptBody: "", evidence: [], claims: [claim], literature: [literature] };
    expect(claimCanEnterManuscript(claim, project)).toBe(false);

    project.literature[0] = { ...literature, status: "verified" };
    expect(claimCanEnterManuscript(claim, project)).toBe(true);

    project.literature[0] = { ...literature, status: "importedByUser" };
    expect(claimCanEnterManuscript(claim, project)).toBe(false);

    project.literature[0] = { ...literature, status: "importedByUser", doi: "10.1000/prior.2024" };
    expect(claimCanEnterManuscript(claim, project)).toBe(true);

    project.literature[0] = { ...literature, status: "retracted", doi: "10.1000/prior.2024" };
    expect(claimCanEnterManuscript(claim, project)).toBe(false);
  });
});

describe("section and leak gates", () => {
  it("counts only real markdown headers and ignores code-fenced headers", () => {
    expect(foundSectionCount("This prose mentions results, methods, discussion, abstract, introduction, limitations, references.")).toBe(0);
    expect(foundSectionCount(readyBody())).toBe(7);
    expect(foundSectionCount("# Results\n```python\n# Methods comment\n```")).toBe(1);
  });

  it("detects internal terms that should not leak to final output", () => {
    const leaks = internalOutputLeakTerms("See claim_id 42 recorded by the harness in node.qmd");
    expect(leaks).toContain("claim_id");
    expect(leaks).toContain("harness");
    expect(leaks).toContain("node.qmd");
  });

  it("flags internal ids but not ordinary English words containing node/lane/patch", () => {
    const clean = internalOutputLeakTerms("The plane dispatched a node of the network along the lane; we patched nothing.");
    expect(clean).toEqual([]);
    const leaky = internalOutputLeakTerms("Details in node-3f2a9c1d and lane-0b7e4d21 were reviewed.");
    expect(leaky).toContain("node-3f2a9c1d");
    expect(leaky).toContain("lane-0b7e4d21");
  });
});

describe("readiness", () => {
  it("passes a ready project", () => {
    const report = readinessReport(readyProject(), "standard", {
      artifactExists: () => true,
      artifactText: (evidence) => evidence.summary
    });
    expect(report.ready).toBe(true);
  });

  it("blocks pending patches, orphan result claims, missing artifacts, leaks, and ungrounded numbers", () => {
    const pending = readyProject();
    pending.patches = [
      {
        id: "patch-1",
        targetSection: "document",
        operation: "replace",
        baseHash: "abc",
        newBody: "new body",
        warnings: [],
        blockingMarkers: [],
        supportRefs: [],
        claimIds: [],
        status: "draft"
      }
    ];
    expect(readinessReport(pending, "standard").ready).toBe(false);
    expect(readinessReport(pending, "standard").pendingPatchCount).toBe(1);

    const orphan = readyProject();
    orphan.evidence[0] = executionEvidence("ev-a", 1);
    expect(readinessReport(orphan, "standard").orphanResultClaimCount).toBeGreaterThan(0);

    const missing = readyProject();
    expect(readinessReport(missing, "standard", { artifactExists: () => false }).missingArtifactCount).toBeGreaterThan(0);

    const leak = readyProject();
    leak.manuscriptBody += "\nGenerated by the agent run harness.";
    expect(readinessReport(leak, "standard").internalLeakTerms.length).toBeGreaterThan(0);

    const fabricated = readyProject();
    fabricated.manuscriptBody = fabricated.manuscriptBody.replace("The fit slope is 2.0.", "The fit slope is 3.1415.");
    expect(readinessReport(fabricated, "standard", { artifactText: (evidence) => evidence.summary }).ungroundedResultNumbers).toEqual(["3.1415"]);
  });

  it("reports fabricated-looking integers as soft warnings without hard blocking", () => {
    const project = readyProject();
    project.manuscriptBody = project.manuscriptBody.replace("The fit slope is 2.0.", "We analyzed 500 samples across 12 sessions in 2024. The slope is 2.0.");
    const report = readinessReport(project, "standard", { artifactText: (evidence) => evidence.summary });
    expect(new Set(report.ungroundedIntegers)).toEqual(new Set(["500", "12"]));
    expect(report.ready).toBe(true);
  });
});

describe("QMD patch gate", () => {
  it("allows only approved clean patches with matching base hash", () => {
    const current = readyBody();
    const patch: Patch = {
      id: "p1",
      targetSection: "document",
      operation: "replace",
      baseHash: normalizedTextHash(current),
      newBody: current.replace("Summary text.", "Updated summary."),
      warnings: [],
      blockingMarkers: [],
      supportRefs: [],
      claimIds: [],
      status: "approved"
    };
    expect(patchCanApply({ ...patch, status: "draft" })).toBe(false);
    expect(patchCanApply({ ...patch, warnings: [{ message: "invalid ref", blocking: true, supportRefIds: [] }] })).toBe(false);
    expect(applyPatchIfValid(current, patch).applied).toBe(true);
    expect(applyPatchIfValid("changed", patch).applied).toBe(false);
  });

  it("blocks fabricated numbers and unverified citations at the write boundary", () => {
    const project = readyProject();
    const body = readyBody().replace("The fit slope is 2.0.", "The fit slope is 9.4142 and follows prior work [@missing2024].");
    const patch = stageManuscriptPatch(project, body, { autoApprove: true, artifactTexts: ["metric,value\nslope,2.0\n"] });
    expect(patch.status).toBe("needsRevision");
    expect(patch.warnings.some((warning) => warning.blocking && warning.message.includes("9.4142"))).toBe(true);
    expect(patch.warnings.some((warning) => warning.blocking && warning.message.includes("@missing2024"))).toBe(true);
    expect(applyPatchIfValid(project.manuscriptBody, patch).applied).toBe(false);
  });
});
