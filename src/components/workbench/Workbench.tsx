"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SchemaBrowser } from "@/components/workbench/SchemaBrowser";
import { ResultsPanel } from "@/components/workbench/ResultsPanel";
import { SqlEditorTabs } from "@/components/workbench/SqlEditorTabs";
import { StandardResume } from "@/components/workbench/StandardResume";
import { ToolbarIcon } from "@/components/workbench/ToolbarIcon";
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

function inferBaseQueryTitle(sql: string): string {
  const compactSql = sql.replace(/--.*$/gm, " ").replace(/\s+/g, " ").trim();
  if (!compactSql) {
    return "query";
  }

  const fromMatch = compactSql.match(/\bfrom\s+([a-zA-Z0-9_.]+)/i);
  if (fromMatch?.[1]) {
    return fromMatch[1].split(".").pop() ?? "query";
  }

  const execMatch = compactSql.match(/\bexec(?:ute)?\s+([a-zA-Z0-9_.]+)/i);
  if (execMatch?.[1]) {
    return execMatch[1].split(".").pop() ?? "query";
  }

  return compactSql.split(" ")[0].toLowerCase();
}

function makeQueryTitleForSql(sql: string, existingTitles: string[]): string {
  const baseTitle = inferBaseQueryTitle(sql);
  const sameBaseCount = existingTitles.filter(
    (title) => title === baseTitle || title.startsWith(`${baseTitle} (`),
  ).length;
  return sameBaseCount === 0 ? baseTitle : `${baseTitle} (${sameBaseCount + 1})`;
}

function makeSavedQueryLabel(sql: string, index: number): string {
  const singleLineSql = sql
    .replace(/--.*$/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!singleLineSql) {
    return `Saved Query ${index}`;
  }

  return singleLineSql.length > 50 ? `${singleLineSql.slice(0, 50)}...` : singleLineSql;
}

function inferSavedQueryDescription(sql: string): string {
  const compactSql = sql.replace(/--.*$/gm, " ").replace(/\s+/g, " ").trim();

  const fromMatch = compactSql.match(/\bfrom\s+([a-zA-Z0-9_.]+)/i);
  if (fromMatch?.[1]) {
    const target = fromMatch[1].split(".").pop() ?? fromMatch[1];
    return `Shows data from ${target}.`;
  }

  const execMatch = compactSql.match(/\bexec(?:ute)?\s+([a-zA-Z0-9_.]+)/i);
  if (execMatch?.[1]) {
    const target = execMatch[1].split(".").pop() ?? execMatch[1];
    return `Runs ${target} to return focused resume highlights.`;
  }

  return "Shows curated resume data from ResumeDB.";
}

function buildSqlWithDescription(sql: string, description?: string): string {
  const cleanedSql = sql.trim();
  const cleanedDescription = (description ?? "").trim();

  if (!cleanedDescription) {
    return cleanedSql;
  }

  return [`-- ${cleanedDescription}`, cleanedSql].join("\n");
}

function buildSavedQueryEditorSql(savedQuery: SavedQuery): string {
  return buildSqlWithDescription(savedQuery.sql, savedQuery.description);
}

const savedQueryStorageKey = "resumedb_custom_saved_queries_v1";
const sidebarWidthStorageKey = "resumedb_sidebar_width_v1";
const outputHeightStorageKey = "resumedb_output_height_v1";
const defaultMode: QueryMode = "simple";
const defaultSidebarWidth = 338;
const defaultOutputHeight = 215;
const minSidebarWidth = 220;
const minEditorWidth = 420;
const minOutputHeight = 150;
const minEditorHeight = 220;

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
type DisplayMode = "workbench" | "standard_resume";
type ActiveResize = "sidebar" | "output" | null;

function clampValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function Workbench() {
  const starterQueries = useMemo(() => getStarterQueries(), []);
  const recommendedQueries = useMemo(() => getRecommendedQueries(), []);

  const initialStarterQuery = starterQueries[0];
  const initialSqlBase = initialStarterQuery?.sqlTemplates[0] ?? presetSql.onePage;
  const initialSqlDescription =
    initialStarterQuery?.simpleHint ??
    "Shows a concise one-page overview of Brian's background and strengths.";
  const initialSql = buildSqlWithDescription(initialSqlBase, initialSqlDescription);
  const initialResult = useMemo(
    () => executeQuery(initialSqlBase, defaultMode),
    [initialSqlBase],
  );
  const defaultSavedQueries = useMemo<SavedQuery[]>(
    () =>
      starterQueries.map((query) => ({
        id: query.id,
        label: query.simpleLabel,
        description: query.simpleHint ?? query.simpleLabel,
        sql: query.sqlTemplates[0] ?? "",
      })),
    [starterQueries],
  );
  const defaultSavedQueryIds = useMemo(
    () => new Set(defaultSavedQueries.map((query) => query.id)),
    [defaultSavedQueries],
  );

  const [schemaSearch, setSchemaSearch] = useState("");
  const [selectedSchemaObjectName, setSelectedSchemaObjectName] = useState<string | null>(null);
  const [navigatorTab, setNavigatorTab] = useState<NavigatorTab>("schemas");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("workbench");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [denseMode, setDenseMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth);
  const [outputHeight, setOutputHeight] = useState(defaultOutputHeight);
  const [activeResize, setActiveResize] = useState<ActiveResize>(null);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [statusNote, setStatusNote] = useState("Ready");
  const workAreaRef = useRef<HTMLDivElement | null>(null);
  const editorColumnRef = useRef<HTMLElement | null>(null);
  const [tabs, setTabs] = useState<QueryTab[]>(() => [
    {
      id: makeTabId(),
      title: makeQueryTitleForSql(initialSql, []),
      sql: initialSql,
      status: initialResult.status,
      result: initialResult,
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

      const normalizedCustomSavedQueries = customSavedQueries.map((query) => ({
        ...query,
        description:
          typeof query.description === "string" && query.description.trim().length > 0
            ? query.description
            : inferSavedQueryDescription(query.sql),
      }));

      return [...defaultSavedQueries, ...normalizedCustomSavedQueries];
    } catch {
      window.localStorage.removeItem(savedQueryStorageKey);
      return defaultSavedQueries;
    }
  });

  useEffect(() => {
    const customSavedQueries = savedQueries.filter((query) => !defaultSavedQueryIds.has(query.id));
    window.localStorage.setItem(savedQueryStorageKey, JSON.stringify(customSavedQueries));
  }, [defaultSavedQueryIds, savedQueries]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedSidebarWidth = Number(window.localStorage.getItem(sidebarWidthStorageKey));
    const storedOutputHeight = Number(window.localStorage.getItem(outputHeightStorageKey));
    const applyStoredSizingFrame = window.requestAnimationFrame(() => {
      if (Number.isFinite(storedSidebarWidth) && storedSidebarWidth > 0) {
        setSidebarWidth(Math.round(storedSidebarWidth));
      }

      if (Number.isFinite(storedOutputHeight) && storedOutputHeight > 0) {
        setOutputHeight(Math.round(storedOutputHeight));
      }
    });

    const mediaQuery = window.matchMedia("(max-width: 1100px)");
    const handleViewportChange = () => setIsCompactViewport(mediaQuery.matches);
    handleViewportChange();
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      window.cancelAnimationFrame(applyStoredSizingFrame);
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(sidebarWidthStorageKey, String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(outputHeightStorageKey, String(outputHeight));
  }, [outputHeight]);

  useEffect(() => {
    if (!activeResize) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (activeResize === "sidebar") {
        if (sidebarCollapsed) {
          return;
        }

        const rect = workAreaRef.current?.getBoundingClientRect();
        if (!rect) {
          return;
        }

        const maxSidebarWidth = Math.max(minSidebarWidth, rect.width - minEditorWidth);
        const nextSidebarWidth = clampValue(event.clientX - rect.left, minSidebarWidth, maxSidebarWidth);
        setSidebarWidth(Math.round(nextSidebarWidth));
        return;
      }

      const rect = editorColumnRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const maxOutputHeight = Math.max(minOutputHeight, rect.height - minEditorHeight);
      const nextOutputHeight = clampValue(rect.bottom - event.clientY, minOutputHeight, maxOutputHeight);
      setOutputHeight(Math.round(nextOutputHeight));
    };

    const handlePointerUp = () => {
      setActiveResize(null);
      setStatusNote("Updated workbench panel sizing");
    };

    document.body.classList.add("wb-is-resizing");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.classList.remove("wb-is-resizing");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeResize, sidebarCollapsed]);

  const handleSidebarResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || isCompactViewport || sidebarCollapsed) {
        return;
      }

      event.preventDefault();
      setActiveResize("sidebar");
    },
    [isCompactViewport, sidebarCollapsed],
  );

  const handleOutputResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || isCompactViewport) {
        return;
      }

      event.preventDefault();
      setActiveResize("output");
    },
    [isCompactViewport],
  );

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
          title: makeQueryTitleForSql(sql, previous.map((tab) => tab.title)),
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
        title: makeQueryTitleForSql(presetSql.onePage, previous.map((tab) => tab.title)),
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
      const sqlForEditor = buildSavedQueryEditorSql(savedQuery);

      setTabs((previous) =>
        previous.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                title: makeQueryTitleForSql(
                  sqlForEditor,
                  previous.filter((item) => item.id !== activeTabId).map((item) => item.title),
                ),
                sql: sqlForEditor,
                status: result.status,
                result,
              }
            : tab,
        ),
      );
      setStatusNote(`Loaded and executed saved query: ${savedQuery.label}`);
    },
    [activeTabId, savedQueries],
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
          description: inferSavedQueryDescription(trimmedSql),
          sql: trimmedSql,
        },
      ];
    });

    setStatusNote(saved ? "Saved current query" : "Query already exists in saved list");
  }, [activeTab]);

  const handleRunRecommended = useCallback(() => {
    const newTabs: QueryTab[] = [];

    recommendedQueries.forEach((query) => {
      const sql = query.sqlTemplates[0] ?? "";
      const result = executeQuery(sql, defaultMode);
      const tab: QueryTab = {
        id: makeTabId(),
        title: makeQueryTitleForSql(sql, tabs.concat(newTabs).map((item) => item.title)),
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
  }, [recommendedQueries, tabs]);

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
    const homeSql = buildSqlWithDescription(initialSqlBase, initialSqlDescription);
    const homeResult = executeQuery(initialSqlBase, defaultMode);
    const baseTabId = makeTabId();
    setDisplayMode("workbench");
    setNavigatorTab("schemas");
    setSidebarCollapsed(false);
    setDenseMode(false);
    setSchemaSearch("");
    setSelectedSchemaObjectName(null);
    setTabs([
      {
        id: baseTabId,
        title: makeQueryTitleForSql(homeSql, []),
        sql: homeSql,
        status: homeResult.status,
        result: homeResult,
      },
    ]);
    setActiveTabId(baseTabId);
    setStatusNote("Returned to home resume workspace with profile snapshot preloaded");
  }, [initialSqlBase, initialSqlDescription]);

  const handleRunAdminAction = useCallback(
    (preset: PresetKey) => {
      openPresetInNewTab(preset, `Ran ${preset} narrative query from administration panel`);
    },
    [openPresetInNewTab],
  );

  const handleSelectSchemaObject = useCallback((objectName: string) => {
    setSelectedSchemaObjectName(objectName);
  }, []);

  const handleOpenViewFromSchema = useCallback(
    (viewName: string) => {
      const sql = `SELECT * FROM ${viewName};`;
      const result = executeQuery(sql, defaultMode);

      setTabs((previous) =>
        previous.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                title: makeQueryTitleForSql(
                  sql,
                  previous.filter((item) => item.id !== activeTabId).map((item) => item.title),
                ),
                sql,
                status: result.status,
                result,
              }
            : tab,
        ),
      );

      setSelectedSchemaObjectName(viewName);
      setStatusNote(`Loaded and executed ${viewName} from schema browser`);
    },
    [activeTabId],
  );

  const executionSummary = activeTab?.result
    ? activeTab.result.status === "ok"
      ? `${activeTab.result.rows.length} row(s) returned`
      : activeTab.result.messages[0] ?? "Query failed"
    : "No execution yet";

  const executionMessage = `${statusNote} | ${executionSummary}`;

  const windowClassName = `wb-window${denseMode ? " wb-window--dense" : ""}`;
  const workAreaClassName = `wb-work-area${sidebarCollapsed ? " wb-work-area--sidebar-collapsed" : ""}`;
  const canResizeWorkbench = !isCompactViewport;
  const showSidebarSplitter = canResizeWorkbench && !sidebarCollapsed;
  const workAreaStyle: CSSProperties | undefined = canResizeWorkbench
    ? {
        gridTemplateColumns: showSidebarSplitter
          ? `${sidebarWidth}px 6px minmax(0, 1fr)`
          : "0 minmax(0, 1fr)",
      }
    : undefined;
  const editorColumnStyle: CSSProperties | undefined = canResizeWorkbench
    ? {
        gridTemplateRows: `minmax(0, 1fr) 6px ${outputHeight}px`,
      }
    : undefined;
  const footerText =
    displayMode === "standard_resume"
      ? "Standard Resume Opened. MySQL Workbench-inspired ResumeDB replica."
      : "SQL Editor Opened. MySQL Workbench-inspired ResumeDB replica.";

  return (
    <main className="wb-page">
      <div className={windowClassName}>
        <header className="wb-titlebar">
          <div className="wb-traffic-lights" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <h1>Brian&apos;s Resume</h1>
          <div />
        </header>

        <div className="wb-connection-strip" role="presentation">
          <button type="button" className="wb-home-btn" aria-label="Home" onClick={handleHome}>
            <span className="wb-glyph wb-glyph--home" />
          </button>
          <div className="wb-connection-tab">resume(local-bmarko) - Warning - not supported</div>
          <div className="wb-window-icons">
            <button
              type="button"
              className={`wb-chrome-btn wb-chrome-btn--mode${displayMode === "standard_resume" ? " wb-chrome-btn--active" : ""}`}
              aria-label={
                displayMode === "workbench"
                  ? "Open standard resume view"
                  : "Return to SQL workbench view"
              }
              onClick={() => {
                setDisplayMode((previous) =>
                  previous === "workbench" ? "standard_resume" : "workbench",
                );
                setStatusNote(
                  displayMode === "workbench"
                    ? "Opened standard resume view"
                    : "Returned to SQL workbench view",
                );
              }}
              title={displayMode === "workbench" ? "Standard Resume" : "SQL Workbench"}
            >
              <span className="wb-glyph wb-glyph--mode">{displayMode === "workbench" ? "R" : "S"}</span>
            </button>
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
              <span className="wb-glyph wb-glyph--layout-primary" />
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
              <span className="wb-glyph wb-glyph--layout-secondary" />
            </button>
            <button
              type="button"
              className="wb-chrome-btn"
              aria-label="Run recommended storyline"
              onClick={handleRunRecommended}
              title="Run recommended storyline"
            >
              <span className="wb-glyph wb-glyph--layout-solid" />
            </button>
          </div>
        </div>

        {displayMode === "workbench" ? (
          <>
            <div className="wb-main-toolbar">
              <div className="wb-icon-row">
                <button
                  type="button"
                  className="wb-tool wb-tool--top"
                  onClick={handleLoadFirstSaved}
                  title="Open first saved query"
                  aria-label="Open first saved query"
                >
                  <ToolbarIcon name="sql-plus" />
                </button>
                <button
                  type="button"
                  className="wb-tool wb-tool--top"
                  onClick={handleInsertNarrativeTemplate}
                  title="Insert resume narrative template"
                  aria-label="Insert resume narrative template"
                >
                  <ToolbarIcon name="sql-doc" />
                </button>
                <button
                  type="button"
                  className="wb-tool wb-tool--top"
                  onClick={handleSaveCurrentQuery}
                  title="Save current query"
                  aria-label="Save current query"
                >
                  <ToolbarIcon name="info" />
                </button>
                <button
                  type="button"
                  className="wb-tool wb-tool--top"
                  onClick={() => openPresetInNewTab("onePage", "Opened one-page resume view")}
                  title="Run one-page resume view"
                  aria-label="Run one-page resume view"
                >
                  <ToolbarIcon name="db-plus" />
                </button>
                <button
                  type="button"
                  className="wb-tool wb-tool--top"
                  onClick={() => openPresetInNewTab("governance", "Opened governance highlights view")}
                  title="Run governance highlights"
                  aria-label="Run governance highlights"
                >
                  <ToolbarIcon name="table-plus" />
                </button>
                <button
                  type="button"
                  className="wb-tool wb-tool--top"
                  onClick={() => {
                    setNavigatorTab("schemas");
                    setSchemaSearch("skill");
                    setStatusNote("Filtered schema objects to skills");
                  }}
                  title="Filter schema to skills"
                  aria-label="Filter schema to skills"
                >
                  <ToolbarIcon name="relation-plus" />
                </button>
                <button
                  type="button"
                  className="wb-tool wb-tool--top"
                  onClick={() => openPresetInNewTab("reliability", "Opened reliability highlights view")}
                  title="Run reliability highlights"
                  aria-label="Run reliability highlights"
                >
                  <ToolbarIcon name="function-plus" />
                </button>
                <button
                  type="button"
                  className="wb-tool wb-tool--top"
                  onClick={() => openPresetInNewTab("impact", "Opened impact metrics dashboard query")}
                  title="Run impact highlights"
                  aria-label="Run impact highlights"
                >
                  <ToolbarIcon name="table-search" />
                </button>
              </div>
              <div className="wb-icon-row">
                <button
                  type="button"
                  className="wb-tool wb-tool--top"
                  onClick={() => openPresetInNewTab("skills", "Opened skills matrix query")}
                  title="Run skills matrix"
                  aria-label="Run skills matrix"
                >
                  <ToolbarIcon name="db-sync" />
                </button>
              </div>
            </div>

            <div className={workAreaClassName} ref={workAreaRef} style={workAreaStyle}>
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
                  selectedObjectName={selectedSchemaObjectName}
                  onSearchChange={setSchemaSearch}
                  onRunPreset={handleRunAdminAction}
                  onSelectObject={handleSelectSchemaObject}
                  onOpenView={handleOpenViewFromSchema}
                />
              </aside>

              {showSidebarSplitter ? (
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize schema browser"
                  className={`wb-splitter wb-splitter--vertical${activeResize === "sidebar" ? " wb-splitter--active" : ""}`}
                  onPointerDown={handleSidebarResizeStart}
                />
              ) : null}

              <section className="wb-editor-column" ref={editorColumnRef} style={editorColumnStyle}>
                <div className="wb-editor-primary">
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
                </div>
                {canResizeWorkbench ? (
                  <div
                    role="separator"
                    aria-orientation="horizontal"
                    aria-label="Resize output panel"
                    className={`wb-splitter wb-splitter--horizontal${activeResize === "output" ? " wb-splitter--active" : ""}`}
                    onPointerDown={handleOutputResizeStart}
                  />
                ) : null}
                <ResultsPanel
                  key={activeTab?.result?.normalizedSql ?? activeTab?.id ?? "result_panel"}
                  result={activeTab?.result ?? null}
                />
              </section>
            </div>
          </>
        ) : (
          <StandardResume />
        )}
        <footer className="wb-window-status">{footerText}</footer>
      </div>
    </main>
  );
}
