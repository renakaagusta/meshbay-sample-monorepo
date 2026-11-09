import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "meshbay-sample-monorepo",
  description: "pnpm workspace sample for the Meshbay vs Railway test",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
