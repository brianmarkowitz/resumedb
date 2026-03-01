"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SchemaBrowser } from "@/components/workbench/SchemaBrowser";
import { SqlEditorTabs } from "@/components/workbench/SqlEditorTabs";
import type { QueryTab } from "@/components/workbench/workbenchTypes";
import { executeQuery, normalizeSql } from "@/lib/resumedb/executeQuery";
import { getRecommendedQueries, getStarterQueries } from "@/lib/resumedb/queryCatalog";
import { schemaObjects } from "@/lib/resumedb/schema";
import type { QueryMode, SavedQuery } from "@/lib/resumedb/types";

function makeTabId(): string {
  return `tab_${Math.random().toString(36).slice(2, 10)}`;
}

function makeSavedQueryId(): string {
  return `saved_${Math.random().toString(36).slice(2, 10)}`;
}

function makeQueryTitle(index: number): string {
  return `biospec_organism_pivot ${index === 1 ? "" : `(${index})`}`.trim();
}

function makeSavedQueryLabel(sql: string, index: number): string {
  const singleLineSql = sql.replace(/\s+/g, " ").trim();
  if (!singleLineSql) {
    return `Saved Query ${index}`;
  }

  return singleLineSql.length > 50 ? `${singleLineSql.slice(0, 50)}...` : singleLineSql;
}

const savedQueryStorageKey = "resumedb_custom_saved_queries_v1";
const defaultMode: QueryMode = "pro";

const presetSql = {
  onePage: "SELECT * FROM v_resume_one_page;",
  skills: "SELECT skill, level, years, last_used FROM v_skills_matrix ORDER BY level DESC, years DESC;",
  impact: "SELECT * FROM v_impact_highlights WHERE metric_value IS NOT NULL ORDER BY metric_value DESC;",
  timeline: "SELECT company, title, start_date, end_date, tech_stack FROM v_experience_timeline ORDER BY start_date DESC;",
  reliability: "EXEC sp_best_work @theme = 'reliability';",
  governance: "EXEC sp_best_work @theme = 'governance';",
} as const;

type PresetKey = keyof typeof presetSql;
type NavigatorTab = "administration" | "schemas";

