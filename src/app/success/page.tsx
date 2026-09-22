import { refreshHealthScores } from "@/lib/actions";
import {
  HealthBadge,
  PageHeader,
  SoftButton,
  StatCard,
} from "@/components/ui";
import { readStore } from "@/lib/store";
import { teamName } from "@/lib/utils";

export default async function SuccessPage() {
  const store = await readStore();
  const atRisk = store.members.filter((m) => m.health_status === "at_risk");

  return (
    <div>
      <PageHeader
        title="Client success"
        actions={
          <form>
            <SoftButton
              variant="primary"
              formAction={async () => {
                "use server";
                await refreshHealthScores();
              }}
            >
              Recalculate health
            </SoftButton>
          </form>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="On track"
          value={String(
            store.members.filter((m) => m.health_status === "on_track").length,
          )}
        />
        <StatCard
          label="Needs intervention"
          value={String(
            store.members.filter(
              (m) => m.health_status === "needs_intervention",
            ).length,
          )}
        />
        <StatCard label="At risk" value={String(atRisk.length)} />
      </section>

      <div className="mt-8 grid gap-3">
        {store.members.map((m) => (
          <div key={m.id} className="panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="mt-1 text-xs text-slate">
                  Stage {m.stage}, {m.program.replace("_", " ")}, Coach{" "}
                  {teamName(store, m.coach_assigned)}, Payment{" "}
                  {m.payment_status}
                </p>
              </div>
              <div className="text-right">
                <HealthBadge status={m.health_status} />
                <p className="mt-2 font-display text-2xl text-ink">
                  {m.health_score}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md bg-mist px-2 py-2">
                <p className="font-display text-lg">{m.attendance_rate}</p>
                <p className="text-slate">Attendance</p>
              </div>
              <div className="rounded-md bg-mist px-2 py-2">
                <p className="font-display text-lg">{m.engagement_score}</p>
                <p className="text-slate">Engagement</p>
              </div>
              <div className="rounded-md bg-mist px-2 py-2">
                <p className="font-display text-lg">{m.implementation_score}</p>
                <p className="text-slate">Implementation</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
