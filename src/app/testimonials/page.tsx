import { publishTestimonial, requestTestimonial } from "@/lib/actions";
import { PageHeader, SoftButton, StatCard } from "@/components/ui";
import { readStore } from "@/lib/store";
import { formatDate, memberName } from "@/lib/utils";

export default async function TestimonialsPage() {
  const store = await readStore();
  const published = store.testimonials.filter((t) => t.status === "published");

  return (
    <div>
      <PageHeader
        title="Testimonials"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Requests"
          value={String(store.testimonials.length)}
        />
        <StatCard label="Published" value={String(published.length)} />
        <StatCard
          label="Response rate"
          value={`${
            store.testimonials.length
              ? Math.round(
                  (store.testimonials.filter((t) => t.status !== "requested")
                    .length /
                    store.testimonials.length) *
                    100,
                )
              : 0
          }%`}
        />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {store.testimonials.map((t) => (
            <div key={t.id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{memberName(store, t.member_id)}</p>
                  <p className="mt-1 text-xs text-slate">
                    {t.trigger_event.replace("_", " ")}, {t.format}, sent{" "}
                    {formatDate(t.sent_at)}
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-teal">
                  {t.status}
                </span>
              </div>
              {t.content ? (
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  “{t.content}”
                </p>
              ) : null}
              {t.status !== "published" ? (
                <form className="mt-3">
                  <SoftButton
                    variant="primary"
                    formAction={async () => {
                      "use server";
                      await publishTestimonial(t.id);
                    }}
                  >
                    Mark published
                  </SoftButton>
                </form>
              ) : null}
            </div>
          ))}
        </div>

        <div className="panel h-fit p-4">
          <h2 className="font-display text-lg">Trigger request</h2>
          <div className="mt-4 space-y-2">
            {store.members.map((m) => (
              <form
                key={m.id}
                className="flex items-center justify-between gap-2 border-b border-line pb-2 last:border-0"
              >
                <span className="text-sm">{m.name}</span>
                <SoftButton
                  formAction={async () => {
                    "use server";
                    await requestTestimonial(m.id);
                  }}
                >
                  Send request
                </SoftButton>
              </form>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
