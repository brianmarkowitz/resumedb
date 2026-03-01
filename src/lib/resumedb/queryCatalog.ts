import type { QueryDefinition } from "@/lib/resumedb/types";

export const starterQueryIds = [
  "resume_one_page",
  "skills_matrix",
  "impact_highlights",
  "best_work_reliability",
  "best_work_governance",
] as const;

export const recommendedQueryIds = [
  "resume_one_page",
  "skills_matrix",
  "impact_highlights",
  "best_work_reliability",
] as const;

export const queryCatalog: QueryDefinition[] = [
  {
    id: "resume_one_page",
    simpleLabel: "Profile snapshot",
    simpleHint: "Shows a concise one-page overview of Brian's background and strengths.",
    sqlTemplates: ["SELECT * FROM v_resume_one_page;"],
    matcher: (normalizedSql) =>
      normalizedSql === "select * from v_resume_one_page" ||
      normalizedSql.includes("from v_resume_one_page"),
    resolverKey: "view",
    resolverName: "v_resume_one_page",
  },
  {
    id: "skills_matrix",
    simpleLabel: "Skills matrix",
    simpleHint: "Ranks core skills by proficiency, years of experience, and recency.",
    sqlTemplates: [
      "SELECT skill, level, years, last_used FROM v_skills_matrix ORDER BY level DESC, years DESC;",
    ],
    matcher: (normalizedSql) =>
      normalizedSql.includes("from v_skills_matrix") ||
      (normalizedSql.includes("select") && normalizedSql.includes("skill") && normalizedSql.includes("years")),
    resolverKey: "view",
    resolverName: "v_skills_matrix",
  },
  {
    id: "impact_highlights",
    simpleLabel: "Impact by metrics",
    simpleHint: "Highlights measurable outcomes sorted by metric impact.",
    sqlTemplates: [
      "SELECT * FROM v_impact_highlights WHERE metric_value IS NOT NULL ORDER BY metric_value DESC;",
    ],
    matcher: (normalizedSql) =>
      normalizedSql.includes("from v_impact_highlights") ||
      normalizedSql.includes("metric_value") ||
      normalizedSql.includes("impact_highlights"),
    resolverKey: "view",
    resolverName: "v_impact_highlights",
  },
  {
    id: "experience_timeline",
    simpleLabel: "Experience timeline",
    simpleHint: "Lists roles over time with company, title, dates, and technology stack.",
    sqlTemplates: [
      "SELECT company, title, start_date, end_date, tech_stack FROM v_experience_timeline ORDER BY start_date DESC;",
    ],
    matcher: (normalizedSql) =>
      normalizedSql.includes("from v_experience_timeline") ||
      normalizedSql.includes("experience_timeline"),
    resolverKey: "view",
    resolverName: "v_experience_timeline",
  },
  {
    id: "best_work_reliability",
    simpleLabel: "Best work: reliability",
    simpleHint: "Filters achievements to reliability-focused work and outcomes.",
    sqlTemplates: ["EXEC sp_best_work @theme = 'reliability';"],
    matcher: (normalizedSql, rawSql) => {
      const hasProc = normalizedSql.includes("sp_best_work");
      return hasProc && /theme\s*=\s*'reliability'/i.test(rawSql);
    },
    resolverKey: "procedure",
    resolverName: "sp_best_work",
    args: { theme: "reliability" },
  },
  {
    id: "best_work_governance",
    simpleLabel: "Best work: governance",
    simpleHint: "Filters achievements to governance, standards, and data stewardship outcomes.",
    sqlTemplates: ["EXEC sp_best_work @theme = 'governance';"],
    matcher: (normalizedSql, rawSql) => {
      const hasProc = normalizedSql.includes("sp_best_work");
      return hasProc && /theme\s*=\s*'governance'/i.test(rawSql);
    },
    resolverKey: "procedure",
    resolverName: "sp_best_work",
    args: { theme: "governance" },
  },
];

export function getQueryDefinitionById(queryId: string): QueryDefinition | undefined {
  return queryCatalog.find((query) => query.id === queryId);
}

export function getStarterQueries(): QueryDefinition[] {
  return starterQueryIds
    .map((queryId) => getQueryDefinitionById(queryId))
    .filter((query): query is QueryDefinition => Boolean(query));
}

export function getRecommendedQueries(): QueryDefinition[] {
  return recommendedQueryIds
    .map((queryId) => getQueryDefinitionById(queryId))
    .filter((query): query is QueryDefinition => Boolean(query));
}
