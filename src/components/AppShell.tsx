export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="bg-green text-white lg:min-h-screen">
        <div className="sticky top-0 p-3">
          <p className="px-3 py-3 text-[15px] font-semibold tracking-tight">
            Beena OS
          </p>
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
