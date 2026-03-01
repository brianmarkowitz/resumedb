import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeDB | Brian Workbench",
  description:
    "Interactive SQL workbench portfolio styled after a classic desktop database client.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
