"use client";

import Editor from "@monaco-editor/react";
import clsx from "clsx";
import { useEffect } from "react";
import { ToolbarIcon } from "@/components/workbench/ToolbarIcon";
import type { SavedQuery } from "@/lib/resumedb/types";
import type { QueryTab } from "@/components/workbench/workbenchTypes";

type SqlEditorTabsProps = {
  tabs: QueryTab[];
  activeTabId: string;
  mode: "simple" | "pro";
  savedQueries: SavedQuery[];
  executionMessage: string;
  onActivateTab: (tabId: string) => void;
  onAddTab: () => void;
  onCloseTab: (tabId: string) => void;
  onSqlChange: (tabId: string, sql: string) => void;
  onRun: () => void;
  onRunSavedQuery: (savedQueryId: string) => void;
  onSaveCurrentQuery: () => void;
  onRunRecommended: () => void;
  onLoadFirstSavedQuery: () => void;
  onInsertTimelineQuery: () => void;
  onClearCurrentQuery: () => void;
};

export function SqlEditorTabs({
  tabs,
  activeTabId,
  mode,
  savedQueries,
  executionMessage,
  onActivateTab,
  onAddTab,
  onCloseTab,
  onSqlChange,
  onRun,
  onRunSavedQuery,
  onSaveCurrentQuery,
  onRunRecommended,
  onLoadFirstSavedQuery,
  onInsertTimelineQuery,
  onClearCurrentQuery,
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
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="wb-query-tab wb-query-tab--add" onClick={onAddTab}>
          +
        </button>
      </div>

      <div className="wb-query-toolbar">
        <div className="wb-query-toolbar-icons">
          <button
            type="button"
            className="wb-tool wb-tool--editor wb-hint-anchor"
            aria-label="Open first saved query"
            data-hint="Open first saved query"
            onClick={onLoadFirstSavedQuery}
          >
            <ToolbarIcon name="editor-folder" />
          </button>
          <button
            type="button"
            className="wb-tool wb-tool--editor wb-hint-anchor"
            aria-label="Save current query"
            data-hint="Save current query"
            onClick={onSaveCurrentQuery}
          >
            <ToolbarIcon name="editor-save" />
          </button>
          <button
            type="button"
            className="wb-tool wb-tool--editor wb-hint-anchor"
            aria-label="Execute query"
            data-hint="Execute query"
            onClick={onRun}
          >
            <ToolbarIcon name="editor-bolt" />
          </button>
          <button
            type="button"
            className="wb-tool wb-tool--editor wb-hint-anchor"
            aria-label="Insert timeline query"
            data-hint="Insert timeline query"
            onClick={onInsertTimelineQuery}
          >
            <ToolbarIcon name="editor-bolt-alt" />
          </button>
          <button
            type="button"
            className="wb-tool wb-tool--editor wb-hint-anchor"
            aria-label="Clear current query"
            data-hint="Clear current query"
            onClick={onClearCurrentQuery}
          >
            <ToolbarIcon name="editor-clean" />
          </button>
        </div>

        <label className="wb-limit-control">
          <span>Limit to</span>
          <select defaultValue="100" aria-label="Limit rows">
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="500">500</option>
          </select>
          <span>rows</span>
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
                {mode === "simple"
                  ? `${query.label}${query.description ? ` - ${query.description}` : ""}`
                  : query.sql}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onRunRecommended}
            aria-label="Run recommended queries"
            className="wb-hint-anchor"
            data-hint="Run recommended queries"
          >
            ★
          </button>
          <button
            type="button"
            onClick={onRun}
            aria-label="Execute query"
            className="wb-hint-anchor"
            data-hint="Run (Cmd/Ctrl + Enter)"
          >
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
            fontSize: 16,
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

      <div className="wb-editor-scrollbar" aria-hidden="true">
        <span className="wb-editor-scrollbar-thumb" />
      </div>

      <div className="wb-query-status" aria-live="polite">
        <span className="wb-query-metric">100%</span>
        <span className="wb-query-divider" aria-hidden="true" />
        <span className="wb-query-metric">1:1</span>
        <span className="wb-query-status-text">{executionMessage}</span>
      </div>
    </section>
  );
}
