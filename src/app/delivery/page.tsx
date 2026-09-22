import { PageHeader, StatCard } from "@/components/ui";
import { readStore } from "@/lib/store";

export default async function DeliveryPage() {
  const store = await readStore();
  const notBeena = store.delivery_steps.filter(
    (s) => s.owner_tier !== "beena_only",
  ).length;

  return (
    <div>
      <PageHeader
        title="Delivery"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Documented steps"
          value={String(store.delivery_steps.length)}
        />
        <StatCard
          label="Without Beena"
          value={`${Math.round(
            (notBeena / store.delivery_steps.length) * 100,
          )}%`}
        />
        <StatCard
          label="Beena-only"
          value={String(
            store.delivery_steps.filter((s) => s.owner_tier === "beena_only")
              .length,
          )}
        />
      </section>

      <div className="panel mt-8 overflow-hidden">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-mist/70 font-mono text-[10px] uppercase tracking-wider text-slate">
            <tr>
              <th className="px-4 py-2 font-medium">Module</th>
              <th className="px-4 py-2 font-medium">Step</th>
              <th className="px-4 py-2 font-medium">Owner tier</th>
              <th className="px-4 py-2 font-medium">SOP</th>
            </tr>
          </thead>
          <tbody>
            {store.delivery_steps.map((step) => (
              <tr key={step.id} className="border-t border-line">
                <td className="px-4 py-3">{step.module}</td>
                <td className="px-4 py-3">{step.step}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md border px-2 py-1 text-xs capitalize ${
                      step.owner_tier === "beena_only"
                        ? "border-rose/30 bg-rose/5 text-rose"
                        : step.owner_tier === "automated"
                          ? "border-teal/30 bg-teal/5 text-teal"
                          : "border-line bg-white text-ink"
                    }`}
                  >
                    {step.owner_tier.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate">
                  {step.sop_url}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