export function Workbench() {
  const starterQueries = useMemo(() => getStarterQueries(), []);
  const recommendedQueries = useMemo(() => getRecommendedQueries(), []);

  const initialSql = starterQueries[0]?.sqlTemplates[0] ?? presetSql.onePage;
  const defaultSavedQueries = useMemo<SavedQuery[]>(
    () =>
      starterQueries.map((query) => ({
        id: query.id,
        label: query.simpleLabel,
        sql: query.sqlTemplates[0] ?? "",
      })),
    [starterQueries],
  );
  const defaultSavedQueryIds = useMemo(
    () => new Set(defaultSavedQueries.map((query) => query.id)),
    [defaultSavedQueries],
  );

  const [schemaSearch, setSchemaSearch] = useState("");
  const [navigatorTab, setNavigatorTab] = useState<NavigatorTab>("schemas");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [denseMode, setDenseMode] = useState(false);
  const [statusNote, setStatusNote] = useState("Ready");
  const [tabs, setTabs] = useState<QueryTab[]>([
    {
      id: makeTabId(),
      title: makeQueryTitle(1),
      sql: initialSql,
      status: "idle",
      result: null,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id ?? "");
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(() => {
    if (typeof window === "undefined") {
      return defaultSavedQueries;
    }

    const rawSavedQueries = window.localStorage.getItem(savedQueryStorageKey);
    if (!rawSavedQueries) {
      return defaultSavedQueries;
    }

    try {
      const parsed = JSON.parse(rawSavedQueries);
      if (!Array.isArray(parsed)) {
        return defaultSavedQueries;
      }

      const customSavedQueries = parsed.filter(
        (item): item is SavedQuery =>
          typeof item?.id === "string" &&
          typeof item?.label === "string" &&
          typeof item?.sql === "string" &&
          item.sql.trim().length > 0,
      );

      return [...defaultSavedQueries, ...customSavedQueries];
    } catch {
      window.localStorage.removeItem(savedQueryStorageKey);
      return defaultSavedQueries;
    }
  });

  useEffect(() => {
    const customSavedQueries = savedQueries.filter((query) => !defaultSavedQueryIds.has(query.id));
    window.localStorage.setItem(savedQueryStorageKey, JSON.stringify(customSavedQueries));
  }, [defaultSavedQueryIds, savedQueries]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;

  const openPresetInNewTab = useCallback(
    (preset: PresetKey, notice: string) => {
      const sql = presetSql[preset];
      const result = executeQuery(sql, defaultMode);
      const newTabId = makeTabId();

      setTabs((previous) => [
        ...previous,
        {
          id: newTabId,
          title: makeQueryTitle(previous.length + 1),
          sql,
          status: result.status,
          result,
        },
      ]);

      setActiveTabId(newTabId);
      setStatusNote(notice);
    },
    [],
  );

  const runActiveTab = useCallback(() => {
    const tab = tabs.find((item) => item.id === activeTabId);
    if (!tab) {
      return;
    }

    const result = executeQuery(tab.sql, defaultMode);

    setTabs((previous) =>
      previous.map((item) =>
        item.id === activeTabId
          ? {
              ...item,
              status: result.status,
              result,
            }
          : item,
      ),
    );

    setStatusNote("Executed active query");
  }, [activeTabId, tabs]);

  const handleAddTab = useCallback(() => {
    const newTabId = makeTabId();
    setTabs((previous) => [
      ...previous,
      {
        id: newTabId,
        title: makeQueryTitle(previous.length + 1),
        sql: presetSql.onePage,
        status: "idle",
        result: null,
      },
    ]);
    setActiveTabId(newTabId);
    setStatusNote("Opened a new SQL tab");
  }, []);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      if (tabs.length === 1) {
        return;
      }

      const targetIndex = tabs.findIndex((tab) => tab.id === tabId);
      const fallbackTab = tabs[targetIndex - 1] ?? tabs[targetIndex + 1] ?? tabs[0];

      setTabs((previous) => previous.filter((tab) => tab.id !== tabId));
      if (tabId === activeTabId && fallbackTab) {
        setActiveTabId(fallbackTab.id);
      }
      setStatusNote("Closed a query tab");
    },
    [activeTabId, tabs],
  );

  const handleSqlChange = useCallback((tabId: string, sql: string) => {
    setTabs((previous) =>
      previous.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              sql,
              status: "idle",
            }
          : tab,
      ),
    );
  }, []);

  const runSavedQuery = useCallback(
    (savedQueryId: string) => {
      const savedQuery = savedQueries.find((query) => query.id === savedQueryId);
      if (!savedQuery) {
        return;
      }

      const result = executeQuery(savedQuery.sql, defaultMode);
      const newTabId = makeTabId();

      setTabs((previous) => [
        ...previous,
        {
          id: newTabId,
          title: makeQueryTitle(previous.length + 1),
          sql: savedQuery.sql,
          status: result.status,
          result,
        },
      ]);
      setActiveTabId(newTabId);
      setStatusNote(`Loaded saved query: ${savedQuery.label}`);
    },
    [savedQueries],
  );

  const handleSaveCurrentQuery = useCallback(() => {
    if (!activeTab) {
      return;
    }

    const trimmedSql = activeTab.sql.trim();
    if (!trimmedSql) {
      setStatusNote("Nothing to save from current tab");
      return;
    }

    let saved = false;

    setSavedQueries((previous) => {
      const duplicate = previous.some((query) => normalizeSql(query.sql) === normalizeSql(trimmedSql));
      if (duplicate) {
        return previous;
      }

      saved = true;
      return [
        ...previous,
        {
          id: makeSavedQueryId(),
          label: makeSavedQueryLabel(trimmedSql, previous.length + 1),
          sql: trimmedSql,
        },
      ];
    });

    setStatusNote(saved ? "Saved current query" : "Query already exists in saved list");
  }, [activeTab]);

  const handleRunRecommended = useCallback(() => {
    const newTabs: QueryTab[] = [];

    recommendedQueries.forEach((query, index) => {
      const sql = query.sqlTemplates[0] ?? "";
      const result = executeQuery(sql, defaultMode);
      const tab: QueryTab = {
        id: makeTabId(),
        title: makeQueryTitle(tabs.length + index + 1),
        sql,
        status: result.status,
        result,
      };

      newTabs.push(tab);
    });

    if (newTabs.length) {
      setTabs((previous) => [...previous, ...newTabs]);
      setActiveTabId(newTabs[newTabs.length - 1].id);
      setStatusNote("Ran recommended resume storyline queries");
    }
  }, [recommendedQueries, tabs.length]);

  const handleLoadFirstSaved = useCallback(() => {
    const firstSaved = savedQueries[0];
    if (!firstSaved) {
      setStatusNote("No saved queries are available yet");
      return;
    }

    runSavedQuery(firstSaved.id);
  }, [runSavedQuery, savedQueries]);

  const handleInsertNarrativeTemplate = useCallback(() => {
    const template = [
      "-- Resume narrative template",
      "-- Focus: architecture, measurable impact, and leadership",
      presetSql.onePage,
    ].join("\n");

    setTabs((previous) =>
      previous.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              sql: template,
              status: "idle",
              result: null,
            }
          : tab,
      ),
    );

    setStatusNote("Inserted resume narrative template into active tab");
  }, [activeTabId]);

  const handleInsertTimelineQuery = useCallback(() => {
    setTabs((previous) =>
      previous.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              sql: presetSql.timeline,
              status: "idle",
              result: null,
            }
          : tab,
      ),
    );

    setStatusNote("Loaded experience timeline query into active tab");
  }, [activeTabId]);

  const handleClearActiveQuery = useCallback(() => {
    setTabs((previous) =>
      previous.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              sql: "",
              status: "idle",
              result: null,
            }
          : tab,
      ),
    );

    setStatusNote("Cleared active query editor");
  }, [activeTabId]);

  const handleHome = useCallback(() => {
    const baseTabId = makeTabId();
    setNavigatorTab("schemas");
    setSidebarCollapsed(false);
    setDenseMode(false);
    setSchemaSearch("");
    setTabs([
      {
        id: baseTabId,
        title: makeQueryTitle(1),
        sql: presetSql.onePage,
        status: "idle",
        result: null,
      },
    ]);
    setActiveTabId(baseTabId);
    setStatusNote("Returned to home resume workspace");
  }, []);

  const handleRunAdminAction = useCallback(
    (preset: PresetKey) => {
      openPresetInNewTab(preset, `Ran ${preset} narrative query from administration panel`);
    },
    [openPresetInNewTab],
  );

  const executionSummary = activeTab?.result
    ? activeTab.result.status === "ok"
      ? `${activeTab.result.rows.length} row(s) returned`
      : activeTab.result.messages[0] ?? "Query failed"
    : "No execution yet";

  const executionMessage = `${statusNote} | ${executionSummary}`;

  const windowClassName = `wb-window${denseMode ? " wb-window--dense" : ""}`;
  const workAreaClassName = `wb-work-area${sidebarCollapsed ? " wb-work-area--sidebar-collapsed" : ""}`;

  return (
    <main className="wb-page">
      <div className={windowClassName}>
        <header className="wb-titlebar">
          <div className="wb-traffic-lights" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <h1>Brian Workbench</h1>
          <div />
        </header>

        <div className="wb-connection-strip" role="presentation">
          <button type="button" className="wb-home-btn" aria-label="Home" onClick={handleHome}>
            <span className="wb-glyph wb-glyph--home" />
          </button>
          <div className="wb-connection-tab">biospec(local-bmarko) - Warning - not supported</div>
          <div className="wb-window-icons">
            <button
              type="button"
              className="wb-chrome-btn"
              aria-label="Run governance lens"
              onClick={() => openPresetInNewTab("governance", "Opened governance leadership lens")}
              title="Run governance lens"
            >
              <span className="wb-glyph wb-glyph--gear" />
            </button>
            <button
              type="button"
              className="wb-chrome-btn"
              aria-label="Toggle schema sidebar"
              onClick={() => {
                setSidebarCollapsed((previous) => !previous);
                setStatusNote("Toggled schema sidebar visibility");
              }}
              title="Toggle schema sidebar"
            >
              <span className="wb-glyph wb-glyph--rect" />
            </button>
            <button
              type="button"
              className="wb-chrome-btn"
              aria-label="Toggle compact density"
              onClick={() => {
                setDenseMode((previous) => !previous);
                setStatusNote("Toggled compact workbench density");
              }}
              title="Toggle compact density"
            >
              <span className="wb-glyph wb-glyph--mini" />
            </button>
            <button
              type="button"
              className="wb-chrome-btn"
              aria-label="Run recommended storyline"
              onClick={handleRunRecommended}
              title="Run recommended storyline"
            >
              <span className="wb-glyph wb-glyph--max" />
            </button>
          </div>
        </div>

        <div className="wb-main-toolbar">
          <div className="wb-icon-row">
            <button type="button" className="wb-tool wb-tool--folder" onClick={handleLoadFirstSaved} title="Open first saved query" aria-label="Open first saved query" />
            <button type="button" className="wb-tool wb-tool--script" onClick={handleInsertNarrativeTemplate} title="Insert resume narrative template" aria-label="Insert resume narrative template" />
            <button type="button" className="wb-tool wb-tool--save" onClick={handleSaveCurrentQuery} title="Save current query" aria-label="Save current query" />
            <button type="button" className="wb-tool wb-tool--db" onClick={() => openPresetInNewTab("onePage", "Opened one-page resume view")} title="Run one-page resume view" aria-label="Run one-page resume view" />
            <button type="button" className="wb-tool wb-tool--lock" onClick={() => openPresetInNewTab("governance", "Opened governance highlights view")} title="Run governance highlights" aria-label="Run governance highlights" />
            <button type="button" className="wb-tool wb-tool--search" onClick={() => {
              setNavigatorTab("schemas");
              setSchemaSearch("skill");
              setStatusNote("Filtered schema objects to skills");
            }} title="Filter schema to skills" aria-label="Filter schema to skills" />
          </div>
          <div className="wb-icon-row">
            <button type="button" className="wb-tool wb-tool--chart" onClick={() => openPresetInNewTab("impact", "Opened impact metrics dashboard query")} title="Run impact highlights" aria-label="Run impact highlights" />
            <button type="button" className="wb-tool wb-tool--gauge" onClick={() => openPresetInNewTab("skills", "Opened skills matrix query")} title="Run skills matrix" aria-label="Run skills matrix" />
          </div>
        </div>

        <div className={workAreaClassName}>
          <aside className="wb-sidebar">
            <div className="wb-sidebar-tabs" role="tablist" aria-label="Navigator tabs">
              <button
                type="button"
                role="tab"
                className={`wb-side-tab${navigatorTab === "administration" ? " wb-side-tab--active" : ""}`}
                aria-selected={navigatorTab === "administration"}
                onClick={() => {
                  setNavigatorTab("administration");
                  setStatusNote("Switched to administration navigator");
                }}
              >
                Administration
              </button>
              <button
                type="button"
                role="tab"
                className={`wb-side-tab${navigatorTab === "schemas" ? " wb-side-tab--active" : ""}`}
                aria-selected={navigatorTab === "schemas"}
                onClick={() => {
                  setNavigatorTab("schemas");
                  setStatusNote("Switched to schema navigator");
                }}
              >
                Schemas
              </button>
            </div>

            <SchemaBrowser
              objects={schemaObjects}
              search={schemaSearch}
              panelMode={navigatorTab}
              onSearchChange={setSchemaSearch}
              onRunPreset={handleRunAdminAction}
            />
          </aside>

          <section className="wb-editor-column">
            <SqlEditorTabs
              tabs={tabs}
              activeTabId={activeTabId}
              mode={defaultMode}
              savedQueries={savedQueries}
              executionMessage={executionMessage}
              onActivateTab={setActiveTabId}
              onAddTab={handleAddTab}
              onCloseTab={handleCloseTab}
              onSqlChange={handleSqlChange}
              onRun={runActiveTab}
              onRunSavedQuery={runSavedQuery}
              onSaveCurrentQuery={handleSaveCurrentQuery}
              onRunRecommended={handleRunRecommended}
              onLoadFirstSavedQuery={handleLoadFirstSaved}
              onInsertTimelineQuery={handleInsertTimelineQuery}
              onClearCurrentQuery={handleClearActiveQuery}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
