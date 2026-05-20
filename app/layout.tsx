import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HTML Templates Hub | Free HTML Templates Collection',
  description: 'Browse and download free HTML templates. A curated collection of responsive, modern HTML templates for websites.',
  keywords: ['HTML templates', 'free templates', 'website templates', 'responsive templates'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[var(--color-surface-alt)]">
        {children}
      </body>
    </html>
  );
}
