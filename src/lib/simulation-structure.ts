export type ArtifactType =
  | "email"
  | "slack"
  | "memo"
  | "data_table"
  | "call_notes"
  | "crm_record"
  | "doc";

export interface WorkArtifact {
  type: ArtifactType;
  title: string;
  from?: string;
  to?: string;
  cc?: string;
  subject?: string;
  timestamp?: string;
  channel?: string;
  body: string;
  columns?: string[];
  rows?: string[][];
}

export interface SimulationPhase {
  number: number;
  title: string;
  minutes: number;
  competency: string;
  situation: string;
  materials: string;
  artifacts: WorkArtifact[];
  task: string;
  deliverable: string;
  success_criteria: string;
}

export interface StructuredSimulation {
  overview: string;
  total_minutes: number;
  materials_provided: string;
  phases: SimulationPhase[];
}

const ARTIFACT_TYPES = new Set<ArtifactType>([
  "email",
  "slack",
  "memo",
  "data_table",
  "call_notes",
  "crm_record",
  "doc",
]);

/** Coerce OpenAI quirks (arrays/objects) into displayable plain text. */
function asText(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => asText(item))
      .filter(Boolean)
      .join("\n\n");
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => asText(v)).filter(Boolean);
}

function asRowMatrix(value: unknown): string[][] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    if (Array.isArray(row)) return row.map((cell) => asText(cell));
    if (row && typeof row === "object") {
      return Object.values(row as Record<string, unknown>).map((cell) =>
        asText(cell),
      );
    }
    return [asText(row)];
  });
}

function normalizeType(value: unknown): ArtifactType {
  const t = asText(value, "doc").toLowerCase().replace(/\s+/g, "_");
  if (ARTIFACT_TYPES.has(t as ArtifactType)) return t as ArtifactType;
  if (t.includes("email") || t.includes("inbox")) return "email";
  if (t.includes("slack") || t.includes("chat") || t.includes("message"))
    return "slack";
  if (t.includes("table") || t.includes("metric") || t.includes("spreadsheet"))
    return "data_table";
  if (t.includes("call") || t.includes("phone")) return "call_notes";
  if (t.includes("crm") || t.includes("salesforce") || t.includes("hubspot"))
    return "crm_record";
  if (t.includes("memo") || t.includes("brief")) return "memo";
  return "doc";
}

function parseArtifact(raw: unknown, index: number): WorkArtifact | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const body = raw.trim();
    if (!body) return null;
    return {
      type: "doc",
      title: `Document ${index + 1}`,
      body,
    };
  }
  if (typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const body = asText(
    a.body ?? a.content ?? a.text ?? a.message ?? a.snippet,
  );
  const columns = asStringArray(a.columns ?? a.headers);
  const rows = asRowMatrix(a.rows ?? a.data ?? a.table);
  if (!body && columns.length === 0 && rows.length === 0) return null;

  return {
    type: normalizeType(a.type ?? a.kind),
    title: asText(a.title ?? a.name ?? a.label, `Material ${index + 1}`),
    from: asText(a.from ?? a.sender ?? a.author) || undefined,
    to: asText(a.to ?? a.recipient) || undefined,
    cc: asText(a.cc) || undefined,
    subject: asText(a.subject) || undefined,
    timestamp: asText(a.timestamp ?? a.time ?? a.date ?? a.sent_at) || undefined,
    channel: asText(a.channel ?? a.room) || undefined,
    body:
      body ||
      (rows.length
        ? "See table data."
        : "No body content provided."),
    columns: columns.length ? columns : undefined,
    rows: rows.length ? rows : undefined,
  };
}

function parseArtifacts(
  artifactsRaw: unknown,
  materialsFallback: string,
): WorkArtifact[] {
  const list: WorkArtifact[] = [];
  if (Array.isArray(artifactsRaw)) {
    artifactsRaw.forEach((item, i) => {
      const parsed = parseArtifact(item, i);
      if (parsed) list.push(parsed);
    });
  }
  if (list.length === 0 && materialsFallback.trim()) {
    list.push({
      type: "memo",
      title: "Working materials",
      body: materialsFallback.trim(),
    });
  }
  return list;
}

/** Parse stored generated_prompt — JSON preferred; plain text falls back to one phase. */
export function parseSimulationContent(
  raw: string | unknown,
): StructuredSimulation {
  const source =
    typeof raw === "string"
      ? raw
      : raw == null
        ? ""
        : typeof raw === "object"
          ? JSON.stringify(raw)
          : String(raw);

  const trimmed = source.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      const phasesRaw = parsed.phases;
      if (Array.isArray(phasesRaw) && phasesRaw.length > 0) {
        return {
          overview: asText(parsed.overview),
          total_minutes: asNumber(parsed.total_minutes, 120),
          materials_provided: asText(parsed.materials_provided),
          phases: phasesRaw.map((phase, i) => {
            const p = (phase ?? {}) as Record<string, unknown>;
            const materials = asText(p.materials);
            return {
              number: asNumber(p.number, i + 1),
              title: asText(p.title, `Phase ${i + 1}`),
              minutes: asNumber(p.minutes, 20),
              competency: asText(p.competency),
              situation: asText(p.situation),
              materials,
              artifacts: parseArtifacts(p.artifacts, materials),
              task: asText(p.task),
              deliverable: asText(p.deliverable),
              success_criteria: asText(
                p.success_criteria ?? p.successCriteria,
              ),
            };
          }),
        };
      }
    } catch {
      // fall through to plain-text fallback
    }
  }

  return {
    overview: "Complete the work brief below and submit your response.",
    total_minutes: 120,
    materials_provided: "",
    phases: [
      {
        number: 1,
        title: "Work simulation",
        minutes: 120,
        competency: "Role competency",
        situation: trimmed || "No simulation content available.",
        materials: "",
        artifacts: trimmed
          ? [
              {
                type: "memo",
                title: "Brief",
                body: trimmed,
              },
            ]
          : [],
        task: "Complete all deliverables described in the brief.",
        deliverable: "Your full written response covering every required output.",
        success_criteria: "Addresses the brief thoroughly and clearly.",
      },
    ],
  };
}
