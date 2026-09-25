import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { feedState, readinessState } from "./types.ts";

describe("readiness", () => {
  it("stays missing when nothing is verified", () => {
    assert.equal(readinessState([{ label: "Credit", mark: "missing" }]), "MISSING");
  });

  it("is blocking if any item blocks, even when others are verified", () => {
    assert.equal(
      readinessState([
        { label: "Name", mark: "verified" },
        { label: "Site", mark: "blocking" },
      ]),
      "BLOCKING",
    );
  });

  it("is verified only when every item is verified", () => {
    assert.equal(
      readinessState([
        { label: "Name", mark: "verified" },
        { label: "Credit", mark: "verified" },
      ]),
      "VERIFIED",
    );
  });

  it("does not treat an empty dimension as verified", () => {
    assert.equal(readinessState([]), "MISSING");
  });
});

describe("feed state", () => {
  it("does not invent a live value", () => {
    assert.equal(feedState({ live: false, demo: false }), "UNAVAILABLE");
  });

  it("keeps a live print distinct from demo", () => {
    assert.equal(feedState({ live: true, demo: true }), "LIVE");
    assert.equal(feedState({ live: false, demo: true }), "DEMO");
  });
});
