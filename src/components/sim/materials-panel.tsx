import type { WorkArtifact } from "@/lib/simulation-structure";
import { cn } from "@/utils/cn";

function typeLabel(type: WorkArtifact["type"]) {
  switch (type) {
    case "email":
      return "Inbox · Email";
    case "slack":
      return "Slack";
    case "memo":
      return "Internal memo";
    case "data_table":
      return "Data · Spreadsheet view";
    case "call_notes":
      return "Call notes";
    case "crm_record":
      return "CRM record";
    default:
      return "Document";
  }
}

export function MaterialsPanel({ artifacts }: { artifacts: WorkArtifact[] }) {
  if (!artifacts.length) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-3 text-sm text-ink-muted">
        No source materials in this phase — refresh or ask your recruiter to regenerate the simulation.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {artifacts.map((artifact, i) => (
        <ArtifactCard key={`${artifact.type}-${artifact.title}-${i}`} artifact={artifact} />
      ))}
    </div>
  );
}

function ArtifactCard({ artifact }: { artifact: WorkArtifact }) {
  const shell =
    "overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm";

  if (artifact.type === "email") {
    return (
      <article className={shell}>
        <header className="border-b border-border-subtle bg-[#f3f1ec] px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            {typeLabel(artifact.type)}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {artifact.subject || artifact.title}
          </p>
        </header>
        <div className="space-y-1 border-b border-border-subtle px-4 py-2.5 text-xs text-ink-muted">
          {artifact.from && (
            <p>
              <span className="font-semibold text-ink">From:</span> {artifact.from}
            </p>
          )}
          {artifact.to && (
            <p>
              <span className="font-semibold text-ink">To:</span> {artifact.to}
            </p>
          )}
          {artifact.cc && (
            <p>
              <span className="font-semibold text-ink">Cc:</span> {artifact.cc}
            </p>
          )}
          {artifact.timestamp && (
            <p>
              <span className="font-semibold text-ink">Sent:</span>{" "}
              {artifact.timestamp}
            </p>
          )}
        </div>
        <div className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-ink">
          {artifact.body}
        </div>
      </article>
    );
  }

  if (artifact.type === "slack") {
    return (
      <article className={cn(shell, "bg-[#f8f7f4]")}>
        <header className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
              {typeLabel(artifact.type)}
            </p>
            <p className="text-sm font-semibold text-ink">
              {artifact.channel ? `#${artifact.channel.replace(/^#/, "")}` : artifact.title}
            </p>
          </div>
          {artifact.timestamp && (
            <span className="text-[11px] text-ink-faint">{artifact.timestamp}</span>
          )}
        </header>
        <div className="space-y-2 px-4 py-3 font-sans text-[13px] leading-relaxed text-ink">
          {artifact.body.split(/\n+/).filter(Boolean).map((line, idx) => (
            <p key={idx} className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-black/[0.04]">
              {line}
            </p>
          ))}
        </div>
      </article>
    );
  }

  if (artifact.type === "data_table") {
    const columns = artifact.columns?.length
      ? artifact.columns
      : artifact.rows?.[0]
        ? artifact.rows[0].map((_, i) => `Col ${i + 1}`)
        : [];
    const rows = artifact.rows ?? [];

    return (
      <article className={shell}>
        <header className="border-b border-border-subtle bg-[#eef2f4] px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            {typeLabel(artifact.type)}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{artifact.title}</p>
        </header>
        {artifact.body && artifact.body !== "See table data." && (
          <p className="border-b border-border-subtle px-4 py-2 text-xs text-ink-muted">
            {artifact.body}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-surface-overlay/80">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="border-b border-border-subtle px-3 py-2 font-semibold text-ink"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="odd:bg-white even:bg-surface/40">
                  {row.map((cell, cIdx) => (
                    <td
                      key={`${rIdx}-${cIdx}`}
                      className="border-b border-border-subtle/70 px-3 py-2 tabular-nums text-ink-muted"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    );
  }

  if (artifact.type === "crm_record") {
    return (
      <article className={shell}>
        <header className="border-b border-border-subtle bg-[#eef6f1] px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            {typeLabel(artifact.type)}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{artifact.title}</p>
          {(artifact.from || artifact.timestamp) && (
            <p className="mt-1 text-[11px] text-ink-muted">
              {[artifact.from, artifact.timestamp].filter(Boolean).join(" · ")}
            </p>
          )}
        </header>
        <div className="whitespace-pre-wrap px-4 py-3 font-mono text-[12px] leading-relaxed text-ink">
          {artifact.body}
        </div>
      </article>
    );
  }

  if (artifact.type === "call_notes") {
    return (
      <article className={shell}>
        <header className="border-b border-border-subtle bg-[#f7f0e8] px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            {typeLabel(artifact.type)}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{artifact.title}</p>
          {(artifact.from || artifact.timestamp) && (
            <p className="mt-1 text-[11px] text-ink-muted">
              {[artifact.from && `With ${artifact.from}`, artifact.timestamp]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </header>
        <div className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-ink">
          {artifact.body}
        </div>
      </article>
    );
  }

  // memo / doc
  return (
    <article className={shell}>
      <header className="border-b border-border-subtle bg-surface-overlay/70 px-4 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
          {typeLabel(artifact.type)}
        </p>
        <p className="mt-1 text-sm font-semibold text-ink">{artifact.title}</p>
        {artifact.timestamp && (
          <p className="mt-1 text-[11px] text-ink-muted">{artifact.timestamp}</p>
        )}
      </header>
      <div className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-ink">
        {artifact.body}
      </div>
    </article>
  );
}
