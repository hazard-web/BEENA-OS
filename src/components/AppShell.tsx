"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { OS_NAV } from "@/lib/types";
import { resetDemoData } from "@/lib/actions";

export function AppShell({
  children,
  criticalCount,
}: {
  children: React.ReactNode;
  criticalCount: number;
}) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="bg-green text-white lg:min-h-screen">
        <div className="sticky top-0 flex flex-col gap-1 p-3">
          <Link
            href="/"
            scroll
            className="mb-3 rounded-lg px-3 py-3 text-[15px] font-semibold tracking-tight"
          >
            Beena OS
          </Link>

          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {OS_NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  scroll
                  className={`nav-item flex shrink-0 items-center justify-between rounded-lg px-3 py-2.5 text-[13px] ${
                    active
                      ? "bg-white/15 font-semibold text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.href === "/founder" && criticalCount > 0 ? (
                    <span className="ml-2 rounded-md bg-rose px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                      {criticalCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <form action={resetDemoData} className="mt-4 hidden lg:block">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-[12px] text-white/55 hover:bg-white/10 hover:text-white/80"
            >
              Reset demo data
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
