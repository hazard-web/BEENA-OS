import {
  bookAppointment,
  markAppointmentStatus,
  sendReminder,
} from "@/lib/actions";
import {
  Field,
  PageHeader,
  SoftButton,
  StatCard,
  inputClass,
} from "@/components/ui";
import { readStore } from "@/lib/store";
import { formatDate, leadName, teamName } from "@/lib/utils";

export default async function AppointmentsPage() {
  const store = await readStore();
  const attended = store.appointments.filter((a) => a.status === "attended");
  const decided = store.appointments.filter((a) =>
    ["attended", "no_show"].includes(a.status),
  );
  const showUpRate = decided.length
    ? Math.round((attended.length / decided.length) * 100)
    : 0;
  const bookable = store.leads.filter((l) =>
    ["qualified", "nurturing", "new"].includes(l.current_stage),
  );

  return (
    <div>
      <PageHeader
        title="Appointments"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Appointments"
          value={String(store.appointments.length)}
        />
        <StatCard label="Show-up rate" value={`${showUpRate}%`} />
        <StatCard
          label="Reminders sent"
          value={String(store.appointments.filter((a) => a.reminder_sent).length)}
        />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {store.appointments.map((apt) => (
            <div key={apt.id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {leadName(store, apt.lead_id)}
                  </p>
                  <p className="mt-1 text-xs text-slate">
                    {formatDate(apt.scheduled_at)}, Owner{" "}
                    {teamName(store, apt.owner)}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-teal">
                    {apt.status.replace("_", " ")}
                    {apt.reminder_sent ? ", reminder sent" : ""}
                    {apt.no_show_follow_up_at
                      ? `, no-show follow-up ${formatDate(apt.no_show_follow_up_at)}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {!apt.reminder_sent ? (
                    <form>
                      <SoftButton
                        formAction={async () => {
                          "use server";
                          await sendReminder(apt.id);
                        }}
                      >
                        Send reminder
                      </SoftButton>
                    </form>
                  ) : null}
                  <form>
                    <SoftButton
                      formAction={async () => {
                        "use server";
                        await markAppointmentStatus(apt.id, "confirmed");
                      }}
                    >
                      Confirm
                    </SoftButton>
                  </form>
                  <form>
                    <SoftButton
                      variant="primary"
                      formAction={async () => {
                        "use server";
                        await markAppointmentStatus(apt.id, "attended");
                      }}
                    >
                      Attended
                    </SoftButton>
                  </form>
                  <form>
                    <SoftButton
                      variant="danger"
                      formAction={async () => {
                        "use server";
                        await markAppointmentStatus(apt.id, "no_show");
                      }}
                    >
                      No-show
                    </SoftButton>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form action={bookAppointment} className="panel h-fit space-y-3 p-4">
          <h2 className="font-display text-lg">Book call</h2>
          <Field label="Qualified / active lead">
            <select name="lead_id" required className={inputClass}>
              {bookable.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.qualification_status})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Scheduled at">
            <input
              type="datetime-local"
              name="scheduled_at"
              required
              className={inputClass}
            />
          </Field>
          <SoftButton variant="primary">Book appointment</SoftButton>
        </form>
      </section>
    </div>
  );
}
