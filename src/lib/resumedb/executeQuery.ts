import explainMap from "@/data/query-explain.json";
import {
  getStarterQueries,
  queryCatalog,
} from "@/lib/resumedb/queryCatalog";
import { extractThemeArg, procedureThemes, resolveProcedure } from "@/lib/resumedb/resolvers/procedures";
import { resolveView } from "@/lib/resumedb/resolvers/views";
import type {
  QueryDefinition,
  QueryExecutionResult,
  QueryMode,
} from "@/lib/resumedb/types";

const explainById = explainMap as Record<string, string[]>;

export function normalizeSql(input: string): string {
  return input
    .replace(/--.*$/gm, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/;+$/, "")
    .toLowerCase();
}

function matchCatalogQuery(rawSql: string, normalizedSql: string): QueryDefinition | undefined {
  const simpleLabelMatch = queryCatalog.find(
    (query) => query.simpleLabel.toLowerCase() === normalizedSql,
  );

  if (simpleLabelMatch) {
    return simpleLabelMatch;
  }

  return queryCatalog.find((query) => query.matcher(normalizedSql, rawSql));
}

function buildUnsupportedResult(normalizedSql: string): QueryExecutionResult {
  const suggestedQueries = getStarterQueries().map((query) => query.sqlTemplates[0]);

  return {
    status: "error",
    queryId: null,
    normalizedSql,
    columns: ["hint"],
    rows: suggestedQueries.map((query) => ({ hint: query })),
    messages: [
      "Unsupported query. ResumeDB supports curated views and procedure calls.",
      "Try one of the starter queries from the right panel.",
    ],
    explainPlan: [
      "Parser: scanned for known view/procedure signatures",
      "Result: no deterministic match found",
      "Action: surfaced nearest supported queries",
    ],
  };
}

function getExplainPlan(queryId: string): string[] {
  return explainById[queryId] ?? explainById.sp_best_work ?? ["Statement compiled", "Plan unavailable"];
}

function parseProcedureQuery(rawSql: string, normalizedSql: string): {
  queryId: string;
  theme: string;
} | null {
  if (!normalizedSql.includes("sp_best_work")) {
    return null;
  }

  const theme = extractThemeArg(rawSql) ?? "";
  if (!theme) {
    return { queryId: "sp_best_work", theme: "" };
  }

  const knownTheme = procedureThemes.find((supportedTheme) => supportedTheme === theme);
  if (!knownTheme) {
    return { queryId: "sp_best_work", theme };
  }

  return {
    queryId: `best_work_${knownTheme}`,
    theme: knownTheme,
  };
}

export function executeQuery(input: string, mode: QueryMode): QueryExecutionResult {
  const normalizedSql = normalizeSql(input);
  const modeHint =
    mode === "simple"
      ? "Use the quick actions panel if you prefer guided labels."
      : "Use one of the supported SQL templates from the quick actions panel.";

  if (!normalizedSql) {
    return {
      status: "error",
      queryId: null,
      normalizedSql,
      columns: ["hint"],
      rows: [{ hint: "Type a SQL query or use a starter query button." }],
      messages: ["No SQL detected.", modeHint],
      explainPlan: ["Parser received empty statement"],
    };
  }

  const matched = matchCatalogQuery(input, normalizedSql);

  if (matched?.resolverKey === "view") {
    const { columns, rows } = resolveView(matched.resolverName);
    return {
      status: "ok",
      queryId: matched.id,
      normalizedSql,
      columns,
      rows,
      messages: [`View resolved: ${matched.resolverName}`, `Returned ${rows.length} row(s).`],
      explainPlan: getExplainPlan(matched.id),
    };
  }

  if (matched?.resolverKey === "procedure") {
    const procedureArgs = matched.args ?? {};
    const { columns, rows, messages } = resolveProcedure(matched.resolverName, procedureArgs);
    return {
      status: "ok",
      queryId: matched.id,
      normalizedSql,
      columns,
      rows,
      messages,
      explainPlan: getExplainPlan(matched.id),
    };
  }

  const dynamicProcedure = parseProcedureQuery(input, normalizedSql);
  if (dynamicProcedure) {
    const { columns, rows, messages } = resolveProcedure("sp_best_work", {
      theme: dynamicProcedure.theme,
    });
    const validTheme =
      Boolean(dynamicProcedure.theme) &&
      procedureThemes.includes(dynamicProcedure.theme as (typeof procedureThemes)[number]);

    return {
      status: validTheme ? "ok" : "error",
      queryId: dynamicProcedure.queryId,
      normalizedSql,
      columns,
      rows,
      messages,
      explainPlan: getExplainPlan(dynamicProcedure.queryId),
    };
  }

  const unsupportedResult = buildUnsupportedResult(normalizedSql);
  return {
    ...unsupportedResult,
    messages: [...unsupportedResult.messages, modeHint],
  };
}
