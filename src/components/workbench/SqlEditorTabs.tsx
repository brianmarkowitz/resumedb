"use client";

import Editor from "@monaco-editor/react";
import clsx from "clsx";
import { useEffect } from "react";
import type { SavedQuery } from "@/lib/resumedb/types";
import type { QueryTab } from "@/components/workbench/workbenchTypes";

type SqlEditorTabsProps = {
  tabs: QueryTab[];
  activeTabId: string;
  mode: "simple" | "pro";
  savedQueries: SavedQuery[];
  onActivateTab: (tabId: string) => void;
  onAddTab: () => void;
  onCloseTab: (tabId: string) => void;
  onSqlChange: (tabId: string, sql: string) => void;
  onRun: () => void;
  onRunSavedQuery: (savedQueryId: string) => void;
  onSaveCurrentQuery: () => void;
  onRunRecommended: () => void;
};

export function SqlEditorTabs({
  tabs,
  activeTabId,
  mode,
  savedQueries,
  onActivateTab,
  onAddTab,
  onCloseTab,
  onSqlChange,
  onRun,
  onRunSavedQuery,
  onSaveCurrentQuery,
  onRunRecommended,
}: SqlEditorTabsProps) {
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        onRun();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRun]);

  return (
    <section className="wb-editor-shell" aria-label="SQL editor">
      <div className="wb-query-tabs" role="tablist" aria-label="Query tabs">
        {tabs.map((tab) => (
          <div key={tab.id} className="wb-query-tab-wrap">
            <button
              type="button"
              role="tab"
              aria-selected={tab.id === activeTabId}
              onClick={() => onActivateTab(tab.id)}
              className={clsx("wb-query-tab", tab.id === activeTabId && "wb-query-tab--active")}
            >
              <span className="wb-query-tab-icon" aria-hidden="true">
                ⚡
              </span>
              <span>{tab.title}</span>
            </button>
            {tabs.length > 1 && (
              <button
                type="button"
                className="wb-query-tab-close"
                onClick={(event) => {
                  event.stopPropagation();
                  onCloseTab(tab.id);
                }}
                aria-label={`Close ${tab.title}`}
              >
                x
              </button>
            )}
          </div>
        ))}
        <button type="button" className="wb-query-tab wb-query-tab--add" onClick={onAddTab}>
          +
        </button>
      </div>

      <div className="wb-query-toolbar">
        <div className="wb-query-toolbar-icons" aria-hidden="true">
          <span>📁</span>
          <span>💾</span>
          <span>⚡</span>
          <span>⏱</span>
          <span>🧹</span>
        </div>

        <label className="wb-limit-control">
          <span>Limit to 100 rows</span>
          <select defaultValue="100" aria-label="Limit rows">
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="500">500</option>
          </select>
        </label>

        <div className="wb-query-actions">
          <select
            defaultValue=""
            aria-label="Saved queries"
            onChange={(event) => {
              if (!event.target.value) {
                return;
              }

              onRunSavedQuery(event.target.value);
              event.target.value = "";
            }}
          >
            <option value="">Saved queries</option>
            {savedQueries.map((query) => (
              <option key={query.id} value={query.id}>
                {mode === "simple" ? query.label : query.sql}
              </option>
            ))}
          </select>
          <button type="button" onClick={onSaveCurrentQuery} aria-label="Save current query" title="Save current query">
            ★
          </button>
          <button
            type="button"
            onClick={onRunRecommended}
            aria-label="Run recommended queries"
            title="Run recommended queries"
          >
            ☆
          </button>
          <button type="button" onClick={onRun} aria-label="Execute query" title="Run (Cmd/Ctrl + Enter)">
            ▶
          </button>
        </div>
      </div>

      <div className="wb-query-editor">
        <Editor
          value={activeTab?.sql ?? ""}
          defaultLanguage="sql"
          onChange={(value) => onSqlChange(activeTabId, value ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 32,
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            lineNumbersMinChars: 2,
            scrollBeyondLastLine: false,
            tabSize: 2,
            wordWrap: "off",
            suggestOnTriggerCharacters: false,
            glyphMargin: false,
            folding: false,
          }}
          theme="vs"
          height="100%"
        />
      </div>

      <div className="wb-query-status">
        <span>100%</span>
        <span>1:1</span>
      </div>
    </section>
  );
}
