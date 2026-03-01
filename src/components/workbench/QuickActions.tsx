"use client";

import type { QueryMode, SavedQuery } from "@/lib/resumedb/types";

type QuickActionsProps = {
  mode: QueryMode;
  savedQueries: SavedQuery[];
  onRunSavedQuery: (savedQueryId: string) => void;
  onSaveCurrentQuery: () => void;
  onRunRecommended: () => void;
};

export function QuickActions({
  mode,
  savedQueries,
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
    </section>
  );
}
