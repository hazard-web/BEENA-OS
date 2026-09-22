import Link from "next/link";
import type { EscalationTier, HealthStatus } from "@/lib/types";

export function TierBadge({ tier }: { tier: EscalationTier }) {
  const map = {
    routine: { label: "Routine", cls: "status-active" },
    complex: { label: "Complex", cls: "status-warn" },
    critical: { label: "Critical", cls: "status-danger" },
  } as const;
  const item = map[tier];
  return <span className={`status-pill ${item.cls}`}>{item.label}</span>;
}

export function HealthBadge({ status }: { status: HealthStatus }) {
  const map = {
    on_track: { label: "On track", cls: "status-active" },
    needs_intervention: { label: "Needs intervention", cls: "status-warn" },
    at_risk: { label: "At risk", cls: "status-danger" },
  } as const;
  const item = map[status];
  return <span className={`status-pill ${item.cls}`}>{item.label}</span>;
}

export function PageHeader({
  title,
  actions,
}: {
  title: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-[22px] font-semibold text-ink">{title}</h1>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
  delay?: 0 | 1 | 2 | 3;
}) {
  return (
    <div className="panel px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate">
        {label}
      </p>
      <p className="mt-1 text-[22px] font-semibold tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel px-4 py-10 text-center text-sm text-slate">
      {children}
    </div>
  );
}

export function SoftButton({
  children,
  formAction,
  type = "submit",
  variant = "default",
}: {
  children: React.ReactNode;
  formAction?: (formData: FormData) => void | Promise<void>;
  type?: "submit" | "button";
  variant?: "default" | "primary" | "danger";
  static?: boolean;
}) {
  const styles =
    variant === "primary"
      ? "bg-green-mid text-white hover:bg-green"
      : variant === "danger"
        ? "bg-white text-rose border border-line hover:bg-rose/5"
        : "bg-white text-ink border border-line hover:bg-mist";
  return (
    <button
      type={type}
      formAction={formAction}
      className={`control px-3 py-1.5 text-[12px] font-semibold ${styles}`}
    >
      {children}
    </button>
  );
}

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="control inline-flex border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-mist"
    >
      {children}
    </Link>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1 text-[12px]">
      <span className="font-semibold text-slate">{label}</span>
      {children}
    </label>
  );
}

export function DataPanel({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span>{title}</span>
        {meta ? <span className="panel-head-meta">{meta}</span> : null}
      </div>
      {children}
    </div>
  );
}

export const inputClass =
  "control w-full border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-green-mid";
