// Unit tests for the conversation intent parser (Plan E2.1/E2.2).
// Run: node --experimental-strip-types --test lib/conversation.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { parseIntent } from "./conversation.ts";

const cases = [
  ["STOP", "stop", "stop keyword"],
  ["stop", "stop", "stop lowercase"],
  ["وقف", "stop", "stop (arabic)"],
  ["help", "help", "help keyword"],
  ["مساعدة", "help", "help (arabic)"],
  ["menu", "help", "menu -> help"],
  ["FR", "language", "french code"],
  ["francais", "language", "french word"],
  ["english", "language", "english"],
  ["darija", "language", "darija"],
  ["amazigh", "language", "amazigh"],
  ["salam labas 3lik kif dayra", "message", "greeting is a message"],
  ["3andi nazif bzaf", "message", "symptom is a message"],
  // Safety: command words inside a real sentence must NOT hijack triage.
  ["stop the bleeding it won't stop please help me", "message", "long 'stop' sentence stays a message"],
  ["i can't make it to the appointment", "message", "long text not a command"],
];

for (const [input, expected, note] of cases) {
  test(`${note} :: "${input}" -> ${expected}`, () => {
    assert.equal(parseIntent(input).kind, expected);
  });
}

// Language target resolution
test("language target resolves", () => {
  const r = parseIntent("francais");
  assert.equal(r.kind, "language");
  if (r.kind === "language") assert.equal(r.language, "french");
});
