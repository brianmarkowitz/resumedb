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
          <path d="M4 2.5h11l5 5v13H4z" fill="#f6f6f8" stroke="#4f515b" strokeWidth="1.2" />
          <path d="M15 2.5v5h5" fill="#e9eaf0" stroke="#4f515b" strokeWidth="1.2" />
          <text x="6.2" y="11.2" fontSize="4.8" fontWeight="700" fill="#42444d">
            SQL
          </text>
          <circle cx="6.3" cy="18.2" r="4.3" fill="#dbdde5" stroke="#4f515b" strokeWidth="1.1" />
          <path d="M6.3 15.8v4.8M3.9 18.2h4.8" stroke="#3b3d46" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "sql-doc":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <path d="M4 2.5h11l5 5v13H4z" fill="#f7f7f9" stroke="#4f515b" strokeWidth="1.2" />
          <path d="M15 2.5v5h5" fill="#ececf2" stroke="#4f515b" strokeWidth="1.2" />
          <text x="6.2" y="11.2" fontSize="4.8" fontWeight="700" fill="#42444d">
            SQL
          </text>
          <path d="M7.3 16.4h6.9M7.3 18.7h8.8" stroke="#6a6c76" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "info":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="#e7e8ee" stroke="#565862" strokeWidth="1.2" />
          <circle cx="12" cy="7.5" r="1.4" fill="#565862" />
          <path d="M12 10.2v6.4" stroke="#565862" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "db-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <ellipse cx="11" cy="6.4" rx="7" ry="3.2" fill="#e8e9ef" stroke="#52545f" strokeWidth="1.2" />
          <path
            d="M4 6.4v8.4c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2V6.4"
            fill="#d7d9e2"
            stroke="#52545f"
            strokeWidth="1.2"
          />
          <path d="M18.5 16.2v5M16 18.7h5" stroke="#3f414a" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "table-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="3" y="3" width="15" height="14" fill="#eceef4" stroke="#52545f" strokeWidth="1.2" />
          <path d="M3 7.6h15M3 12.1h15M8 3v14M13 3v14" stroke="#6a6c76" strokeWidth="1" />
          <circle cx="18.2" cy="17.8" r="4" fill="#dde0e8" stroke="#52545f" strokeWidth="1" />
          <path d="M18.2 15.8v4M16.2 17.8h4" stroke="#3f414a" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "routine-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="3" y="4" width="14" height="12" fill="#eaecf3" stroke="#52545f" strokeWidth="1.2" />
          <path d="M6 8h8M6 11h8" stroke="#6a6c76" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="8" y="17" width="11" height="4.2" rx="1.1" fill="#dfe1e8" stroke="#52545f" strokeWidth="1" />
          <path d="M13.5 17.7v2.8M12.1 19.1h2.8" stroke="#3f414a" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case "table-search":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="2.7" y="3" width="13.2" height="15" fill="#eceef3" stroke="#52545f" strokeWidth="1.2" />
          <path d="M2.7 7.4h13.2M2.7 11.8h13.2M7.1 3v15M11.5 3v15" stroke="#6a6c76" strokeWidth="1" />
          <circle cx="17.3" cy="14.8" r="4.1" fill="none" stroke="#3d414f" strokeWidth="1.5" />
          <path d="M20.3 17.8l2 2" stroke="#3d414f" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "db-sync":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <ellipse cx="10.2" cy="5.8" rx="6" ry="2.8" fill="#e7e8ee" stroke="#52545f" strokeWidth="1.2" />
          <path d="M4.2 5.8v7.3c0 1.6 2.7 2.8 6 2.8s6-1.2 6-2.8V5.8" fill="#d7d9e2" stroke="#52545f" strokeWidth="1.2" />
          <path d="M13.9 17.9h6.4M18.9 15.8l2.1 2.1-2.1 2.1" stroke="#3f414a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.3 20.9H3.9M5.4 18.8l-2.1 2.1 2.1 2.1" stroke="#3f414a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
