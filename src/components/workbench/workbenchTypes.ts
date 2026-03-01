import type { QueryExecutionResult } from "@/lib/resumedb/types";

export type QueryTab = {
  id: string;
  title: string;
  sql: string;
  status: "idle" | "ok" | "error";
  result: QueryExecutionResult | null;
};
