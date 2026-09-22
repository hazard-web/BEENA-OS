import Link from "next/link";
import {
  DataPanel,
  PageHeader,
  StatCard,
  TextLink,
} from "@/components/ui";
import { readStore } from "@/lib/store";
import { OS_MODULES } from "@/lib/types";
import { formatINR, reportingSnapshot } from "@/lib/utils";

const OS_METRIC_KEY: Record<string, string> = {
  "/marketing": "marketing",
  "/leads": "lead",
  "/appointments": "appointment",
  "/sales": "sales",
  "/onboarding": "onboarding",
  "/delivery": "delivery",
  "/community": "community",
  "/success": "client_success",
  "/testimonials": "testimonial",
  "/referrals": "referral",
  "/founder": "founder",
};

export default async function ReportingPage() {
  const store = await readStore();
  const snap = reportingSnapshot(store);

  return (
    <div>
      <PageHeader
        title="Reporting"
        actions={<TextLink href="/">Back to home</TextLink>}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatINR(snap.revenueTotal)} />
        <StatCard label="Active pipeline" value={String(snap.activeLeads)} />
        <StatCard label="Members" value={String(snap.members)} />
        <StatCard label="Critical open" value={String(snap.openCritical)} />
      </section>

      <div className="mt-5">
        <DataPanel title="Metric per OS" meta={`${store.metrics.length} metrics`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th>#</th>
                  <th>OS</th>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {OS_MODULES.filter((o) => o.href !== "/reporting").map((os) => {
                  const metric = store.metrics.find(
                    (m) => m.os_source === OS_METRIC_KEY[os.href],
                  );
                  return (
                    <tr key={os.n} className="row-hover border-t border-line">
                      <td className="px-4 py-3 tabular-nums text-slate">
                        {os.n}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={os.href}
                          className="font-semibold text-ink hover:underline"
                        >
                          {os.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate">
                        {metric?.metric_name ?? "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {metric
                          ? `${Number.isInteger(metric.value) ? metric.value : metric.value.toFixed(1)}${metric.metric_name.includes("%") ? "%" : ""}`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataPanel>
      </div>
    </div>
  );
}
