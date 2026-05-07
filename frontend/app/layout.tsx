import type { Metadata } from "next";
import "./globals.css";
import AppFooter from "@/components/layout/AppFooter";

export const metadata: Metadata = {
  title: "MedInsight AI",
  description: "Smart Medical Report Analysis System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <AppFooter />
        </div>
      </body>
    </html>
  );
}