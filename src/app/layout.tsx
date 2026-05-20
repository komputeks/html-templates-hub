import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HTML Templates Hub",
  description: "A collection of 148+ premium HTML templates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
