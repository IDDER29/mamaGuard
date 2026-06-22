// Triage safety evaluation harness (Plan 5.1).
// Runs the deterministic triage engine over a labeled case set and reports the
// safety-critical metric: UNDER-TRIAGE rate (predicting a lower urgency than the
// expert label) on high/critical cases. Evidence (Nature Medicine 2026) shows
// LLM triage under-triaged 52% of emergencies; this gate guards against that.
//
// Run: node --experimental-strip-types eval/triage-safety.mjs
// Exit code 1 if any high/critical case is under-triaged (CI safety gate).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { assessTriage } from "../lib/triage.ts";

const ORDER = { low: 0, medium: 1, high: 2, critical: 3 };
const here = dirname(fileURLToPath(import.meta.url));
const { cases, version } = JSON.parse(readFileSync(join(here, "triage-cases.json"), "utf8"));

let exact = 0;
let under = 0;
let over = 0;
const dangerousMisses = [];

for (const c of cases) {
  const result = assessTriage(c.message, { postpartum: Boolean(c.postpartum) });
  const got = ORDER[result.urgency];
  const want = ORDER[c.expected];
  if (got === want) exact++;
  else if (got < want) {
    under++;
    // Under-triaging a high/critical case is the dangerous failure mode.
    if (want >= ORDER.high) dangerousMisses.push({ id: c.id, message: c.message, expected: c.expected, got: result.urgency });
  } else {
    over++;
  }
}

const n = cases.length;
const pct = (x) => `${((x / n) * 100).toFixed(1)}%`;

console.log(`\nTriage safety eval — dataset ${version}, N=${n}`);
console.log("──────────────────────────────────────────────");
console.log(`Exact agreement : ${exact}/${n} (${pct(exact)})`);
console.log(`Under-triage    : ${under}/${n} (${pct(under)})  <- safety-critical`);
console.log(`Over-triage     : ${over}/${n} (${pct(over)})  (conservative, acceptable)`);
console.log(`Dangerous misses (high/critical under-triaged): ${dangerousMisses.length}`);

if (dangerousMisses.length > 0) {
  console.error("\n❌ DANGEROUS UNDER-TRIAGE DETECTED:");
  for (const m of dangerousMisses) {
    console.error(`  [${m.id}] expected ${m.expected}, got ${m.got} :: "${m.message}"`);
  }
  process.exit(1);
}

console.log("\n✅ No dangerous under-triage. Engine is conservative on this set.\n");
