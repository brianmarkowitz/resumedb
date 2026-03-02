"use client";

import resumeDb from "@/data/resume-db.json";
import type { ResumeDbData, Row } from "@/lib/resumedb/types";

const data = resumeDb as ResumeDbData;

export type ResumeShortcutId =
  | "resume_one_page"
  | "skills_matrix"
  | "impact_highlights"
  | "experience_timeline"
  | "best_work_reliability";

type StandardResumeProps = {
  onOpenSqlExplorer?: (shortcutId?: ResumeShortcutId) => void;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function formatDate(value: string): string {
  if (!value || value === "Present") {
    return value || "Present";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function groupSkillsByCategory(skills: Row[]): Record<string, string[]> {
  return skills.reduce<Record<string, string[]>>((accumulator, skill) => {
    const category = asString(skill.category) || "Other";
    if (!accumulator[category]) {
      accumulator[category] = [];
    }
    accumulator[category].push(asString(skill.skill));
    return accumulator;
  }, {});
}

function asArrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item)).filter(Boolean);
}

function safeYear(value: number): number {
  return Number.isFinite(value) ? value : new Date().getFullYear();
}

export function StandardResume({ onOpenSqlExplorer }: StandardResumeProps) {
  const person = data.person[0] ?? {};
  const currentYear = new Date().getFullYear();

  const roles = [...data.roles]
    .map((role) => ({
      company: asString(role.company),
      title: asString(role.title),
      start_date: asString(role.start_date),
      end_date: asString(role.end_date),
      summary: asString(role.summary),
      location: asString(role.location),
      tech_stack: asArrayOfStrings(role.tech_stack),
    }))
    .sort((a, b) => {
      const aDate = Date.parse(a.start_date);
      const bDate = Date.parse(b.start_date);
      if (Number.isNaN(aDate) || Number.isNaN(bDate)) {
        return 0;
      }
      return bDate - aDate;
    });

  const topAchievements = [...data.achievements]
    .map((achievement) => ({
      impact_title: asString(achievement.impact_title),
      metric_display: asString(achievement.metric_display),
      context: asString(achievement.context),
      metric_value: asNumber(achievement.metric_value),
    }))
    .sort((a, b) => b.metric_value - a.metric_value)
    .slice(0, 6);

  const projects = [...data.projects]
    .map((project) => ({
      name: asString(project.project_name),
      summary: asString(project.summary),
      domain: asString(project.domain),
      client: asString(project.client),
      start_year: safeYear(asNumber(project.start_year)),
      end_year: safeYear(asNumber(project.end_year)),
      theme_tags: asArrayOfStrings(project.theme_tags),
    }))
    .sort((a, b) => b.end_year - a.end_year)
    .slice(0, 5);

  const skillsByCategory = groupSkillsByCategory(data.skills);
  const earliestRoleYear = roles
    .map((role) => new Date(role.start_date).getFullYear())
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => a - b)[0];
  const totalYears = earliestRoleYear ? Math.max(currentYear - earliestRoleYear, 1) : 25;
  const leadershipRoles = roles.filter((role) =>
    /manager|chief|lead|principal/i.test(`${role.title} ${role.summary}`),
  ).length;
  const domains = [...data.domains]
    .map((entry) => ({
      domain: asString(entry.domain),
      years: asNumber(entry.years),
      highlights: asString(entry.highlights),
    }))
    .sort((a, b) => b.years - a.years);

  return (
    <section className="wb-resume-shell" aria-label="Standard resume view">
      <article className="wb-resume-document">
        <header className="wb-resume-header">
          <div className="wb-resume-header-top">
            <div>
              <h2>{asString(person.full_name)}</h2>
              <p>{asString(person.headline)}</p>
              <p>{`${asString(person.location)} • ${asString(person.email_redacted)} • ${asString(person.linkedin)}`}</p>
            </div>
            <div className="wb-resume-actions">
              <button type="button" onClick={() => onOpenSqlExplorer?.()}>
                Explore with SQL
              </button>
              <button type="button" onClick={() => onOpenSqlExplorer?.("resume_one_page")}>
                Run Profile Query
              </button>
            </div>
          </div>
          <div className="wb-resume-kpis" aria-label="Resume highlights">
            <div className="wb-resume-kpi">
              <span>{`${totalYears}+`}</span>
              <small>Years in data architecture</small>
            </div>
            <div className="wb-resume-kpi">
              <span>{roles.length}</span>
              <small>Leadership and architect roles</small>
            </div>
            <div className="wb-resume-kpi">
              <span>{topAchievements.length}</span>
              <small>Measurable impact highlights</small>
            </div>
            <div className="wb-resume-kpi">
              <span>{domains.length}</span>
              <small>Industry domains delivered</small>
            </div>
          </div>
        </header>

        <section className="wb-resume-section wb-resume-section--summary">
          <h3>Professional Summary</h3>
          <p>{asString(person.summary)}</p>
          <div className="wb-resume-domain-row">
            {domains.map((domain) => (
              <span key={domain.domain} className="wb-resume-domain-pill">
                {domain.domain}
              </span>
            ))}
          </div>
        </section>

        <section className="wb-resume-section">
          <div className="wb-resume-section-header">
            <h3>Experience</h3>
            <button type="button" onClick={() => onOpenSqlExplorer?.("experience_timeline")}>
              Open Timeline Query in SQL
            </button>
          </div>
          <div className="wb-resume-list">
            {roles.map((role) => (
              <div key={`${role.company}-${role.title}-${role.start_date}`} className="wb-resume-item">
                <div className="wb-resume-item-title">
                  <strong>{role.title}</strong>
                  <span>{role.company}</span>
                </div>
                <div className="wb-resume-item-meta">
                  {formatDate(role.start_date)} - {formatDate(role.end_date)}
                  {role.location ? ` • ${role.location}` : ""}
                </div>
                <p>{role.summary}</p>
                {role.tech_stack.length ? (
                  <div className="wb-resume-tag-list">
                    {role.tech_stack.map((item) => (
                      <span key={`${role.company}-${role.title}-${item}`} className="wb-resume-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="wb-resume-section">
          <div className="wb-resume-section-header">
            <h3>Core Skills</h3>
            <button type="button" onClick={() => onOpenSqlExplorer?.("skills_matrix")}>
              Open Skills Matrix in SQL
            </button>
          </div>
          <div className="wb-resume-skills-grid">
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category} className="wb-resume-skills-group">
                <h4>{category}</h4>
                <p>{skills.join(", ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="wb-resume-section">
          <div className="wb-resume-section-header">
            <h3>Impact Metrics</h3>
            <button type="button" onClick={() => onOpenSqlExplorer?.("impact_highlights")}>
              Open Impact Query in SQL
            </button>
          </div>
          <div className="wb-resume-list">
            {topAchievements.map((achievement) => (
              <div key={`${achievement.impact_title}-${achievement.metric_display}`} className="wb-resume-item">
                <div className="wb-resume-item-title">
                  <strong>{achievement.metric_display}</strong>
                  <span>{achievement.impact_title}</span>
                </div>
                <p>{achievement.context}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="wb-resume-section">
          <div className="wb-resume-section-header">
            <h3>Projects</h3>
            <button type="button" onClick={() => onOpenSqlExplorer?.("best_work_reliability")}>
              Open Reliability Lens in SQL
            </button>
          </div>
          <div className="wb-resume-list">
            {projects.map((project) => (
              <div key={project.name} className="wb-resume-item">
                <div className="wb-resume-item-title">
                  <strong>{project.name}</strong>
                  <span>{`${project.start_year} - ${project.end_year}`}</span>
                </div>
                <div className="wb-resume-item-meta">{`${project.client} • ${project.domain}`}</div>
                <p>{project.summary}</p>
                {project.theme_tags.length ? (
                  <div className="wb-resume-tag-list">
                    {project.theme_tags.map((tag) => (
                      <span key={`${project.name}-${tag}`} className="wb-resume-tag wb-resume-tag--theme">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="wb-resume-section">
          <h3>Leadership and Domain Depth</h3>
          <div className="wb-resume-list">
            <div className="wb-resume-item">
              <div className="wb-resume-item-title">
                <strong>Leadership Focus</strong>
                <span>{`${leadershipRoles} leadership-heavy roles`}</span>
              </div>
              <p>
                Built and led teams while delivering architecture outcomes across healthcare, scientific, and
                government portfolios.
              </p>
            </div>
            {domains.map((domain) => (
              <div key={`${domain.domain}-${domain.years}`} className="wb-resume-item">
                <div className="wb-resume-item-title">
                  <strong>{domain.domain}</strong>
                  <span>{`${domain.years}+ years`}</span>
                </div>
                <p>{domain.highlights}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="wb-resume-section">
          <h3>Education</h3>
          <div className="wb-resume-list">
            {data.education.map((education) => (
              <div key={`${asString(education.institution)}-${asString(education.program)}`} className="wb-resume-item">
                <div className="wb-resume-item-title">
                  <strong>{asString(education.institution)}</strong>
                  <span>{asString(education.year)}</span>
                </div>
                <p>{`${asString(education.program)}${asString(education.minor) ? ` (Minor: ${asString(education.minor)})` : ""}`}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </section>
  );
}
