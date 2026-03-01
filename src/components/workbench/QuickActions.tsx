"use client";

import type { HistoryItem, QueryDefinition, QueryMode } from "@/lib/resumedb/types";

type QuickActionsProps = {
  mode: QueryMode;
  starterQueries: QueryDefinition[];
  history: HistoryItem[];
  onRunQuery: (queryId: string) => void;
  onRunRecommended: () => void;
};

export function QuickActions({
  mode,
  starterQueries,
  history,
  onRunQuery,
  onRunRecommended,
}: QuickActionsProps) {
  return (
    <section className="panel quick-actions" aria-label="Quick actions">
      <div className="panel__header">
        <h2>Try These Queries</h2>
        <p>{mode === "simple" ? "Friendly labels" : "Raw SQL"}</p>
      </div>

      <button type="button" className="recommended-btn" onClick={onRunRecommended}>
        Run Recommended Queries
      </button>

      <ul className="action-list">
        {starterQueries.map((query) => (
          <li key={query.id}>
            <button type="button" onClick={() => onRunQuery(query.id)}>
              {mode === "simple" ? query.simpleLabel : query.sqlTemplates[0]}
            </button>
          </li>
        ))}
      </ul>

      <div className="history-block">
        <h3>Query History</h3>
        {!history.length && <p>No queries executed yet.</p>}
        <ul>
          {history.slice(0, 8).map((item) => (
            <li key={item.id}>
              <strong>{item.displayName}</strong>
              <span>{item.timestamp}</span>
              <span>
                {item.status.toUpperCase()} • {item.durationMs}ms
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
