import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bangkok GIS Risk Access Prototype",
  description:
    "Interactive Bangkok GIS map with district boundaries, flood and zoning scenarios, accessibility rings, and story scenes.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
