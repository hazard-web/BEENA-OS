import { resolveInteraction } from "@/lib/actions";
import {
  PageHeader,
  SoftButton,
  StatCard,
  TextLink,
  TierBadge,
} from "@/components/ui";
import { readStore } from "@/lib/store";
import { formatDate, memberName, minutesOpen } from "@/lib/utils";

export default async function FounderPage() {
  const store = await readStore();
  const critical = store.interactions.filter(
    (i) => i.tier === "critical" && !i.resolved,
  );
  const beenaResolved = store.interactions.filter(
    (i) => i.handled_by === "tm_beena",
  );

  return (
    <div>
      <PageHeader
        title="Founder"
        actions={<TextLink href="/">Open reporting</TextLink>}
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Open critical" value={String(critical.length)} />
        <StatCard
          label="Handled by Beena"
          value={String(beenaResolved.length)}
        />
      </section>

      <section className="mt-8 space-y-3">
        {critical.length === 0 ? (
          <div className="panel p-2">
            <div className="inset p-8 text-center">
              <p className="font-display text-2xl text-ink">Inbox clear</p>
            </div>
          </div>
        ) : (
          critical.map((item) => (
            <div key={item.id} className="panel bg-rose/5 p-2">
              <div className="inset border border-rose/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{item.subject}</p>
                  <p className="mt-1 text-xs text-slate">
                    From {item.os_source.replace("_", " ")} OS,{" "}
                    {item.member_id
                      ? memberName(store, item.member_id)
                      : "Org-level"}{" "}
                   , {formatDate(item.created_at)}, open{" "}
                    {minutesOpen(item.created_at)}m
                  </p>
                </div>
                <TierBadge tier="critical" />
              </div>
              <form className="mt-3">
                <SoftButton
                  variant="primary"
                  formAction={async () => {
                    "use server";
                    await resolveInteraction(item.id, "tm_beena");
                  }}
                >
                  Resolve as Beena
                </SoftButton>
              </form>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="panel mt-8 p-2">
        <div className="inset p-5">
        <h2 className="font-display text-xl">Roles</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {store.team.map((tm) => (
            <div key={tm.id} className="inset p-3">
              <p className="font-medium">{tm.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-teal">
                {tm.role.replace("_", " ")}
              </p>
            </div>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
