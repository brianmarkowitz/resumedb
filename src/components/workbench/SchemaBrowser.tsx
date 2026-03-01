"use client";

import { useMemo } from "react";
import type { SchemaObject } from "@/lib/resumedb/types";

type PresetKey = "onePage" | "skills" | "impact" | "timeline" | "reliability" | "governance";

type SchemaBrowserProps = {
  objects: SchemaObject[];
  search: string;
  panelMode: "schemas" | "administration";
  onSearchChange: (value: string) => void;
  onRunPreset: (preset: PresetKey) => void;
};

function groupByType(objects: SchemaObject[], type: SchemaObject["type"]): SchemaObject[] {
  return objects.filter((object) => object.type === type);
}

export function SchemaBrowser({
  objects,
  search,
  panelMode,
  onSearchChange,
  onRunPreset,
}: SchemaBrowserProps) {
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

  if (panelMode === "administration") {
    return (
      <section className="wb-schema-browser" aria-label="Administration">
        <div className="wb-schema-header">ADMIN TASKS</div>

        <div className="wb-admin-cards">
          <button type="button" onClick={() => onRunPreset("onePage")}>Open one-page profile</button>
          <button type="button" onClick={() => onRunPreset("skills")}>Run skills matrix</button>
          <button type="button" onClick={() => onRunPreset("impact")}>Run impact highlights</button>
          <button type="button" onClick={() => onRunPreset("timeline")}>Run timeline query</button>
          <button type="button" onClick={() => onRunPreset("reliability")}>Run reliability lens</button>
          <button type="button" onClick={() => onRunPreset("governance")}>Run governance lens</button>
        </div>
      </section>
    );
  }

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
                <span className="wb-tree-icon wb-tree-icon--db" />
                <strong>resume_db</strong>
              </summary>

              <ul>
                <li>
                  <details open>
                    <summary>
                      <span className="wb-tree-icon wb-tree-icon--caret" />
                      Tables
                    </summary>
                    <ul>
                      {tables.map((table) => (
                        <li key={table.name}>
                          <span className="wb-tree-icon wb-tree-icon--table" />
                          {table.name}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>

                <li>
                  <details>
                    <summary>
                      <span className="wb-tree-icon wb-tree-icon--caret" />
                      Views
                    </summary>
                    <ul>
                      {views.map((view) => (
                        <li key={view.name}>
                          <span className="wb-tree-icon wb-tree-icon--view" />
                          {view.name}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>

                <li>
                  <details>
                    <summary>
                      <span className="wb-tree-icon wb-tree-icon--caret" />
                      Stored Procedures
                    </summary>
                    <ul>
                      {procedures.map((procedure) => (
                        <li key={procedure.name}>
                          <span className="wb-tree-icon wb-tree-icon--function" />
                          {procedure.name}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>

                <li>
                  <details>
                    <summary>
                      <span className="wb-tree-icon wb-tree-icon--caret" />
                      Functions
                    </summary>
                    <ul>
                      {functions.map((fn) => (
                        <li key={fn.name}>
                          <span className="wb-tree-icon wb-tree-icon--function" />
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
                <span className="wb-tree-icon wb-tree-icon--db" />
                biospec
              </summary>
            </details>
          </li>
        </ul>
      </div>
    </section>
  );
}
