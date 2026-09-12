import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jb-mono',
});

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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="h-full antialiased font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
