// lib/roles.ts — Plan E4.1 role model (shared, dependency-free).

export type Role = "chw" | "nurse" | "clinician" | "supervisor" | "admin" | "integration";

export const ROLE_LABELS: Record<Role, string> = {
  chw: "Community Health Worker",
  nurse: "Nurse",
  clinician: "Clinician",
  supervisor: "Supervisor",
  admin: "Administrator",
  integration: "Integration",
};

// Capabilities gate UI + server actions. Kept coarse for the MVP.
export type Capability =
  | "triage" // act on alerts
  | "manage_patients"
  | "supervise" // reassign, team views
  | "admin" // users, roles, facilities, audit
  | "report"; // analytics/exports

const CAPABILITIES: Record<Role, Capability[]> = {
  chw: ["triage", "manage_patients"],
  nurse: ["triage", "manage_patients", "report"],
  clinician: ["triage", "manage_patients", "report"],
  supervisor: ["triage", "manage_patients", "supervise", "report"],
  admin: ["triage", "manage_patients", "supervise", "admin", "report"],
  integration: ["report"],
};

export function can(role: Role | null | undefined, capability: Capability): boolean {
  if (!role) return false;
  return CAPABILITIES[role]?.includes(capability) ?? false;
}
