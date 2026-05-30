import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { env } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOAFlow | Modern HOA Management",
  description:
    "A premium cloud platform for violation tracking, resident management, inspections, documents, and HOA board administration.",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
