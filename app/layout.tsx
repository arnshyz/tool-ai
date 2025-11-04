import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AKAY AI GENERATOR",
  description: "Multi-model AI tool powered by Freepik API"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
