import { createInteraction, resolveInteraction } from "@/lib/actions";
import {
  Field,
  PageHeader,
  SoftButton,
  StatCard,
  TierBadge,
  inputClass,
} from "@/components/ui";
import { readStore } from "@/lib/store";
import {
  formatDate,
  isPastSla,
  memberName,
  minutesOpen,
  teamName,
} from "@/lib/utils";

export default async function CommunityPage() {
  const store = await readStore();
  const open = store.interactions.filter((i) => !i.resolved);
  const breaches = open.filter((i) =>
    isPastSla(i.created_at, i.sla_minutes),
  );
  const withinSla = store.interactions.filter(
    (i) =>
      i.resolved &&
      (i.response_time_minutes ?? 9999) <= i.sla_minutes,
  );

  return (
    <div>
      <PageHeader
        title="Community"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Open questions" value={String(open.length)} />
        <StatCard
          label="SLA breaches"
          value={String(breaches.length)}
        />
        <StatCard
          label="Answered within SLA"
          value={`${
            store.interactions.filter((i) => i.resolved).length
              ? Math.round(
                  (withinSla.length /
                    store.interactions.filter((i) => i.resolved).length) *
                    100,
                )
              : 0
          }%`}
        />
      </section>

      {breaches.length > 0 ? (
        <div className="panel mt-4 bg-rose/5 p-2 text-sm">
          <div className="inset border border-rose/30 bg-rose/5 p-3">
            <p className="font-medium text-rose">
              {breaches.length} past SLA
            </p>
          </div>
        </div>
      ) : null}

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {store.interactions.map((item) => {
            const breach =
              !item.resolved && isPastSla(item.created_at, item.sla_minutes);
            return (
              <div
                key={item.id}
                className={`panel p-2 ${breach ? "bg-rose/5" : ""}`}
              >
                <div
                  className={`inset p-3 ${breach ? "border border-rose/40" : ""}`}
                >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.subject}</p>
                    <p className="mt-1 text-xs text-slate">
                      {item.member_id
                        ? memberName(store, item.member_id)
                        : "No member"}{" "}
                     , {item.channel}, opened {formatDate(item.created_at)}
                    </p>
                  </div>
                  <TierBadge tier={item.tier} />
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-slate">
                  {item.resolved
                    ? `Resolved by ${teamName(store, item.handled_by)} in ${item.response_time_minutes}m`
                    : `${minutesOpen(item.created_at)}m open, SLA ${item.sla_minutes}m${breach ? ", BREACH" : ""}`}
                </p>
                {!item.resolved ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    <form>
                      <SoftButton
                        formAction={async () => {
                          "use server";
                          await resolveInteraction(item.id, "tm_neha");
                        }}
                      >
                        Resolve as Neha
                      </SoftButton>
                    </form>
                    <form>
                      <SoftButton
                        formAction={async () => {
                          "use server";
                          await resolveInteraction(item.id, "tm_ravi");
                        }}
                      >
                        Resolve as Ravi
                      </SoftButton>
                    </form>
                    {item.tier === "critical" ? (
                      <form>
                        <SoftButton
                          variant="danger"
                          formAction={async () => {
                            "use server";
                            await resolveInteraction(item.id, "tm_beena");
                          }}
                        >
                          Beena handled
                        </SoftButton>
                      </form>
                    ) : null}
                  </div>
                ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <form action={createInteraction} className="panel h-fit p-2">
          <div className="inset space-y-3 p-4">
          <h2 className="font-display text-lg">Log question</h2>
          <Field label="Subject">
            <input name="subject" required className={inputClass} />
          </Field>
          <Field label="Member">
            <select name="member_id" className={inputClass} defaultValue="">
              <option value="">-</option>
              {store.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Channel">
            <select name="channel" className={inputClass} defaultValue="community">
              <option value="community">Community</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
          </Field>
          <Field label="Tier">
            <select name="tier" className={inputClass} defaultValue="routine">
              <option value="routine">Routine</option>
              <option value="complex">Complex</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <SoftButton variant="primary">Create + triage</SoftButton>
          </div>
        </form>
      </section>
    </div>
  );
}
