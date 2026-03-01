"use client";

import resumeDb from "@/data/resume-db.json";
import type { ResumeDbData, Row } from "@/lib/resumedb/types";

const data = resumeDb as ResumeDbData;

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

export function StandardResume() {
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
    }))
    .slice(0, 5);

  const skillsByCategory = groupSkillsByCategory(data.skills);

  return (
    <section className="wb-resume-shell" aria-label="Standard resume view">
      <article className="wb-resume-document">
        <header className="wb-resume-header">
          <h2>{asString(person.full_name)}</h2>
          <p>{asString(person.headline)}</p>
          <p>{`${asString(person.location)} • ${asString(person.email_redacted)} • ${asString(person.linkedin)}`}</p>
        </header>

        <section className="wb-resume-section">
          <h3>Professional Summary</h3>
          <p>{asString(person.summary)}</p>
        </section>

        <section className="wb-resume-section">
          <h3>Experience</h3>
          <div className="wb-resume-list">
            {roles.map((role) => (
              <div key={`${role.company}-${role.title}-${role.start_date}`} className="wb-resume-item">
                <div className="wb-resume-item-title">
                  <strong>{role.title}</strong>
                  <span>{role.company}</span>
                </div>
                <div className="wb-resume-item-meta">
                  {formatDate(role.start_date)} - {formatDate(role.end_date)}
                </div>
                <p>{role.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="wb-resume-section">
          <h3>Selected Impact</h3>
          <div className="wb-resume-list">
            {topAchievements.map((achievement) => (
              <div key={achievement.impact_title} className="wb-resume-item">
                <div className="wb-resume-item-title">
                  <strong>{achievement.impact_title}</strong>
                  <span>{achievement.metric_display}</span>
                </div>
                <p>{achievement.context}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="wb-resume-section">
          <h3>Core Skills</h3>
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
          <h3>Projects</h3>
          <div className="wb-resume-list">
            {projects.map((project) => (
              <div key={project.name} className="wb-resume-item">
                <div className="wb-resume-item-title">
                  <strong>{project.name}</strong>
                  <span>{project.domain}</span>
                </div>
                <p>{project.summary}</p>
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
