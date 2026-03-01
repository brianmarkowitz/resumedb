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
  const roles = [...data.roles]
    .map((role) => ({
      company: asString(role.company),
      title: asString(role.title),
      start_date: asString(role.start_date),
      end_date: asString(role.end_date),
      summary: asString(role.summary),
    }))
    .sort((a, b) => {
      const aDate = Date.parse(a.start_date);
      const bDate = Date.parse(b.start_date);
      if (Number.isNaN(aDate) || Number.isNaN(bDate)) {
        return 0;
      }
      return bDate - aDate;
    });

  const topSkills = [...data.skills]
    .map((skill) => ({
      skill: asString(skill.skill),
      category: asString(skill.category),
      level: asNumber(skill.level),
      years: asNumber(skill.years),
      last_used: asString(skill.last_used),
      evidence: asString(skill.evidence),
    }))
    .sort((a, b) => b.level - a.level || b.years - a.years || a.skill.localeCompare(b.skill))
    .slice(0, 8);

  const topAchievements = [...data.achievements]
    .map((achievement) => ({
      impact_title: asString(achievement.impact_title),
      metric_display: asString(achievement.metric_display),
      metric_value: asNumber(achievement.metric_value),
      context: asString(achievement.context),
      year: asNumber(achievement.year),
    }))
    .sort((a, b) => b.metric_value - a.metric_value || b.year - a.year)
    .slice(0, 6);

  const topProjects = data.projects
    .slice(0, 5)
    .map((project) => ({
      name: asString(project.project_name),
      domain: asString(project.domain),
      summary: asString(project.summary),
    }));

  const rows: Row[] = [];

  rows.push({
    section: "Profile",
    content: `${asString(person.full_name)} | ${asString(person.headline)} | ${asString(person.location)}`,
    evidence: asString(person.summary),
  });

  roles.forEach((role) => {
    rows.push({
      section: "Experience",
      content: `${role.title} | ${role.company} | ${role.start_date} - ${role.end_date}`,
      evidence: role.summary,
    });
  });

  topSkills.forEach((skill) => {
    rows.push({
      section: "Skill",
      content: `${skill.skill} (${skill.category}) | Level ${skill.level} | ${skill.years} years | Last used ${skill.last_used}`,
      evidence: skill.evidence,
    });
  });

  topAchievements.forEach((achievement) => {
    rows.push({
      section: "Impact",
      content: `${achievement.impact_title} | ${achievement.metric_display} | ${achievement.year}`,
      evidence: achievement.context,
    });
  });

  topProjects.forEach((project) => {
    rows.push({
      section: "Project",
      content: `${project.name} | ${project.domain}`,
      evidence: project.summary,
    });
  });

  data.education.forEach((education) => {
    rows.push({
      section: "Education",
      content: `${asString(education.institution)} | ${asString(education.program)}${asString(education.minor) ? ` (Minor: ${asString(education.minor)})` : ""}`,
      evidence: `${asString(education.year)}`,
    });
  });

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
