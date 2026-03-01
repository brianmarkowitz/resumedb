"use client";

import { useMemo } from "react";
import type { SchemaObject } from "@/lib/resumedb/types";

type SchemaBrowserProps = {
  objects: SchemaObject[];
  search: string;
  onSearchChange: (value: string) => void;
};

function groupByType(objects: SchemaObject[], type: SchemaObject["type"]): SchemaObject[] {
  return objects.filter((object) => object.type === type);
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

  const tables = groupByType(filteredObjects, "table");
  const views = groupByType(filteredObjects, "view");
  const procedures = groupByType(filteredObjects, "procedure");
  const functions = groupByType(filteredObjects, "function");

  return (
    <section className="wb-schema-browser" aria-label="Schema browser">
      <div className="wb-schema-header">SCHEMAS</div>

      <label className="wb-schema-search">
        <span className="sr-only">Filter schema objects</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Filter objects"
        />
      </label>

      <div className="wb-schema-tree-wrap">
        <ul className="wb-schema-tree">
          <li>
            <details open>
              <summary>
                <span className="wb-tree-icon">🛢</span>
                <strong>resume_db</strong>
              </summary>

              <ul>
                <li>
                  <details open>
                    <summary>
                      <span className="wb-tree-icon">▸</span>
                      Tables
                    </summary>
                    <ul>
                      {tables.map((table) => (
                        <li key={table.name}>
                          <details>
                            <summary>
                              <span className="wb-tree-icon">▦</span>
                              {table.name}
                            </summary>
                            <ul className="wb-column-list">
                              {(table.columns ?? []).map((column) => (
                                <li key={`${table.name}-${column}`}>
                                  <span className="wb-tree-icon">◦</span>
                                  {column}
                                </li>
                              ))}
                            </ul>
                          </details>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>

                <li>
                  <details open>
                    <summary>
                      <span className="wb-tree-icon">▸</span>
                      Views
                    </summary>
                    <ul>
                      {views.map((view) => (
                        <li key={view.name}>
                          <details>
                            <summary>
                              <span className="wb-tree-icon">◫</span>
                              {view.name}
                            </summary>
                            <ul className="wb-column-list">
                              {(view.columns ?? []).map((column) => (
                                <li key={`${view.name}-${column}`}>
                                  <span className="wb-tree-icon">◦</span>
                                  {column}
                                </li>
                              ))}
                            </ul>
                          </details>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>

                <li>
                  <details>
                    <summary>
                      <span className="wb-tree-icon">▸</span>
                      Stored Procedures
                    </summary>
                    <ul>
                      {procedures.map((procedure) => (
                        <li key={procedure.name}>
                          <span className="wb-tree-icon">ƒ</span>
                          {procedure.name}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>

                <li>
                  <details>
                    <summary>
                      <span className="wb-tree-icon">▸</span>
                      Functions
                    </summary>
                    <ul>
                      {functions.map((fn) => (
                        <li key={fn.name}>
                          <span className="wb-tree-icon">ƒ</span>
                          {fn.name}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              </ul>
            </details>
          </li>

          <li>
            <details>
              <summary>
                <span className="wb-tree-icon">🛢</span>
                biospec
              </summary>
            </details>
          </li>
        </ul>
      </div>
    </section>
  );
}
