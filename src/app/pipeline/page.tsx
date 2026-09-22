import { advanceLeadStage } from "@/lib/actions";
import { DataPanel, PageHeader, SoftButton } from "@/components/ui";
import { readStore } from "@/lib/store";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/types";

const ACTIVE: PipelineStage[] = PIPELINE_STAGES.filter((s) => s !== "lost");

export default async function PipelinePage() {
  const store = await readStore();
  const lost = store.leads.filter((l) => l.current_stage === "lost");

  return (
    <div>
      <PageHeader title="Pipeline" />

      <div className="flex gap-3 overflow-x-auto pb-2">
        {ACTIVE.map((stage) => {
          const leads = store.leads.filter((l) => l.current_stage === stage);
          return (
            <div key={stage} className="panel min-w-[200px] flex-1">
              <div className="panel-head text-[13px]">
                <span className="capitalize">{stage.replace("_", " ")}</span>
                <span className="panel-head-meta">{leads.length}</span>
              </div>
              <div className="space-y-2 p-2">
                {leads.map((lead) => {
                  const idx = ACTIVE.indexOf(stage);
                  const next = ACTIVE[idx + 1];
                  return (
                    <div
                      key={lead.id}
                      className="rounded-lg border border-line bg-mist/40 p-3"
                    >
                      <p className="text-sm font-semibold text-ink">
                        {lead.name}
                      </p>
                      <p className="mt-0.5 text-[12px] capitalize text-slate">
                        {lead.source.replace("_", " ")}, {lead.lead_score ?? "-"}
                      </p>
                      {next ? (
                        <form className="mt-2">
                          <SoftButton
                            formAction={async () => {
                              "use server";
                              await advanceLeadStage(lead.id, next);
                            }}
                          >
                            Move forward
                          </SoftButton>
                        </form>
                      ) : null}
                    </div>
                  );
                })}
                {leads.length === 0 ? (
                  <p className="px-1 py-6 text-center text-[12px] text-slate">
                    Empty
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <DataPanel title="Lost" meta={`${lost.length} people`}>
          <div className="flex flex-wrap gap-2 p-4">
            {lost.length === 0 ? (
              <span className="text-[13px] text-slate">None</span>
            ) : (
              lost.map((l) => (
                <span
                  key={l.id}
                  className="rounded-lg bg-mist px-3 py-1.5 text-[13px] text-slate"
                >
                  {l.name}
                </span>
              ))
            )}
          </div>
        </DataPanel>
      </div>
    </div>
  );
}
