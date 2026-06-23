// Unit tests for the predictive risk heuristic (Plan E8.2).
// Run: node --experimental-strip-types --test lib/riskScore.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { computeRiskScore } from "./riskScore.ts";

test("no signals → low band, score 0", () => {
  const r = computeRiskScore({ riskLevel: "low" });
  assert.equal(r.score, 0);
  assert.equal(r.band, "low");
});

test("critical triage contributes", () => {
  const r = computeRiskScore({ riskLevel: "critical" });
  assert.ok(r.score >= 45);
  assert.ok(r.reasons.some((x) => /critical/i.test(x)));
});

test("severe-range BP adds 40", () => {
  const r = computeRiskScore({ riskLevel: "low", latestSystolic: 165, latestDiastolic: 112 });
  assert.equal(r.score, 40);
  assert.ok(r.reasons.some((x) => /BP/i.test(x)));
});

test("elevated BP adds 25", () => {
  const r = computeRiskScore({ riskLevel: "low", latestSystolic: 145, latestDiastolic: 92 });
  assert.equal(r.score, 25);
});

test("EPDS self-harm adds 35", () => {
  const r = computeRiskScore({ riskLevel: "low", epdsSelfHarm: true });
  assert.equal(r.score, 35);
});

test("combined signals cap at 100 and reach high band", () => {
  const r = computeRiskScore({
    riskLevel: "critical",
    latestSystolic: 170,
    latestDiastolic: 115,
    epdsSelfHarm: true,
    missedVisits: 3,
  });
  assert.equal(r.score, 100);
  assert.equal(r.band, "high");
});

test("missed visits contribute but are capped", () => {
  const r = computeRiskScore({ riskLevel: "low", missedVisits: 5 });
  assert.equal(r.score, 15);
});
