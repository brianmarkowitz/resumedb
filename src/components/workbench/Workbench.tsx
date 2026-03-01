"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ResultsPanel } from "@/components/workbench/ResultsPanel";
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

export function Workbench() {
  const starterQueries = useMemo(() => getStarterQueries(), []);
  const recommendedQueries = useMemo(() => getRecommendedQueries(), []);

  const initialSql =
    starterQueries[0]?.sqlTemplates[0] ?? "SELECT * FROM v_resume_one_page;";
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
    const customSavedQueries = savedQueries.filter(
      (query) => !defaultSavedQueryIds.has(query.id),
    );
    window.localStorage.setItem(
      savedQueryStorageKey,
      JSON.stringify(customSavedQueries),
    );
  }, [defaultSavedQueryIds, savedQueries]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;

  const runQuerySqlInNewTab = useCallback(
    (sql: string, titleOverride?: string) => {
      const result = executeQuery(sql, defaultMode);
      const newTab: QueryTab = {
        id: makeTabId(),
        title: titleOverride ?? makeQueryTitle(tabs.length + 1),
        sql,
        status: result.status,
        result,
      };

      setTabs((previous) => [...previous, newTab]);
      setActiveTabId(newTab.id);
    },
    [tabs.length],
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
  }, [activeTabId, tabs]);

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

      runQuerySqlInNewTab(savedQuery.sql, makeQueryTitle(tabs.length + 1));
    },
    [runQuerySqlInNewTab, savedQueries, tabs.length],
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
      const duplicate = previous.some(
        (query) => normalizeSql(query.sql) === normalizeSql(trimmedSql),
      );
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
    }
  }, [recommendedQueries, tabs.length]);

  return (
    <main className="wb-page">
      <div className="wb-window">
        <header className="wb-titlebar">
          <div className="wb-traffic-lights" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <h1>MySQL Workbench</h1>
        </header>

        <div className="wb-connection-strip" role="presentation">
          <button type="button" className="wb-home-btn" aria-label="Home">
            ⌂
          </button>
          <div className="wb-connection-tab">biospec(local-bmarko) - Warning - not supported</div>
          <div className="wb-window-icons" aria-hidden="true">
            <span>⚙</span>
            <span>▭</span>
            <span>▯</span>
            <span>▮</span>
          </div>
        </div>

        <div className="wb-main-toolbar" aria-hidden="true">
          <div className="wb-icon-row">
            <span>🗂</span>
            <span>🧾</span>
            <span>🗄</span>
            <span>⛃</span>
            <span>🧰</span>
            <span>🔎</span>
          </div>
          <div className="wb-icon-row">
            <span>📈</span>
            <span>🧭</span>
          </div>
        </div>

        <div className="wb-work-area">
          <aside className="wb-sidebar">
            <div className="wb-sidebar-tabs" role="tablist" aria-label="Navigator tabs">
              <button type="button" role="tab" className="wb-side-tab">
                Administration
              </button>
              <button type="button" role="tab" className="wb-side-tab wb-side-tab--active">
                Schemas
              </button>
            </div>

            <SchemaBrowser objects={schemaObjects} search={schemaSearch} onSearchChange={setSchemaSearch} />

            <div className="wb-sidebar-footer">SQL Editor Opened.</div>
          </aside>

          <section className="wb-editor-column">
            <SqlEditorTabs
              tabs={tabs}
              activeTabId={activeTabId}
              mode={defaultMode}
              savedQueries={savedQueries}
              onActivateTab={setActiveTabId}
              onAddTab={handleAddTab}
              onCloseTab={handleCloseTab}
              onSqlChange={handleSqlChange}
              onRun={runActiveTab}
              onRunSavedQuery={runSavedQuery}
              onSaveCurrentQuery={handleSaveCurrentQuery}
              onRunRecommended={handleRunRecommended}
            />
            <ResultsPanel result={activeTab?.result ?? null} />
          </section>
        </div>
      </div>
    </main>
  );
}
