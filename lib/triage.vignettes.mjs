// Vignette tests for the WHO-ANC-DAK triage engine (Plan 1.1).
// Run: node --experimental-strip-types lib/triage.vignettes.mjs
// (Plain .mjs so it is outside tsconfig/Next; imports the .ts engine directly.)
import test from "node:test";
import assert from "node:assert/strict";
import { assessTriage } from "./triage.ts";

const cases = [
  // [message, expectedUrgency, note]
  ["عندي نزيف بزاف", "critical", "vaginal bleeding (darija)"],
  ["ما كاينش دم", "low", "negated bleeding -> no trigger"],
  ["راسي كيوجعني والبصر مشوش", "critical", "headache + blurred vision -> pre-eclampsia escalation"],
  ["عندي صداع", "high", "headache alone"],
  ["البيبي ما كيتحركش", "critical", "no fetal movement"],
  ["كيحرقني البول", "medium", "painful urination"],
  ["كلشي مزيان والحمد لله", "low", "all good"],
  ["j'ai des saignements", "critical", "bleeding (french)"],
  ["no bleeding but I have a headache", "high", "negated bleeding, headache stands"],
  ["عطش بزاف وكنتبول بزاف", "medium", "GDM signs"],
  ["I have swelling in my hands and a headache", "critical", "swelling + headache escalation"],
  ["pas de fièvre", "low", "negated fever"],
  ["عندي تشنجات", "critical", "convulsions"],
  ["نزل ليا الما", "high", "leaking fluid"],
];

for (const [message, expected, note] of cases) {
  test(`${note} :: "${message}" -> ${expected}`, () => {
    const result = assessTriage(message);
    assert.equal(
      result.urgency,
      expected,
      `got "${result.urgency}" (signs: ${result.signs.map((s) => s.id).join(",") || "none"})`,
    );
  });
}

// --- Postpartum vignettes (Phase 3) — assessed with { postpartum: true } ----
const postpartumCases = [
  ["كنزف بزاف بعد الولادة", "critical", "postpartum haemorrhage"],
  ["عندي ريحة خايبة وسخانة", "high", "puerperal infection (foul lochia + fever)"],
  ["بغيت نموت ما بقيتش باغية نعيش", "critical", "postpartum self-harm"],
  ["كنبكي بزاف وما عنديش فرحة", "high", "postpartum depression"],
  ["البزولة كتوجعني بزاف", "medium", "mastitis"],
  ["كلشي مزيان مع البيبي", "low", "postpartum, all good"],
];

for (const [message, expected, note] of postpartumCases) {
  test(`[postpartum] ${note} :: "${message}" -> ${expected}`, () => {
    const result = assessTriage(message, { postpartum: true });
    assert.equal(
      result.urgency,
      expected,
      `got "${result.urgency}" (signs: ${result.signs.map((s) => s.id).join(",") || "none"})`,
    );
  });
}
