import resumeDb from "@/data/resume-db.json";
import type { ResumeDbData, Row } from "@/lib/resumedb/types";

const data = resumeDb as ResumeDbData;

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function resolveView(viewName: string): { columns: string[]; rows: Row[] } {
  switch (viewName) {
    case "v_resume_one_page":
      return resolveResumeOnePage();
    case "v_skills_matrix":
      return resolveSkillsMatrix();
    case "v_impact_highlights":
      return resolveImpactHighlights();
    case "v_experience_timeline":
      return resolveExperienceTimeline();
    default:
      return { columns: [], rows: [] };
  }
}

function resolveResumeOnePage(): { columns: string[]; rows: Row[] } {
  const person = data.person[0] ?? {};
  const latestRole = data.roles.find((role) => asString(role.end_date) === "Present") ?? data.roles[0] ?? {};
  const topProjects = data.projects.slice(0, 3).map((project) => asString(project.project_name));
  const topDomains = data.domains.map((domain) => asString(domain.domain));

  const rows: Row[] = [
    {
      section: "Profile",
      content: `${asString(person.full_name)} | ${asString(person.headline)} | ${asString(person.location)}`,
      evidence: asString(person.summary),
    },
    {
      section: "Current Role",
      content: `${asString(latestRole.title)} at ${asString(latestRole.company)} (${asString(latestRole.start_date)} - ${asString(latestRole.end_date)})`,
      evidence: asString(latestRole.summary),
    },
    {
      section: "Top Initiatives",
      content: topProjects.join(" | "),
      evidence: "Serverless modernization, scientific data collaboration, and AI-assisted data access",
    },
    {
      section: "Domain Coverage",
      content: topDomains.join(" | "),
      evidence: "Healthcare, scientific research, public sector, and finance",
    },
    {
      section: "Leadership",
      content: "Functional manager, chief of staff, mentor for GenAI capability growth",
      evidence: "Manager of the Year (2023) and structured mentorship program delivery",
    },
  ];

  return {
    columns: ["section", "content", "evidence"],
    rows,
  };
}

function resolveSkillsMatrix(): { columns: string[]; rows: Row[] } {
  const rows = [...data.skills]
    .map((skill) => ({
      skill: asString(skill.skill),
      category: asString(skill.category),
      level: asNumber(skill.level),
      years: asNumber(skill.years),
      last_used: asString(skill.last_used),
      evidence: asString(skill.evidence),
    }))
    .sort((a, b) => b.level - a.level || b.years - a.years || a.skill.localeCompare(b.skill));

  return {
    columns: ["skill", "category", "level", "years", "last_used", "evidence"],
    rows,
  };
}

function resolveImpactHighlights(): { columns: string[]; rows: Row[] } {
  const rows = [...data.achievements]
    .map((achievement) => ({
      impact_title: asString(achievement.impact_title),
      metric_name: asString(achievement.metric_name),
      metric_value: asNumber(achievement.metric_value),
      metric_display: asString(achievement.metric_display),
      context: asString(achievement.context),
      tech_stack: Array.isArray(achievement.tech_stack)
        ? (achievement.tech_stack as string[]).join(", ")
        : "",
      year: asNumber(achievement.year),
      theme_tags: Array.isArray(achievement.theme_tags)
        ? (achievement.theme_tags as string[]).join(", ")
        : "",
    }))
    .filter((row) => row.metric_value > 0)
    .sort((a, b) => b.metric_value - a.metric_value || b.year - a.year);

  return {
    columns: [
      "impact_title",
      "metric_name",
      "metric_value",
      "metric_display",
      "context",
      "tech_stack",
      "year",
      "theme_tags",
    ],
    rows,
  };
}

function resolveExperienceTimeline(): { columns: string[]; rows: Row[] } {
  const rows = [...data.roles]
    .map((role) => ({
      company: asString(role.company),
      title: asString(role.title),
      start_date: asString(role.start_date),
      end_date: asString(role.end_date),
      tech_stack: Array.isArray(role.tech_stack) ? (role.tech_stack as string[]).join(", ") : "",
      summary: asString(role.summary),
    }))
    .sort((a, b) => {
      const aDate = Date.parse(a.start_date);
      const bDate = Date.parse(b.start_date);
      return Number.isNaN(bDate) || Number.isNaN(aDate) ? 0 : bDate - aDate;
    });

  return {
    columns: ["company", "title", "start_date", "end_date", "tech_stack", "summary"],
    rows,
  };
}
