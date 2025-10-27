
import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-white text-gray-900">
        <div className="mx-auto max-w-5xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <a href="/" className="font-semibold">UGC Tool</a>
            <nav className="space-x-4 text-sm">
              <a href="/upload" className="underline">Upload</a>
              <a href="/ugc" className="underline">UGC</a>
              <a href="/admin/moderation" className="underline">Admin</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
