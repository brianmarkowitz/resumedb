"use client";

import Editor from "@monaco-editor/react";
import clsx from "clsx";
import { useEffect } from "react";
import type { QueryMode } from "@/lib/resumedb/types";
import type { QueryTab } from "@/components/workbench/workbenchTypes";

type SqlEditorTabsProps = {
  tabs: QueryTab[];
  activeTabId: string;
  mode: QueryMode;
  onActivateTab: (tabId: string) => void;
  onAddTab: () => void;
  onCloseTab: (tabId: string) => void;
  onSqlChange: (tabId: string, sql: string) => void;
  onRun: () => void;
};

export function SqlEditorTabs({
  tabs,
  activeTabId,
  mode,
  onActivateTab,
  onAddTab,
  onCloseTab,
  onSqlChange,
  onRun,
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
    <section className="panel editor-panel" aria-label="SQL editor">
      <div className="editor-toolbar">
        <div className="tab-row" role="tablist" aria-label="Query tabs">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={clsx("tab-chip-wrap", tab.id === activeTabId && "tab-chip-wrap--active")}
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab.id === activeTabId}
                onClick={() => onActivateTab(tab.id)}
                className={clsx("tab-chip", tab.id === activeTabId && "tab-chip--active")}
              >
                {tab.title}
              </button>
              {tabs.length > 1 && (
                <button
                  type="button"
                  className="tab-chip__close"
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
          <button type="button" className="tab-chip tab-chip--add" onClick={onAddTab}>
            +
          </button>
        </div>
        <div className="editor-actions">
          <span className="editor-mode">{mode === "simple" ? "Simple labels enabled" : "Pro SQL mode"}</span>
          <button type="button" onClick={onRun} className="run-btn">
            Run (Cmd/Ctrl + Enter)
          </button>
        </div>
      </div>

      <div className="editor-shell">
        <Editor
          value={activeTab?.sql ?? ""}
          defaultLanguage="sql"
          onChange={(value) => onSqlChange(activeTabId, value ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-workbench-mono)",
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            tabSize: 2,
            wordWrap: "on",
            suggestOnTriggerCharacters: false,
          }}
          theme="vs-dark"
          height="340px"
        />
      </div>
    </section>
  );
}
