import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { readStore } from "@/lib/store";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Beena OS",
  description: "Success4Coaches operating system",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await readStore();
  const criticalCount = store.interactions.filter(
    (i) => i.tier === "critical" && !i.resolved,
  ).length;

  return (
    <html lang="en" className={`${body.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AppShell criticalCount={criticalCount}>{children}</AppShell>
      </body>
    </html>
  );
}
