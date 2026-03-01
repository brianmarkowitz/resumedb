"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import type { QueryExecutionResult } from "@/lib/resumedb/types";

type ResultsPanelProps = {
  result: QueryExecutionResult | null;
};

type BottomTab = "results" | "plan" | "messages";

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>("results");

  const hasRows = useMemo(() => (result?.rows?.length ?? 0) > 0, [result]);

  return (
    <section className="panel results-panel" aria-label="Query output">
      <div className="results-tabs" role="tablist" aria-label="Result tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeBottomTab === "results"}
          className={clsx("results-tab", activeBottomTab === "results" && "results-tab--active")}
          onClick={() => setActiveBottomTab("results")}
        >
          Results
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeBottomTab === "plan"}
          className={clsx("results-tab", activeBottomTab === "plan" && "results-tab--active")}
          onClick={() => setActiveBottomTab("plan")}
        >
          Query Plan
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeBottomTab === "messages"}
          className={clsx("results-tab", activeBottomTab === "messages" && "results-tab--active")}
          onClick={() => setActiveBottomTab("messages")}
        >
          Messages
        </button>
      </div>

      <div className="results-content">
        {!result && <p className="empty-state">Run a query to inspect ResumeDB output.</p>}

        {result && activeBottomTab === "results" && (
          <>
            {!hasRows ? (
              <p className="empty-state">No rows returned.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {result.columns.map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`}>
                        {result.columns.map((column) => (
                          <td key={`${rowIndex}-${column}`}>{String(row[column] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {result && activeBottomTab === "plan" && (
          <ol className="text-list">
            {result.explainPlan.map((line, index) => (
              <li key={`plan-${index}`}>{line}</li>
            ))}
          </ol>
        )}

        {result && activeBottomTab === "messages" && (
          <ul className="text-list">
            {result.messages.map((line, index) => (
              <li key={`msg-${index}`}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
