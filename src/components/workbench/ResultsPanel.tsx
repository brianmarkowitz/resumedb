"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { QueryExecutionResult } from "@/lib/resumedb/types";

type ResultsPanelProps = {
  result: QueryExecutionResult | null;
};

type OutputRow = {
  time: string;
  action: string;
  response: string;
  duration: string;
};

type OutputTab = "result" | "plan" | "messages" | "action";

function nowClock(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function toTitleLabel(column: string): string {
  return column
    .replace(/_/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

function formatDateValue(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getColumnClass(column: string): string {
  const normalized = column.toLowerCase();

  if (
    normalized === "metric_value" ||
    normalized === "score" ||
    normalized === "years" ||
    normalized === "level" ||
    normalized === "year"
  ) {
    return "wb-col-numeric";
  }

  if (normalized === "content" || normalized === "evidence" || normalized === "context" || normalized === "rationale" || normalized === "summary") {
    return "wb-col-long";
  }

  if (normalized === "tech_stack" || normalized === "theme_tags") {
    return "wb-col-list";
  }

  if (normalized.endsWith("_date")) {
    return "wb-col-date";
  }

  return "";
}

function renderCellValue(value: unknown, column: string): ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="wb-cell-empty">-</span>;
  }

  const normalized = column.toLowerCase();

  if (typeof value === "number") {
    if (normalized === "year") {
      return String(value);
    }

    return value.toLocaleString("en-US");
  }

  if (Array.isArray(value)) {
    return (
      <div className="wb-cell-list">
        {value.map((item, index) => (
          <span className="wb-cell-tag" key={`${column}_${index}`}>
            {String(item)}
          </span>
        ))}
      </div>
    );
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return <span className="wb-cell-empty">-</span>;
    }

    if (normalized === "tech_stack" || normalized === "theme_tags") {
      const tags = trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (tags.length > 1) {
        return (
          <div className="wb-cell-list">
            {tags.map((tag) => (
              <span className="wb-cell-tag" key={`${column}_${tag}`}>
                {tag}
              </span>
            ))}
          </div>
        );
      }
    }

    if (normalized.endsWith("_date")) {
      return trimmed.toLowerCase() === "present" ? "Present" : formatDateValue(trimmed);
    }

    return trimmed;
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function getResultSignature(result: QueryExecutionResult | null): string {
  if (!result) {
    return "none";
  }

  return [
    result.queryId ?? "ad_hoc",
    result.status,
    result.normalizedSql,
    String(result.rows.length),
    result.messages.join("|"),
  ].join("::");
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [viewOverride, setViewOverride] = useState<{ signature: string; view: OutputTab } | null>(null);

  const resultSignature = getResultSignature(result);
  const defaultView: OutputTab = !result
    ? "action"
    : result.status === "error"
      ? "messages"
      : "result";
  const activeView =
    viewOverride && viewOverride.signature === resultSignature ? viewOverride.view : defaultView;

  const outputRows = useMemo<OutputRow[]>(() => {
    if (!result) {
      return [];
    }

    const responseText =
      result.status === "ok"
        ? `${result.rows.length} row(s)`
        : (result.messages[0] ?? "Error").slice(0, 120);

    return [
      {
        time: nowClock(),
        action: result.queryId ?? "ad-hoc_query",
        response: responseText,
        duration: result.status === "ok" ? "Completed" : "Failed",
      },
    ];
  }, [result]);

  const resultRows = result?.rows ?? [];
  const resultColumns = result?.columns ?? [];
  const explainRows = result?.explainPlan ?? [];
  const messageRows = result?.messages ?? [];

  return (
    <section className="wb-action-output" aria-label="Action output">
      <div className="wb-output-header">
        <label className="sr-only" htmlFor="wb-output-view">
          Output view
        </label>
        <select
          id="wb-output-view"
          className="wb-output-view-select"
          value={activeView}
          onChange={(event) =>
            setViewOverride({ signature: resultSignature, view: event.target.value as OutputTab })
          }
        >
          <option value="action">Action Output</option>
          <option value="result">Result Grid</option>
          <option value="plan">Query Plan</option>
          <option value="messages">Messages</option>
        </select>
      </div>

      <div className="wb-action-output-table-wrap">
        {activeView === "result" && (
          <>
            <div className="wb-result-summary">
              {resultRows.length
                ? `Showing ${resultRows.length.toLocaleString("en-US")} row(s) from resume query output`
                : "Execute a query to load result rows."}
            </div>

            <table className="wb-action-output-table">
              <thead>
                <tr>
                  {resultColumns.length ? (
                    resultColumns.map((column) => (
                      <th key={column} className={getColumnClass(column)}>
                        {toTitleLabel(column)}
                      </th>
                    ))
                  ) : (
                    <th>Result</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {!resultRows.length && (
                  <tr>
                    <td colSpan={Math.max(resultColumns.length, 1)} className="wb-action-empty">
                      Execute a query to load result rows.
                    </td>
                  </tr>
                )}
                {resultRows.slice(0, 30).map((row, index) => (
                  <tr key={`row_${index}`}>
                    {(resultColumns.length ? resultColumns : ["result"]).map((column) => (
                      <td key={`${index}_${column}`} className={getColumnClass(column)}>
                        {renderCellValue(row[column], column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeView === "plan" && (
          <table className="wb-action-output-table">
            <thead>
              <tr>
                <th>Execution Step</th>
              </tr>
            </thead>
            <tbody>
              {!explainRows.length && (
                <tr>
                  <td className="wb-action-empty">No query plan available yet.</td>
                </tr>
              )}
              {explainRows.map((step) => (
                <tr key={step}>
                  <td>{step}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeView === "messages" && (
          <table className="wb-action-output-table">
            <thead>
              <tr>
                <th>Messages</th>
              </tr>
            </thead>
            <tbody>
              {!messageRows.length && (
                <tr>
                  <td className="wb-action-empty">No messages yet.</td>
                </tr>
              )}
              {messageRows.map((message, index) => (
                <tr key={`${index}_${message}`}>
                  <td>{message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeView === "action" && (
          <>
            <table className="wb-action-output-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Response</th>
                  <th>Duration / Fetch Time</th>
                </tr>
              </thead>
              <tbody>
                {!outputRows.length && (
                  <tr>
                    <td colSpan={4} className="wb-action-empty">
                      Waiting for query execution...
                    </td>
                  </tr>
                )}
                {outputRows.map((row) => (
                  <tr key={`${row.time}-${row.action}`}>
                    <td>{row.time}</td>
                    <td>{row.action}</td>
                    <td>{row.response}</td>
                    <td>{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!outputRows.length && (
              <div className="wb-action-skeleton" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
