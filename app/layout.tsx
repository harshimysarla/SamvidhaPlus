import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Academic Intelligence Portal (SAIP) | Samvidha Autonomous Portal",
  description: "Next-generation college academic portal with performance analytics, continuous internal evaluation, and predictive academic intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-portal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
