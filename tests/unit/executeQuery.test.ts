import { describe, expect, it } from "vitest";
import { executeQuery, normalizeSql } from "@/lib/resumedb/executeQuery";
import { extractThemeArg } from "@/lib/resumedb/resolvers/procedures";

describe("normalizeSql", () => {
  it("normalizes whitespace and casing", () => {
    const normalized = normalizeSql("  SELECT   *\nFROM v_resume_one_page;  ");
    expect(normalized).toBe("select * from v_resume_one_page");
  });

  it("removes comments", () => {
    const normalized = normalizeSql("SELECT * FROM v_resume_one_page; -- comment");
    expect(normalized).toBe("select * from v_resume_one_page");
  });
});

describe("extractThemeArg", () => {
  it("extracts theme from procedure SQL", () => {
    const theme = extractThemeArg("EXEC sp_best_work @theme = 'reliability';");
    expect(theme).toBe("reliability");
  });
});

describe("executeQuery", () => {
  it("resolves skills matrix view", () => {
    const result = executeQuery(
      "SELECT skill, level, years, last_used FROM v_skills_matrix ORDER BY level DESC, years DESC;",
      "pro",
    );

    expect(result.status).toBe("ok");
    expect(result.queryId).toBe("skills_matrix");
    expect(result.columns).toContain("skill");
    expect(result.rows.length).toBeGreaterThan(1);
  });

  it("executes dynamic stored procedure theme", () => {
    const result = executeQuery("EXEC sp_best_work @theme = 'cost';", "pro");

    expect(result.status).toBe("ok");
    expect(result.queryId).toBe("best_work_cost");
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it("returns guidance for unsupported query", () => {
    const result = executeQuery("SELECT * FROM totally_unknown_view;", "pro");

    expect(result.status).toBe("error");
    expect(result.queryId).toBeNull();
    expect(result.rows.length).toBeGreaterThan(0);
  });
});
