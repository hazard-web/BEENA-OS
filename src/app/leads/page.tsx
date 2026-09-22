import { qualifyLead } from "@/lib/actions";
import {
  DataPanel,
  PageHeader,
  SoftButton,
  StatCard,
} from "@/components/ui";
import { readStore } from "@/lib/store";
import { campaignName, relativeHours, teamName } from "@/lib/utils";

export default async function LeadsPage() {
  const store = await readStore();
  const nurtured = store.leads.filter(
    (l) =>
      relativeHours(l.last_touch_date) <= 24 ||
      ["won", "lost"].includes(l.current_stage),
  );
  const stale = store.leads.filter(
    (l) =>
      !["won", "lost"].includes(l.current_stage) &&
      relativeHours(l.last_touch_date) > 24,
  );

  return (
    <div>
      <PageHeader title="Leads" />

      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Touched under 24h"
          value={`${Math.round((nurtured.length / store.leads.length) * 100)}%`}
        />
        <StatCard label="Stale" value={String(stale.length)} />
        <StatCard
          label="Qualified"
          value={String(
            store.leads.filter((l) => l.qualification_status === "qualified")
              .length,
          )}
        />
      </section>

      <DataPanel title="Leads" meta={`${store.leads.length} people`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="table-head">
              <tr>
                <th>Person</th>
                <th>Campaign</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Setter</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.leads.map((lead) => {
                const staleLead =
                  !["won", "lost"].includes(lead.current_stage) &&
                  relativeHours(lead.last_touch_date) > 24;
                const pill =
                  lead.qualification_status === "qualified"
                    ? "status-active"
                    : lead.qualification_status === "disqualified"
                      ? "status-muted"
                      : staleLead
                        ? "status-danger"
                        : "status-warn";
                return (
                  <tr key={lead.id} className="row-hover border-t border-line">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{lead.name}</p>
                      <p className="text-[12px] text-slate">{lead.contact}</p>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-slate">
                      {campaignName(store, lead.campaign_id)}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {lead.current_stage.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-pill ${pill}`}>
                        {staleLead
                          ? "Stale"
                          : lead.qualification_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {teamName(store, lead.assigned_setter)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <form>
                          <SoftButton
                            formAction={async () => {
                              "use server";
                              await qualifyLead(lead.id, "qualified", 80);
                            }}
                          >
                            Qualify
                          </SoftButton>
                        </form>
                        <form>
                          <SoftButton
                            variant="danger"
                            formAction={async () => {
                              "use server";
                              await qualifyLead(lead.id, "disqualified", 10);
                            }}
                          >
                            Disqualify
                          </SoftButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  );
}
