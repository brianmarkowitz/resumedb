"use client";

type ToolbarIconName =
  | "sql-plus"
  | "sql-doc"
  | "info"
  | "db-plus"
  | "table-plus"
  | "routine-plus"
  | "table-search"
  | "db-sync"
  | "editor-folder"
  | "editor-save"
  | "editor-bolt"
  | "editor-bolt-alt"
  | "editor-clean";

type ToolbarIconProps = {
  name: ToolbarIconName;
};

export function ToolbarIcon({ name }: ToolbarIconProps) {
  switch (name) {
    case "sql-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <path d="M5 2.2h10.2l4 4.2v13H5z" fill="#f7f7f8" stroke="#4d4f57" strokeWidth="1.2" />
          <path d="M15.2 2.2v4.4h4" fill="#ececef" stroke="#4d4f57" strokeWidth="1.2" />
          <text x="6.5" y="10.5" fontSize="4.5" fontWeight="700" fill="#3f4148">
            SQL
          </text>
          <circle cx="6.1" cy="18.1" r="3.9" fill="#d8d9df" stroke="#4d4f57" strokeWidth="1.1" />
          <path d="M6.1 15.8v4.6M3.8 18.1h4.6" stroke="#3f4148" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      );
    case "sql-doc":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <path d="M3.8 5h9.2l3.5 3.5v10.8h-12.7z" fill="#ececef" stroke="#4d4f57" strokeWidth="1.05" />
          <path d="M6.2 2.2h10l3.8 4v12.1h-1.4V6.8h-3.8V2.2z" fill="#f8f8fa" stroke="#4d4f57" strokeWidth="1.2" />
          <path d="M16.2 2.2v4.6h3.8" fill="#ebecf0" stroke="#4d4f57" strokeWidth="1.2" />
          <text x="7.4" y="10.2" fontSize="4.3" fontWeight="700" fill="#3f4148">
            SQL
          </text>
          <path d="M7.3 13.2h7.8M7.3 15.6h8.9" stroke="#666872" strokeWidth="1.15" strokeLinecap="round" />
        </svg>
      );
    case "info":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="9.4" y="4.1" width="10" height="11.6" fill="#eceef3" stroke="#4d4f57" strokeWidth="1.1" />
          <path d="M11.2 7.2h6.4M11.2 9.6h6.4M11.2 12h6.4" stroke="#686b75" strokeWidth="1.05" strokeLinecap="round" />
          <ellipse cx="8" cy="4.7" rx="4.2" ry="1.8" fill="#e8eaf0" stroke="#4d4f57" strokeWidth="1.1" />
          <path d="M3.8 4.7v3.8c0 1 1.9 1.8 4.2 1.8s4.2-.8 4.2-1.8V4.7" fill="#d9dce5" stroke="#4d4f57" strokeWidth="1.1" />
          <circle cx="6.2" cy="16.8" r="4.2" fill="#d8d9df" stroke="#4d4f57" strokeWidth="1.1" />
          <circle cx="6.2" cy="15.2" r="0.9" fill="#43464e" />
          <path d="M6.2 16.9v2.2" stroke="#43464e" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "db-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <ellipse cx="11.8" cy="5.7" rx="6.6" ry="2.8" fill="#ebedf2" stroke="#4d4f57" strokeWidth="1.2" />
          <path
            d="M5.2 5.7v8c0 1.6 3 2.9 6.6 2.9s6.6-1.3 6.6-2.9v-8"
            fill="#d8dbe4"
            stroke="#4d4f57"
            strokeWidth="1.2"
          />
          <circle cx="6.1" cy="17.9" r="3.8" fill="#d8d9df" stroke="#4d4f57" strokeWidth="1.1" />
          <path d="M6.1 15.7v4.4M3.9 17.9h4.4" stroke="#3e4148" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "table-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="3.2" y="3.3" width="14.8" height="14" fill="#eceef3" stroke="#4d4f57" strokeWidth="1.2" />
          <path d="M3.2 7.9h14.8M3.2 12.5h14.8M7.9 3.3v14M12.6 3.3v14" stroke="#6a6c76" strokeWidth="1" />
          <circle cx="6.2" cy="18" r="3.8" fill="#d8d9df" stroke="#4d4f57" strokeWidth="1.1" />
          <path d="M6.2 15.9v4.2M4.1 18h4.2" stroke="#3e4148" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case "routine-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="3.2" y="3.2" width="15.4" height="14.2" fill="#eceef3" stroke="#4d4f57" strokeWidth="1.2" />
          <rect x="5.2" y="5.2" width="4.5" height="3.5" fill="#d9dce5" stroke="#6a6c76" strokeWidth="0.8" />
          <rect x="10.6" y="5.2" width="6" height="10.2" fill="#d9dce5" stroke="#6a6c76" strokeWidth="0.8" />
          <circle cx="6.1" cy="18" r="3.8" fill="#d8d9df" stroke="#4d4f57" strokeWidth="1.1" />
          <path d="M6.1 15.9v4.2M4 18h4.2" stroke="#3e4148" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case "table-search":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="3.1" y="3.2" width="12.8" height="14.8" fill="#eceef3" stroke="#4d4f57" strokeWidth="1.2" />
          <path d="M3.1 7.8h12.8M3.1 12.4h12.8M7.3 3.2v14.8M11.5 3.2v14.8" stroke="#6a6c76" strokeWidth="1" />
          <circle cx="17.8" cy="15.5" r="4.2" fill="#f4f4f7" stroke="#3f424b" strokeWidth="1.3" />
          <path d="M20.8 18.6 22.5 20.3" stroke="#3f424b" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "db-sync":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <ellipse cx="11.2" cy="5.6" rx="5.5" ry="2.4" fill="#ebedf2" stroke="#4d4f57" strokeWidth="1.2" />
          <path d="M5.7 5.6v6.9c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V5.6" fill="#d8dbe4" stroke="#4d4f57" strokeWidth="1.2" />
          <path d="M4 18.6h7.5" stroke="#3f424b" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M5.8 16.8 4 18.6l1.8 1.8" stroke="#3f424b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 21H12.5" stroke="#3f424b" strokeWidth="1.2" strokeLinecap="round" />
          <path d="m18.2 19.2 1.8 1.8-1.8 1.8" stroke="#3f424b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "editor-folder":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <path d="M2.5 7h7l1.8-2h10.2v13.4H2.5z" fill="#8ec0e4" stroke="#3f6786" strokeWidth="1.2" />
          <path d="M2.5 9.3h19" stroke="#6e9fc2" strokeWidth="1.1" />
        </svg>
      );
    case "editor-save":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="1.5" fill="#8ba6c6" stroke="#3f5571" strokeWidth="1.2" />
          <rect x="6" y="5.5" width="12" height="5" fill="#dfe8f2" />
          <rect x="8" y="13" width="8" height="6" fill="#f5f7fb" stroke="#5c6e84" strokeWidth="0.9" />
          <rect x="15.7" y="5.7" width="1.9" height="3.8" fill="#4d617b" />
        </svg>
      );
    case "editor-bolt":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <path d="M13.6 2.8 5.7 13h5l-1.2 8.1L18 11h-4.8z" fill="#f2d86d" stroke="#967516" strokeWidth="1.2" />
        </svg>
      );
    case "editor-bolt-alt":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <path d="M12.7 3.5 6.6 11.8h4l-1 6.8L16.8 10h-4z" fill="#f3dd79" stroke="#967516" strokeWidth="1.1" />
          <circle cx="17.7" cy="16.9" r="4.1" fill="#d6e4f5" stroke="#5d7da0" strokeWidth="1" />
          <path d="M17.7 14.9v3.9M15.8 16.9h3.9" stroke="#4d6f94" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "editor-clean":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <path d="M6 17.8 15.2 8.6l2.8 2.8-9.2 9.2H6z" fill="#d4a66a" stroke="#7d5a32" strokeWidth="1.1" />
          <path d="M15.2 8.6 17.8 6l3 3-2.8 2.4" fill="#f0d2a2" stroke="#7d5a32" strokeWidth="1.1" />
          <path d="M4.3 20.4h7.8" stroke="#7d5a32" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
