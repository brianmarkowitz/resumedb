import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const workbenchDisplay = Chakra_Petch({
  variable: "--font-workbench-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const workbenchMono = IBM_Plex_Mono({
  variable: "--font-workbench-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ResumeDB | Brian M. Markowitz",
  description:
    "Interactive SQL workbench portfolio for a principal data architect and data engineering leader.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${workbenchDisplay.variable} ${workbenchMono.variable}`}>{children}</body>
    </html>
  );
}
