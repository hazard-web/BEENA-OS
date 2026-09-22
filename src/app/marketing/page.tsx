import { createLead } from "@/lib/actions";
import {
  DataPanel,
  Field,
  PageHeader,
  SoftButton,
  StatCard,
  inputClass,
} from "@/components/ui";
import { readStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";

export default async function MarketingPage() {
  const store = await readStore();
  const byCampaign = store.campaigns.map((c) => {
    const leads = store.leads.filter((l) => l.campaign_id === c.id);
    const cost = c.total_cost || leads.reduce((s, l) => s + l.cost, 0);
    return {
      ...c,
      leadCount: leads.length,
      cpl: leads.length ? Math.round(cost / leads.length) : 0,
      cost,
    };
  });

  return (
    <div>
      <PageHeader title="Marketing" />

      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Campaigns"
          value={String(store.campaigns.length)}
        />
        <StatCard
          label="Ad spend"
          value={formatINR(
            store.campaigns.reduce((s, c) => s + c.total_cost, 0),
          )}
        />
        <StatCard label="Leads" value={String(store.leads.length)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <DataPanel title="Campaigns" meta={`${byCampaign.length} active`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th>Campaign</th>
                  <th>Channel</th>
                  <th>Type</th>
                  <th>Leads</th>
                  <th>CPL</th>
                </tr>
              </thead>
              <tbody>
                {byCampaign.map((c) => (
                  <tr key={c.id} className="row-hover border-t border-line">
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="px-4 py-3 capitalize text-slate">
                      {c.channel.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate">
                      {c.type.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{c.leadCount}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatINR(c.cpl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataPanel>

        <form action={createLead} className="panel space-y-3 p-4">
          <h2 className="text-[15px] font-semibold">Capture lead</h2>
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Contact">
            <input name="contact" required className={inputClass} />
          </Field>
          <Field label="Source">
            <select name="source" className={inputClass} defaultValue="instagram">
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="paid_ad">Paid ad</option>
              <option value="referral">Referral</option>
              <option value="organic">Organic</option>
            </select>
          </Field>
          <Field label="Campaign">
            <select name="campaign_id" required className={inputClass}>
              {store.campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Program">
            <select
              name="program_interest"
              className={inputClass}
              defaultValue="business_coaching"
            >
              <option value="business_coaching">Business coaching</option>
              <option value="life_accelerator">Life accelerator</option>
              <option value="low_ticket">Low ticket</option>
            </select>
          </Field>
          <Field label="Cost (INR )">
            <input
              name="cost"
              type="number"
              min={0}
              defaultValue={0}
              className={inputClass}
            />
          </Field>
          <Field label="Referred by">
            <select name="referred_by" className={inputClass} defaultValue="">
              <option value="">-</option>
              {store.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
          <SoftButton variant="primary">Add lead</SoftButton>
        </form>
      </section>
    </div>
  );
}
