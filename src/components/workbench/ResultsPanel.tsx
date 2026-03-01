"use client";

import { useMemo } from "react";
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

function nowClock(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function ResultsPanel({ result }: ResultsPanelProps) {
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

  return (
    <section className="wb-action-output" aria-label="Action output">
      <div className="wb-action-output-title">Action Output</div>

      <div className="wb-action-output-table-wrap">
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
      </div>

      <div className="wb-action-placeholders" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
