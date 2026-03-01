"use client";

import type { HistoryItem, QueryMode, SavedQuery } from "@/lib/resumedb/types";

type QuickActionsProps = {
  mode: QueryMode;
  savedQueries: SavedQuery[];
  history: HistoryItem[];
  onRunSavedQuery: (savedQueryId: string) => void;
  onSaveCurrentQuery: () => void;
  onRunRecommended: () => void;
};

export function QuickActions({
  mode,
  savedQueries,
  history,
  onRunSavedQuery,
  onSaveCurrentQuery,
  onRunRecommended,
}: QuickActionsProps) {
  return (
    <section className="panel quick-actions" aria-label="Quick actions">
      <div className="panel__header">
        <h2>Saved Queries</h2>
        <p>{mode === "simple" ? "Friendly labels" : "Raw SQL preview"}</p>
      </div>

      <button type="button" className="recommended-btn" onClick={onRunRecommended}>
        Run Recommended Queries
      </button>
      <button type="button" className="save-query-btn" onClick={onSaveCurrentQuery}>
        Save Current Query
      </button>

      <ul className="action-list">
        {savedQueries.map((query) => (
          <li key={query.id}>
            <button type="button" onClick={() => onRunSavedQuery(query.id)}>
              {mode === "simple" ? query.label : query.sql}
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
