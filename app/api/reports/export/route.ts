import { createAdminClient } from "@/utils/supabase/admin";

/**
 * GET /api/reports/export
 *
 * Streams a CSV of the patient cohort for facility / government reporting.
 * Uses the service-role admin client (sessionless, trusted server read).
 */

const COLUMNS = [
  "id",
  "full_name",
  "phone_number",
  "gestational_week",
  "risk_level",
  "postpartum",
  "preferred_channel",
  "created_at",
] as const;

type PatientRow = Record<(typeof COLUMNS)[number], unknown>;

/** Escape a single CSV field per RFC 4180. */
function escapeCsv(value: unknown): string {
  const str =
    value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("patients")
    .select(COLUMNS.join(","))
    .order("created_at", { ascending: false });

  if (error) {
    return new Response("Failed to export patient report.", { status: 500 });
  }

  const rows = (data ?? []) as unknown as PatientRow[];

  const lines = [
    COLUMNS.join(","),
    ...rows.map((row) =>
      COLUMNS.map((col) => escapeCsv(row[col])).join(","),
    ),
  ];

  const csv = lines.join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=mamaguard-patients.csv",
    },
  });
}
