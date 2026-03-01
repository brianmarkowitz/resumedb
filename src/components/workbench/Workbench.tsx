"use client";

import { useCallback, useMemo, useState } from "react";
import { ModeToggle } from "@/components/workbench/ModeToggle";
import { QuickActions } from "@/components/workbench/QuickActions";
import { ResultsPanel } from "@/components/workbench/ResultsPanel";
import { SchemaBrowser } from "@/components/workbench/SchemaBrowser";
import { SqlEditorTabs } from "@/components/workbench/SqlEditorTabs";
import type { QueryTab } from "@/components/workbench/workbenchTypes";
import { executeQuery, normalizeSql } from "@/lib/resumedb/executeQuery";
import {
  getQueryDefinitionById,
  getRecommendedQueries,
  getStarterQueries,
} from "@/lib/resumedb/queryCatalog";
import { schemaObjects } from "@/lib/resumedb/schema";
import type { HistoryItem, QueryMode, SavedQuery } from "@/lib/resumedb/types";

function makeTabId(): string {
  return `tab_${Math.random().toString(36).slice(2, 10)}`;
}

function makeSavedQueryId(): string {
  return `saved_${Math.random().toString(36).slice(2, 10)}`;
}

function nowStamp(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function makeQueryTitle(index: number): string {
  return `Query ${index}`;
}

function makeSavedQueryLabel(sql: string, index: number): string {
  const singleLineSql = sql.replace(/\s+/g, " ").trim();
  if (!singleLineSql) {
    return `Saved Query ${index}`;
  }

  return singleLineSql.length > 52 ? `${singleLineSql.slice(0, 52)}...` : singleLineSql;
}

export function Workbench() {
  const starterQueries = useMemo(() => getStarterQueries(), []);
  const recommendedQueries = useMemo(() => getRecommendedQueries(), []);

  const initialSql = starterQueries[0]?.sqlTemplates[0] ?? "SELECT * FROM v_resume_one_page;";
  const defaultSavedQueries = useMemo<SavedQuery[]>(
    () =>
      starterQueries.map((query) => ({
        id: query.id,
        label: query.simpleLabel,
        sql: query.sqlTemplates[0] ?? "",
      })),
    [starterQueries],
  );

  const [mode, setMode] = useState<QueryMode>("simple");
  const [schemaSearch, setSchemaSearch] = useState("");
  const [tabs, setTabs] = useState<QueryTab[]>([
    {
      id: makeTabId(),
      title: "Query 1",
      sql: initialSql,
      status: "idle",
      result: null,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id ?? "");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(defaultSavedQueries);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;

  const appendHistory = useCallback(
    (queryId: string | null, displayName: string, durationMs: number, status: "ok" | "error") => {
      setHistory((previous) => [
        {
          id: `hist_${Math.random().toString(36).slice(2, 10)}`,
          timestamp: nowStamp(),
          queryId: queryId ?? "ad-hoc",
          displayName,
          durationMs,
          status,
        },
        ...previous,
      ]);
    },
    [],
  );

  const runActiveTab = useCallback(() => {
    const tab = tabs.find((item) => item.id === activeTabId);
    if (!tab) {
      return;
    }

    const startedAt = performance.now();
    const result = executeQuery(tab.sql, mode);
    const durationMs = Math.max(1, Math.round(performance.now() - startedAt));

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

    const queryDef = result.queryId ? getQueryDefinitionById(result.queryId) : undefined;
    const displayName = queryDef?.simpleLabel ?? tab.sql.slice(0, 48).replace(/\s+/g, " ").trim();
    appendHistory(result.queryId, displayName || "Ad-hoc query", durationMs, result.status);
  }, [activeTabId, appendHistory, mode, tabs]);

  const handleAddTab = useCallback(() => {
    const nextIndex = tabs.length + 1;
    const newTab: QueryTab = {
      id: makeTabId(),
      title: makeQueryTitle(nextIndex),
      sql: "SELECT * FROM v_resume_one_page;",
      status: "idle",
      result: null,
    };

    setTabs((previous) => [...previous, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs.length]);

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
    },
    [activeTabId, tabs],
  );

  const handleSqlChange = useCallback((tabId: string, sql: string) => {
    setTabs((previous) => previous.map((tab) => (tab.id === tabId ? { ...tab, sql } : tab)));
  }, []);

  const runSavedQuery = useCallback(
    (savedQueryId: string) => {
      const savedQuery = savedQueries.find((query) => query.id === savedQueryId);
      if (!savedQuery) {
        return;
      }

      const startedAt = performance.now();
      const result = executeQuery(savedQuery.sql, mode);
      const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
      const newTab: QueryTab = {
        id: makeTabId(),
        title: makeQueryTitle(tabs.length + 1),
        sql: savedQuery.sql,
        status: result.status,
        result,
      };

      setTabs((previous) => [...previous, newTab]);
      setActiveTabId(newTab.id);
      appendHistory(result.queryId, savedQuery.label, durationMs, result.status);
    },
    [appendHistory, mode, savedQueries, tabs.length],
  );

  const handleSaveCurrentQuery = useCallback(() => {
    if (!activeTab) {
      return;
    }

    const trimmedSql = activeTab.sql.trim();
    if (!trimmedSql) {
      return;
    }

    setSavedQueries((previous) => {
      const duplicate = previous.some((query) => normalizeSql(query.sql) === normalizeSql(trimmedSql));
      if (duplicate) {
        return previous;
      }

      return [
        ...previous,
        {
          id: makeSavedQueryId(),
          label: makeSavedQueryLabel(trimmedSql, previous.length + 1),
          sql: trimmedSql,
        },
      ];
    });
  }, [activeTab]);

  const handleRunRecommended = useCallback(() => {
    const newTabs: QueryTab[] = [];
    const newHistory: HistoryItem[] = [];

    recommendedQueries.forEach((query, index) => {
      const sql = query.sqlTemplates[0] ?? "";
      const startedAt = performance.now();
      const result = executeQuery(sql, mode);
      const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
      const tab: QueryTab = {
        id: makeTabId(),
        title: makeQueryTitle(tabs.length + index + 1),
        sql,
        status: result.status,
        result,
      };

      newTabs.push(tab);
      newHistory.push({
        id: `hist_${Math.random().toString(36).slice(2, 10)}`,
        timestamp: nowStamp(),
        queryId: result.queryId ?? query.id,
        displayName: query.simpleLabel,
        durationMs,
        status: result.status,
      });
    });

    if (newTabs.length) {
      setTabs((previous) => [...previous, ...newTabs]);
      setActiveTabId(newTabs[newTabs.length - 1].id);
      setHistory((previous) => [...newHistory.reverse(), ...previous]);
    }
  }, [mode, recommendedQueries, tabs.length]);

  return (
    <main className="workbench-root">
      <header className="workbench-header">
        <div>
          <p className="eyebrow">ResumeDB Workbench</p>
          <h1>Brian M. Markowitz | SQL Portfolio Console</h1>
          <p className="subtitle">
            Explore architecture, impact, and leadership through queryable resume views.
          </p>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </header>

      <div className="workbench-grid">
        <SchemaBrowser objects={schemaObjects} search={schemaSearch} onSearchChange={setSchemaSearch} />

        <section className="center-column">
          <SqlEditorTabs
            tabs={tabs}
            activeTabId={activeTabId}
            mode={mode}
            onActivateTab={setActiveTabId}
            onAddTab={handleAddTab}
            onCloseTab={handleCloseTab}
            onSqlChange={handleSqlChange}
            onRun={runActiveTab}
          />
          <ResultsPanel result={activeTab?.result ?? null} />
        </section>

        <QuickActions
          mode={mode}
          savedQueries={savedQueries}
          history={history}
          onRunSavedQuery={runSavedQuery}
          onSaveCurrentQuery={handleSaveCurrentQuery}
          onRunRecommended={handleRunRecommended}
        />
      </div>
    </main>
  );
}
