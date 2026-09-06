import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BharatStore — Secure Digital Commerce & Management Platform',
  description: 'Unified digital commerce, inventory, GST invoicing, and POS engine for Indian small businesses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
