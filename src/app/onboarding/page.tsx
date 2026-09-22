import { advanceOnboarding } from "@/lib/actions";
import { PageHeader, SoftButton, StatCard } from "@/components/ui";
import { readStore } from "@/lib/store";
import { formatDate, teamName } from "@/lib/utils";

const DAYS = [
  "Access + welcome",
  "Expectations",
  "How to ask for help",
  "Track progress",
  "Who to contact",
  "First implementation",
  "Week-1 check-in",
];

export default async function OnboardingPage() {
  const store = await readStore();
  const complete = store.members.filter(
    (m) => m.onboarding_status === "complete",
  ).length;

  return (
    <div>
      <PageHeader
        title="Onboarding"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Members" value={String(store.members.length)} />
        <StatCard
          label="Onboarding complete"
          value={`${
            store.members.length
              ? Math.round((complete / store.members.length) * 100)
              : 0
          }%`}
        />
        <StatCard
          label="In progress"
          value={String(
            store.members.filter((m) => m.onboarding_status === "in_progress")
              .length,
          )}
        />
      </section>

      <div className="mt-8 grid gap-3">
        {store.members.map((m) => (
          <div key={m.id} className="panel p-2">
            <div className="inset p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="mt-1 text-xs text-slate">
                  Joined {formatDate(m.joined_at)}, Coach{" "}
                  {teamName(store, m.coach_assigned)},{" "}
                  {m.program.replace("_", " ")}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-teal">
                  Day {m.onboarding_day}/7, {m.onboarding_status.replace("_", " ")}
                </p>
              </div>
              {m.onboarding_status !== "complete" ? (
                <form>
                  <SoftButton
                    variant="primary"
                    formAction={async () => {
                      "use server";
                      await advanceOnboarding(m.id);
                    }}
                  >
                    Complete day {m.onboarding_day} nudge
                  </SoftButton>
                </form>
              ) : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {DAYS.map((label, i) => {
                const done = m.onboarding_day > i || m.onboarding_status === "complete";
                const current = m.onboarding_day === i + 1 && !done;
                return (
                  <div
                    key={label}
                    className={`control px-2 py-2 text-[11px] ${
                      done
                        ? "bg-sage/10 text-ink shadow-[var(--shadow-border)]"
                        : current
                          ? "bg-teal/10 text-ink shadow-[var(--shadow-border)]"
                          : "bg-white text-slate shadow-[var(--shadow-border)]"
                    }`}
                  >
                    <p className="font-mono text-[9px]">D{i + 1}</p>
                    <p className="mt-1 leading-snug">{label}</p>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
