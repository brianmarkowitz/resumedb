"use client";

type ToolbarIconName =
  | "sql-plus"
  | "sql-doc"
  | "info"
  | "db-plus"
  | "table-plus"
  | "relation-plus"
  | "function-plus"
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
          <path d="M4.7 2.3h10.4l3.6 3.6v14.8H4.7z" fill="#f7f8fb" stroke="#474a52" strokeWidth="1.15" />
          <path d="M15.1 2.3v3.8h3.6" fill="#e8ebf1" stroke="#474a52" strokeWidth="1.15" />
          <text x="6.3" y="9.9" fontSize="4.2" fontWeight="700" fill="#363942">
            SQL
          </text>
          <path d="M6.7 12h9M6.7 14.1h9M6.7 16.2h6.8" stroke="#646874" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="5.5" cy="18.4" r="3.6" fill="#d3d5dd" stroke="#464951" strokeWidth="1.1" />
          <path d="M5.5 16.5v3.8M3.6 18.4h3.8" stroke="#353840" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "sql-doc":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <path d="M3.6 4.8h10.1l3.2 3.2v11.3H3.6z" fill="#e2e4eb" stroke="#474a52" strokeWidth="1.05" />
          <path d="M7.1 2.2h10.1l3.2 3.3v14.1H7.1z" fill="#f8f9fb" stroke="#474a52" strokeWidth="1.15" />
          <path d="M17.2 2.2v3.5h3.2" fill="#eaedf2" stroke="#474a52" strokeWidth="1.15" />
          <text x="8.2" y="9.2" fontSize="3.8" fontWeight="700" fill="#373a43">
            SQL
          </text>
          <path d="M8.7 11.3h8M8.7 13.5h8M8.7 15.7h8" stroke="#666a75" strokeWidth="0.95" strokeLinecap="round" />
        </svg>
      );
    case "info":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <ellipse cx="8.1" cy="4.6" rx="3.9" ry="1.7" fill="#eceef3" stroke="#474a52" strokeWidth="1.1" />
          <path d="M4.2 4.6v4.2c0 1 1.7 1.8 3.9 1.8s3.9-.8 3.9-1.8V4.6" fill="#d9dce5" stroke="#474a52" strokeWidth="1.1" />
          <rect x="10.9" y="3.7" width="8.5" height="10.8" fill="#eceff4" stroke="#474a52" strokeWidth="1.1" />
          <path d="M12.3 6.3h5.8M12.3 8.6h5.8M12.3 10.9h5.8" stroke="#686c77" strokeWidth="1" strokeLinecap="round" />
          <circle cx="6" cy="17.6" r="3.6" fill="#d3d5dd" stroke="#464951" strokeWidth="1.1" />
          <circle cx="6" cy="16.2" r="0.8" fill="#353840" />
          <path d="M6 17.4v2" stroke="#353840" strokeWidth="1.15" strokeLinecap="round" />
        </svg>
      );
    case "db-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <ellipse cx="12" cy="5.3" rx="6.4" ry="2.5" fill="#eceef3" stroke="#474a52" strokeWidth="1.15" />
          <path
            d="M5.6 5.3v8.1c0 1.4 2.9 2.6 6.4 2.6s6.4-1.2 6.4-2.6V5.3"
            fill="#d7dae3"
            stroke="#474a52"
            strokeWidth="1.15"
          />
          <path d="M5.6 9c1 .9 3.6 1.5 6.4 1.5s5.4-.6 6.4-1.5" fill="none" stroke="#666a76" strokeWidth="0.95" />
          <circle cx="5.9" cy="17.7" r="3.6" fill="#d3d5dd" stroke="#464951" strokeWidth="1.1" />
          <path d="M5.9 15.8v3.8M4 17.7h3.8" stroke="#353840" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "table-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="3.1" y="3.1" width="14.6" height="13.8" fill="#eceef3" stroke="#474a52" strokeWidth="1.15" />
          <path d="M3.1 7.7h14.6M3.1 12.3h14.6M7.8 3.1v13.8M12.4 3.1v13.8" stroke="#666a76" strokeWidth="0.95" />
          <circle cx="6.1" cy="17.7" r="3.6" fill="#d3d5dd" stroke="#464951" strokeWidth="1.1" />
          <path d="M6.1 15.8v3.8M4.2 17.7H8" stroke="#353840" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "relation-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="3.1" y="4.2" width="9.8" height="8.8" fill="#e8eaf0" stroke="#474a52" strokeWidth="1.1" />
          <rect x="10.2" y="2.8" width="10.4" height="9.6" fill="#eceef3" stroke="#474a52" strokeWidth="1.1" />
          <path d="M4.8 6.8h6.4M4.8 9h6.4M11.7 5.2h7.1M11.7 7.4h7.1" stroke="#666a76" strokeWidth="0.9" />
          <path d="M10.1 9.2 8.6 10.5" stroke="#474a52" strokeWidth="1.05" strokeLinecap="round" />
          <circle cx="6" cy="17.7" r="3.6" fill="#d3d5dd" stroke="#464951" strokeWidth="1.1" />
          <path d="M6 15.8v3.8M4.1 17.7h3.8" stroke="#353840" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "function-plus":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="3.4" y="4.1" width="16.8" height="12.1" rx="1" fill="#eceef3" stroke="#474a52" strokeWidth="1.15" />
          <text x="7.5" y="12.3" fontSize="5.8" fontWeight="700" fill="#40434c">
            f()
          </text>
          <path d="M5.6 7.4h12.3" stroke="#666a76" strokeWidth="0.9" />
          <circle cx="6.1" cy="17.7" r="3.6" fill="#d3d5dd" stroke="#464951" strokeWidth="1.1" />
          <path d="M6.1 15.8v3.8M4.2 17.7H8" stroke="#353840" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "table-search":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <rect x="3.1" y="2.7" width="12.8" height="14.9" fill="#eceef3" stroke="#474a52" strokeWidth="1.15" />
          <path d="M3.1 7.2h12.8M3.1 11.8h12.8M7.3 2.7v14.9M11.6 2.7v14.9" stroke="#666a76" strokeWidth="0.92" />
          <circle cx="17.4" cy="14.6" r="3.8" fill="#f7f8fb" stroke="#3f424b" strokeWidth="1.25" />
          <path d="M20.1 17.3 22.2 19.4" stroke="#3f424b" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M16 14.6h2.8M17.4 13.2v2.8" stroke="#555861" strokeWidth="0.95" />
        </svg>
      );
    case "db-sync":
      return (
        <svg viewBox="0 0 24 24" className="wb-tool-icon" aria-hidden="true">
          <ellipse cx="12" cy="5.4" rx="5.2" ry="2.3" fill="#eceef3" stroke="#474a52" strokeWidth="1.15" />
          <path d="M6.8 5.4v6.2c0 1.3 2.3 2.3 5.2 2.3s5.2-1 5.2-2.3V5.4" fill="#d7dae3" stroke="#474a52" strokeWidth="1.15" />
          <path d="M6.8 8.5c.8.8 2.9 1.3 5.2 1.3s4.4-.5 5.2-1.3" fill="none" stroke="#666a76" strokeWidth="0.9" />
          <path d="M4.2 19.1c1.2-1.4 2.6-2.1 4.6-2.1" stroke="#3f424b" strokeWidth="1.1" fill="none" />
          <path d="m5.1 16.9-1.8 2.2 2.5.8" fill="none" stroke="#3f424b" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.8 20.6c-1.2 1.4-2.6 2.1-4.6 2.1" stroke="#3f424b" strokeWidth="1.1" fill="none" />
          <path d="m18.9 22.8 1.8-2.2-2.5-.8" fill="none" stroke="#3f424b" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
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
