import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HTML Templates Hub | 147+ Premium HTML Templates",
  description: "Browse and download 147+ premium HTML templates. Free templates for websites, landing pages, dashboards, portfolios, and more.",
  keywords: ["HTML templates", "free templates", "website templates", "landing page", "dashboard", "portfolio"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}