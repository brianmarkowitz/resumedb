import resumeDb from "@/data/resume-db.json";
import type { ResumeDbData, Row } from "@/lib/resumedb/types";

const data = resumeDb as ResumeDbData;

const supportedThemes = ["scale", "reliability", "governance", "cost", "ai"] as const;
type SupportedTheme = (typeof supportedThemes)[number];

function toLowerString(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function includesTheme(rawTags: unknown, theme: SupportedTheme): boolean {
  if (!Array.isArray(rawTags)) {
    return false;
  }

  return rawTags.some((tag) => toLowerString(tag) === theme);
}

function buildRationale(theme: SupportedTheme, metricDisplay: string): string {
  switch (theme) {
    case "reliability":
      return `Reliability signal: ${metricDisplay} backed by auditable, repeatable workflows.`;
    case "scale":
      return `Scale signal: ${metricDisplay} demonstrates large-volume operational handling.`;
    case "governance":
      return `Governance signal: ${metricDisplay} aligned with traceability and standards.`;
    case "cost":
      return `Cost signal: ${metricDisplay} connected to legacy decommissioning and simplification.`;
    case "ai":
      return `AI signal: ${metricDisplay} demonstrates practical GenAI delivery.`;
    default:
      return "Theme signal extracted from experience data.";
  }
}

export function extractThemeArg(rawSql: string): string | undefined {
  const themeMatch = rawSql.match(/@theme\s*=\s*'([a-zA-Z_]+)'/i);
  return themeMatch?.[1]?.toLowerCase();
}

export function resolveProcedure(
  procName: string,
  args: Record<string, string> = {},
): { columns: string[]; rows: Row[]; messages: string[] } {
  if (procName !== "sp_best_work") {
    return {
      columns: [],
      rows: [],
      messages: ["Procedure not found."],
    };
  }

  const theme = (args.theme ?? "").toLowerCase();

  if (!supportedThemes.includes(theme as SupportedTheme)) {
    return {
      columns: ["error", "supported_themes"],
      rows: [
        {
          error: `Unsupported theme '${theme || "<missing>"}'.`,
          supported_themes: supportedThemes.join(", "),
        },
      ],
      messages: [
        "Procedure executed with validation warning.",
        `Allowed themes: ${supportedThemes.join(", ")}.`,
      ],
    };
  }

  const safeTheme = theme as SupportedTheme;

  const rows = data.achievements
    .filter((achievement) => includesTheme(achievement.theme_tags, safeTheme))
    .map((achievement) => {
      const metricValue = asNumber(achievement.metric_value);
      const year = asNumber(achievement.year);
      const recencyScore = Math.max(0, year - 2020);

      return {
        theme: safeTheme,
        impact_title: asString(achievement.impact_title),
        year,
        metric_name: asString(achievement.metric_name),
        metric_value: metricValue,
        metric_display: asString(achievement.metric_display),
        tech_stack: Array.isArray(achievement.tech_stack)
          ? (achievement.tech_stack as string[]).join(", ")
          : "",
        rationale: buildRationale(safeTheme, asString(achievement.metric_display)),
        score: metricValue + recencyScore,
      };
    })
    .sort((a, b) => b.score - a.score || b.year - a.year)
    .slice(0, 6);

  return {
    columns: [
      "theme",
      "impact_title",
      "year",
      "metric_name",
      "metric_value",
      "metric_display",
      "tech_stack",
      "rationale",
      "score",
    ],
    rows,
    messages: [`Stored procedure executed: sp_best_work('${safeTheme}') returned ${rows.length} rows.`],
  };
}

export const procedureThemes = supportedThemes;
