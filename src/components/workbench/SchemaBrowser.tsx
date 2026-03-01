"use client";

import { useMemo } from "react";
import type { SchemaObject, SchemaObjectType } from "@/lib/resumedb/types";

type SchemaBrowserProps = {
  objects: SchemaObject[];
  search: string;
  onSearchChange: (value: string) => void;
};

const typeOrder: SchemaObjectType[] = ["table", "view", "procedure", "function"];

const typeMeta: Record<SchemaObjectType, { label: string; chip: string }> = {
  table: { label: "Tables", chip: "TBL" },
  view: { label: "Views", chip: "VW" },
  procedure: { label: "Stored Procedures", chip: "PROC" },
  function: { label: "Functions", chip: "FN" },
};

function inferColumnType(columnName: string): string {
  const normalized = columnName.toLowerCase();

  if (normalized === "id" || normalized.endsWith("_id")) {
    return "UUID";
  }
  if (normalized.includes("date") || normalized.includes("year") || normalized.includes("time")) {
    return "TIMESTAMP";
  }
  if (
    normalized.includes("count") ||
    normalized.includes("level") ||
    normalized.includes("years") ||
    normalized.includes("score") ||
    normalized.includes("metric_value")
  ) {
    return "INTEGER";
  }
  if (normalized.startsWith("is_") || normalized.startsWith("has_")) {
    return "BOOLEAN";
  }
  if (normalized.includes("tags") || normalized.includes("stack") || normalized.includes("tools")) {
    return "TEXT[]";
  }

  return "TEXT";
}

function inferColumnFlags(columnName: string): string {
  const normalized = columnName.toLowerCase();

  if (normalized === "id") {
    return "PK";
  }
  if (normalized.endsWith("_id")) {
    return "FK";
  }
  if (normalized.includes("date") || normalized.includes("year")) {
    return "IDX";
  }

  return "-";
}

export function SchemaBrowser({ objects, search, onSearchChange }: SchemaBrowserProps) {
  const filteredObjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return objects;
    }

    return objects.filter((object) => {
      const target = `${object.name} ${object.description} ${(object.columns ?? []).join(" ")}`.toLowerCase();
      return target.includes(normalizedSearch);
    });
  }, [objects, search]);

  return (
    <section className="panel schema-browser" aria-label="Schema browser">
      <div className="panel__header">
        <h2>Schema Browser</h2>
        <p>resume_db</p>
      </div>

      <label className="search-field">
        <span>Data Catalog Search</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="tables, views, functions..."
        />
      </label>

      <div className="schema-groups">
        {!filteredObjects.length && (
          <p className="schema-empty">No schema objects match this search filter.</p>
        )}

        {typeOrder.map((type) => {
          const nodes = filteredObjects.filter((object) => object.type === type);
          if (!nodes.length) {
            return null;
          }

          return (
            <details key={type} open className="schema-type-group">
              <summary className="schema-type-summary">
                <span>{typeMeta[type].label}</span>
                <span className="schema-type-count">{nodes.length}</span>
              </summary>
              <ul className="schema-object-list">
                {nodes.map((object) => (
                  <li key={object.name} className="schema-object-item">
                    <details open={type === "table" || type === "view"} className="schema-object">
                      <summary className="schema-object-summary">
                        <span className={`schema-object-chip schema-object-chip--${type}`}>
                          {typeMeta[type].chip}
                        </span>
                        <span className="schema-object-name">{object.name}</span>
                        <span className="schema-object-count">
                          {object.columns?.length ? `${object.columns.length} columns` : "Executable"}
                        </span>
                      </summary>
                      <div className="schema-object-body">
                        <p className="schema-object-description">{object.description}</p>

                        {object.columns?.length ? (
                          <div className="schema-columns-wrap">
                            <table className="schema-columns-table">
                              <thead>
                                <tr>
                                  <th>Column</th>
                                  <th>Type</th>
                                  <th>Attr</th>
                                </tr>
                              </thead>
                              <tbody>
                                {object.columns.map((column) => (
                                  <tr key={`${object.name}-${column}`}>
                                    <td>{column}</td>
                                    <td>{inferColumnType(column)}</td>
                                    <td>{inferColumnFlags(column)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="schema-empty-columns">No column projection for this object type.</p>
                        )}

                        {object.examples?.length ? (
                          <div className="schema-example-block">
                            <p>Example</p>
                            <code>{object.examples[0]}</code>
                          </div>
                        ) : null}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
