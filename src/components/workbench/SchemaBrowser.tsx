"use client";

import { useMemo } from "react";
import type { SchemaObject, SchemaObjectType } from "@/lib/resumedb/types";

type SchemaBrowserProps = {
  objects: SchemaObject[];
  search: string;
  onSearchChange: (value: string) => void;
};

const typeOrder: SchemaObjectType[] = ["table", "view", "procedure", "function"];

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
        {typeOrder.map((type) => {
          const nodes = filteredObjects.filter((object) => object.type === type);
          if (!nodes.length) {
            return null;
          }

          return (
            <details key={type} open className="schema-group">
              <summary>{type}</summary>
              <ul>
                {nodes.map((object) => (
                  <li key={object.name}>
                    <h3>{object.name}</h3>
                    <p>{object.description}</p>
                    {object.columns && <small>{object.columns.join(" | ")}</small>}
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
