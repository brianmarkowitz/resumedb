"use client";

import { useMemo } from "react";
import type { SchemaObject } from "@/lib/resumedb/types";

type PresetKey = "onePage" | "skills" | "impact" | "timeline" | "reliability" | "governance";

type SchemaBrowserProps = {
  objects: SchemaObject[];
  search: string;
  panelMode: "schemas" | "administration";
  selectedObjectName: string | null;
  onSearchChange: (value: string) => void;
  onRunPreset: (preset: PresetKey) => void;
  onSelectObject: (objectName: string) => void;
  onOpenView: (viewName: string) => void;
};

function groupByType(objects: SchemaObject[], type: SchemaObject["type"]): SchemaObject[] {
  return objects.filter((object) => object.type === type);
}

export function SchemaBrowser({
  objects,
  search,
  panelMode,
  selectedObjectName,
  onSearchChange,
  onRunPreset,
  onSelectObject,
  onOpenView,
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
                          <details>
                            <summary>
                              <span className="wb-tree-icon wb-tree-icon--table" />
                              {table.name}
                            </summary>
                            <ul>
                              {(table.columns ?? []).map((column) => (
                                <li key={`${table.name}_${column}`} className="wb-tree-leaf">
                                  <span className="wb-tree-icon wb-tree-icon--column" />
                                  <span className="wb-tree-label wb-hint-anchor" data-hint={column}>
                                    {column}
                                  </span>
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
                      <span className="wb-tree-icon wb-tree-icon--caret" />
                      Views
                    </summary>
                    <ul>
                      {views.map((view) => (
                        <li key={view.name}>
                          <details>
                            <summary>
                              <span className="wb-tree-icon wb-tree-icon--view" />
                              <button
                                type="button"
                                className={`wb-tree-object-button wb-hint-anchor${selectedObjectName === view.name ? " wb-tree-object-button--selected" : ""}`}
                                data-hint={view.name}
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  onSelectObject(view.name);
                                }}
                                onDoubleClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  onSelectObject(view.name);
                                  onOpenView(view.name);
                                }}
                              >
                                {view.name}
                              </button>
                            </summary>
                            <ul>
                              {(view.columns ?? []).map((column) => (
                                <li key={`${view.name}_${column}`} className="wb-tree-leaf">
                                  <span className="wb-tree-icon wb-tree-icon--column" />
                                  <span className="wb-tree-label wb-hint-anchor" data-hint={column}>
                                    {column}
                                  </span>
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
                      <span className="wb-tree-icon wb-tree-icon--caret" />
                      Stored Procedures
                    </summary>
                    <ul>
                      {procedures.map((procedure) => (
                        <li key={procedure.name}>
                          <details>
                            <summary>
                              <span className="wb-tree-icon wb-tree-icon--function" />
                              {procedure.name}
                            </summary>
                            {procedure.examples?.length ? (
                              <ul>
                                {procedure.examples.map((example) => (
                                  <li key={example} className="wb-tree-leaf">
                                  <span className="wb-tree-icon wb-tree-icon--sql" />
                                    <span className="wb-tree-label wb-hint-anchor" data-hint={example}>
                                      {example}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </details>
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
                        <li key={fn.name} className="wb-tree-leaf">
                          <span className="wb-tree-icon wb-tree-icon--function" />
                          <span className="wb-tree-label wb-hint-anchor" data-hint={fn.name}>
                            {fn.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </section>
  );
}
