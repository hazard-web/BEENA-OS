import { creditReferral } from "@/lib/actions";
import { PageHeader, SoftButton, StatCard, TextLink } from "@/components/ui";
import { readStore } from "@/lib/store";
import { leadName, memberName } from "@/lib/utils";

export default async function ReferralsPage() {
  const store = await readStore();
  const referredLeads = store.leads.filter((l) => l.referred_by);

  return (
    <div>
      <PageHeader
        title="Referrals"
        actions={<TextLink href="/marketing">Capture referred lead</TextLink>}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Referral records"
          value={String(store.referrals.length)}
        />
        <StatCard
          label="Tagged referred leads"
          value={String(referredLeads.length)}
        />
        <StatCard
          label="Rewards credited"
          value={String(
            store.referrals.filter((r) => r.reward_status === "credited")
              .length,
          )}
        />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <h2 className="font-display text-lg">Referral tracking</h2>
          <div className="mt-4 space-y-3">
            {store.referrals.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {memberName(store, r.referring_member_id)} to{" "}
                    {leadName(store, r.referred_lead_id)}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate">
                    Reward {r.reward_status}
                  </p>
                </div>
                {r.reward_status === "pending" ? (
                  <form>
                    <SoftButton
                      variant="primary"
                      formAction={async () => {
                        "use server";
                        await creditReferral(r.id);
                      }}
                    >
                      Credit reward
                    </SoftButton>
                  </form>
                ) : null}
              </div>
            ))}
            {store.referrals.length === 0 ? (
              <p className="text-sm text-slate">No referrals yet.</p>
            ) : null}
          </div>
        </div>

        <div className="panel p-4">
          <h2 className="font-display text-lg">Ascension candidates</h2>
          <div className="mt-4 space-y-2">
            {store.members
              .filter(
                (m) => m.stage >= 3 && m.health_status === "on_track",
              )
              .map((m) => (
                <div
                  key={m.id}
                  className="rounded-md border border-line bg-white px-3 py-3 text-sm"
                >
                  <p className="font-medium">{m.name}</p>
                  <p className="mt-1 text-xs text-slate">Stage {m.stage}</p>
                </div>
              ))}
            {store.members.filter(
              (m) => m.stage >= 3 && m.health_status === "on_track",
            ).length === 0 ? (
              <p className="text-sm text-slate">None</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
