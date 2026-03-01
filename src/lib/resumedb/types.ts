export type QueryMode = "simple" | "pro";

export type QueryStatus = "ok" | "error";

export type Row = Record<string, unknown>;

export type QueryExecutionResult = {
  status: QueryStatus;
  queryId: string | null;
  normalizedSql: string;
  columns: string[];
  rows: Row[];
  messages: string[];
  explainPlan: string[];
};

export type QueryDefinition = {
  id: string;
  simpleLabel: string;
  sqlTemplates: string[];
  matcher: (normalizedSql: string, rawSql: string) => boolean;
  resolverKey: "view" | "procedure";
  resolverName: string;
  args?: Record<string, string>;
};

export type SchemaObjectType = "table" | "view" | "procedure" | "function";

export type SchemaObject = {
  type: SchemaObjectType;
  name: string;
  description: string;
  columns?: string[];
  examples?: string[];
};

export type HistoryItem = {
  id: string;
  timestamp: string;
  queryId: string;
  displayName: string;
  durationMs: number;
  status: QueryStatus;
};

export type SavedQuery = {
  id: string;
  label: string;
  sql: string;
};

export type ResumeDbData = {
  person: Row[];
  skills: Row[];
  roles: Row[];
  projects: Row[];
  achievements: Row[];
  certifications: Row[];
  education: Row[];
  tools: Row[];
  domains: Row[];
};
