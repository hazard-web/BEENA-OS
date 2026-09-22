import { scoreSalesCall } from "@/lib/actions";
import {
  Field,
  PageHeader,
  SoftButton,
  StatCard,
  TierBadge,
  inputClass,
} from "@/components/ui";
import { readStore } from "@/lib/store";
import { formatDate, leadName, teamName } from "@/lib/utils";

export default async function SalesPage() {
  const store = await readStore();
  const closers = store.team.filter((t) => t.role === "sales_closer");
  const beenaCloses = store.sales_calls.filter(
    (c) => c.closer === "tm_beena" && c.outcome === "won",
  ).length;
  const won = store.sales_calls.filter((c) => c.outcome === "won").length;
  const attendedApts = store.appointments.filter(
    (a) => a.status === "attended",
  );

  return (
    <div>
      <PageHeader
        title="Sales"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Closes without Beena"
          value={`${won ? Math.round(((won - beenaCloses) / won) * 100) : 100}%`}
        />
        <StatCard label="Calls scored" value={String(store.sales_calls.length)} />
        <StatCard
          label="Certified closers"
          value={String(closers.filter((c) => c.certified_closer).length)}
        />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-xl">Recent scorecards</h2>
          {store.sales_calls.map((call) => {
            const apt = store.appointments.find(
              (a) => a.id === call.appointment_id,
            );
            const avg =
              Object.values(call.scorecard).reduce((a, b) => a + b, 0) / 5;
            return (
              <div key={call.id} className="panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {apt ? leadName(store, apt.lead_id) : call.appointment_id}
                  </p>
                  {call.escalated ? <TierBadge tier="critical" /> : null}
                </div>
                <p className="mt-1 text-xs text-slate">
                  {teamName(store, call.closer)}, {call.outcome.replace("_", " ")},{" "}
                  scored {formatDate(call.scored_at)}
                </p>
                <div className="mt-3 grid grid-cols-5 gap-1 text-center">
                  {Object.entries(call.scorecard).map(([k, v]) => (
                    <div key={k} className="rounded bg-mist px-1 py-2">
                      <p className="font-display text-lg">{v}</p>
                      <p className="font-mono text-[9px] uppercase text-slate">
                        {k.replace("_", " ")}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate">
                  Avg {avg.toFixed(1)}/5
                  {call.escalation_reason
                    ? `, Escalation: ${call.escalation_reason}`
                    : ""}
                </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <form action={scoreSalesCall} className="panel space-y-3 p-4">
            <h2 className="font-display text-lg">Score a call</h2>
            <Field label="Attended appointment">
              <select name="appointment_id" required className={inputClass}>
                {attendedApts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {leadName(store, a.lead_id)}, {formatDate(a.scheduled_at)}
                  </option>
                ))}
              </select>
            </Field>
            {(
              [
                "discovery",
                "qualification",
                "offer",
                "objection_handling",
                "next_step",
              ] as const
            ).map((field) => (
              <Field key={field} label={field.replace("_", " ")}>
                <input
                  type="number"
                  name={field}
                  min={1}
                  max={5}
                  defaultValue={4}
                  className={inputClass}
                />
              </Field>
            ))}
            <Field label="Outcome">
              <select name="outcome" className={inputClass} defaultValue="follow_up">
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="follow_up">Follow up</option>
              </select>
            </Field>
            <Field label="Amount if won (INR )">
              <input
                name="amount"
                type="number"
                defaultValue={150000}
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-2 text-xs text-slate">
              <input type="checkbox" name="escalated" />
              Escalate to Founder OS
            </label>
            <Field label="Escalation reason">
              <input name="escalation_reason" className={inputClass} />
            </Field>
            <SoftButton variant="primary">Save scorecard</SoftButton>
          </form>

          <div className="panel p-4">
            <h2 className="font-display text-lg">Closer certification</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {closers.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between border-b border-line pb-2 last:border-0"
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-[10px] uppercase text-teal">
                    {c.certified_closer ? "Certified" : "Blocked"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
