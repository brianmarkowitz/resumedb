import type { SchemaObject } from "@/lib/resumedb/types";

export const schemaObjects: SchemaObject[] = [
  {
    type: "table",
    name: "person",
    description: "One row that defines the profile identity and contact channels.",
    columns: ["full_name", "headline", "location", "linkedin", "email_redacted"],
  },
  {
    type: "table",
    name: "skills",
    description: "Skill dimension with proficiency, years, and evidence.",
    columns: ["skill", "category", "level", "years", "last_used", "evidence"],
  },
  {
    type: "table",
    name: "roles",
    description: "Career roles with company, title, and tenure windows.",
    columns: ["company", "title", "start_date", "end_date", "location", "summary"],
  },
  {
    type: "table",
    name: "projects",
    description: "Key initiatives tied to outcomes and domain context.",
    columns: ["project_name", "client", "domain", "start_year", "end_year", "summary"],
  },
  {
    type: "table",
    name: "achievements",
    description: "Metric-driven impacts with theming for storytelling queries.",
    columns: [
      "impact_title",
      "metric_name",
      "metric_value",
      "metric_display",
      "context",
      "theme_tags",
    ],
  },
  {
    type: "table",
    name: "certifications",
    description: "Professional certifications and credentials.",
    columns: ["name", "issuer", "year"],
  },
  {
    type: "table",
    name: "education",
    description: "Education records and focus area.",
    columns: ["institution", "program", "minor", "year"],
  },
  {
    type: "table",
    name: "tools",
    description: "Platform and tooling references with usage context.",
    columns: ["name", "category", "used_in", "last_used"],
  },
  {
    type: "table",
    name: "domains",
    description: "Industry domains covered across delivery history.",
    columns: ["domain", "years", "highlights"],
  },
  {
    type: "view",
    name: "v_resume_one_page",
    description: "Recruiter-friendly one-page projection of the full profile.",
    columns: ["section", "content", "evidence"],
    examples: ["SELECT * FROM v_resume_one_page;"],
  },
  {
    type: "view",
    name: "v_skills_matrix",
    description: "Skills ranked by proficiency and depth.",
    columns: ["skill", "category", "level", "years", "last_used", "evidence"],
    examples: [
      "SELECT skill, level, years, last_used FROM v_skills_matrix ORDER BY level DESC, years DESC;",
    ],
  },
  {
    type: "view",
    name: "v_impact_highlights",
    description: "Metrics-first accomplishments sorted by measurable impact.",
    columns: ["impact_title", "metric_name", "metric_value", "context", "tech_stack", "year"],
    examples: [
      "SELECT * FROM v_impact_highlights WHERE metric_value IS NOT NULL ORDER BY metric_value DESC;",
    ],
  },
  {
    type: "view",
    name: "v_experience_timeline",
    description: "Chronological role timeline with stack context.",
    columns: ["company", "title", "start_date", "end_date", "tech_stack"],
    examples: [
      "SELECT company, title, start_date, end_date, tech_stack FROM v_experience_timeline ORDER BY start_date DESC;",
    ],
  },
  {
    type: "procedure",
    name: "sp_best_work(@theme)",
    description: "Returns best-fit achievements for themes like reliability or governance.",
    examples: ["EXEC sp_best_work @theme = 'reliability';"],
  },
  {
    type: "function",
    name: "fn_skill_score(@skill)",
    description: "Simulated score function that weights proficiency, recency, and evidence.",
  },
  {
    type: "function",
    name: "fn_years_experience(@skill)",
    description: "Simulated years-of-experience function by skill.",
  },
  {
    type: "function",
    name: "fn_stack_overlap(@job_desc_keywords)",
    description: "Simulated overlap function between role requirements and stack evidence.",
  },
];
