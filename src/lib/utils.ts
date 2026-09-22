import type {
  EscalationTier,
  HealthStatus,
  StoreData,
} from "./types";

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function relativeHours(iso: string, now = Date.now()): number {
  return (now - new Date(iso).getTime()) / (1000 * 60 * 60);
}

export function minutesOpen(iso: string, now = Date.now()): number {
  return Math.floor((now - new Date(iso).getTime()) / (1000 * 60));
}

export function isPastSla(
  createdAt: string,
  slaMinutes: number,
  now = Date.now(),
): boolean {
  return minutesOpen(createdAt, now) > slaMinutes;
}

export function tierLabel(tier: EscalationTier): string {
  if (tier === "routine") return "Routine";
  if (tier === "complex") return "Complex";
  return "Critical";
}

export function healthLabel(status: HealthStatus): string {
  if (status === "on_track") return "On Track";
  if (status === "needs_intervention") return "Needs Intervention";
  return "At Risk";
}

export function computeHealth(
  attendance: number,
  engagement: number,
  implementation: number,
): { score: number; status: HealthStatus } {
  const score = Math.round(
    attendance * 0.35 + engagement * 0.35 + implementation * 0.3,
  );
  let status: HealthStatus = "on_track";
  if (score < 45) status = "at_risk";
  else if (score < 65) status = "needs_intervention";
  return { score, status };
}

export function teamName(store: StoreData, id: string | null): string {
  if (!id) return "Unassigned";
  return store.team.find((t) => t.id === id)?.name ?? id;
}

export function campaignName(store: StoreData, id: string): string {
  return store.campaigns.find((c) => c.id === id)?.name ?? id;
}

export function memberName(store: StoreData, id: string): string {
  return store.members.find((m) => m.id === id)?.name ?? id;
}

export function leadName(store: StoreData, id: string): string {
  return store.leads.find((l) => l.id === id)?.name ?? id;
}

export function reportingSnapshot(store: StoreData) {
  const revenueTotal = store.revenue.reduce((s, r) => s + r.amount, 0);
  const openCritical = store.interactions.filter(
    (i) => i.tier === "critical" && !i.resolved,
  ).length;
  const slaBreaches = store.interactions.filter(
    (i) => !i.resolved && isPastSla(i.created_at, i.sla_minutes),
  ).length;
  const untouchedLeads = store.leads.filter((l) => {
    if (["won", "lost"].includes(l.current_stage)) return false;
    return relativeHours(l.last_touch_date) > 24;
  });
  const atRisk = store.members.filter((m) => m.health_status === "at_risk");
  const cplBySource = new Map<string, { cost: number; leads: number }>();
  for (const lead of store.leads) {
    const cur = cplBySource.get(lead.source) ?? { cost: 0, leads: 0 };
    cur.cost += lead.cost;
    cur.leads += 1;
    cplBySource.set(lead.source, cur);
  }

  return {
    revenueTotal,
    openCritical,
    slaBreaches,
    untouchedLeads,
    atRisk,
    activeLeads: store.leads.filter(
      (l) => !["won", "lost"].includes(l.current_stage),
    ).length,
    members: store.members.length,
    cplBySource: [...cplBySource.entries()].map(([source, v]) => ({
      source,
      leads: v.leads,
      cost: v.cost,
      cpl: v.leads ? Math.round(v.cost / v.leads) : 0,
    })),
  };
}
