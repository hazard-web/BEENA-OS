export type LeadSource =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "paid_ad"
  | "referral"
  | "organic";

export type QualificationStatus =
  | "not_qualified"
  | "qualified"
  | "disqualified";

export type PipelineStage =
  | "new"
  | "nurturing"
  | "qualified"
  | "booked"
  | "confirmed"
  | "attended"
  | "offer_made"
  | "won"
  | "lost";

export type Program =
  | "business_coaching"
  | "life_accelerator"
  | "low_ticket";

export type EscalationTier = "routine" | "complex" | "critical";

export type CampaignChannel =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "paid_ad";

export type CampaignType =
  | "lead_magnet"
  | "challenge"
  | "webinar"
  | "community_entry";

export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "attended"
  | "no_show"
  | "rescheduled";

export type CallOutcome = "won" | "lost" | "follow_up";

export type OnboardingStatus = "not_started" | "in_progress" | "complete";

export type HealthStatus = "on_track" | "needs_intervention" | "at_risk";

export type PaymentStatus = "current" | "overdue" | "completed";

export type PaymentFrequency = "one_time" | "monthly" | "installment";

export type TeamRole =
  | "sales_closer"
  | "setter"
  | "community_manager"
  | "mentor"
  | "ops"
  | "founder";

export type OsSource =
  | "marketing"
  | "lead"
  | "appointment"
  | "sales"
  | "onboarding"
  | "delivery"
  | "community"
  | "client_success"
  | "testimonial"
  | "referral"
  | "reporting"
  | "founder";

export type OwnerTier = "beena_only" | "team" | "automated";

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  kras: string[];
  kpis: { metric: string; target: string }[];
  decision_authority: string;
  certified_closer?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  type: CampaignType;
  start_date: string;
  end_date: string;
  total_cost: number;
}

export interface Lead {
  id: string;
  name: string;
  contact: string;
  source: LeadSource;
  campaign_id: string;
  cost: number;
  first_touch_date: string;
  qualification_status: QualificationStatus;
  lead_score: number | null;
  assigned_setter: string | null;
  current_stage: PipelineStage;
  program_interest: Program;
  referred_by: string | null;
  last_touch_date: string;
}

export interface Appointment {
  id: string;
  lead_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  reminder_sent: boolean;
  owner: string;
  no_show_follow_up_at: string | null;
}

export interface SalesCall {
  id: string;
  appointment_id: string;
  closer: string;
  recording_url: string;
  scorecard: {
    discovery: number;
    qualification: number;
    offer: number;
    objection_handling: number;
    next_step: number;
  };
  outcome: CallOutcome;
  escalated: boolean;
  escalation_reason: string | null;
  scored_at: string;
}

export interface Member {
  id: string;
  lead_id: string;
  name: string;
  program: Program;
  stage: 1 | 2 | 3 | 4;
  onboarding_status: OnboardingStatus;
  onboarding_day: number;
  community_channel_id: string;
  coach_assigned: string;
  health_status: HealthStatus;
  health_score: number;
  payment_status: PaymentStatus;
  payment_frequency: PaymentFrequency;
  attendance_rate: number;
  engagement_score: number;
  implementation_score: number;
  joined_at: string;
}

export interface Interaction {
  id: string;
  member_id: string | null;
  subject: string;
  channel: "whatsapp" | "email" | "community";
  type: "check_in" | "question" | "escalation" | "routine";
  tier: EscalationTier;
  handled_by: string | null;
  response_time_minutes: number | null;
  sla_minutes: number;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  os_source: OsSource;
}

export interface Revenue {
  id: string;
  member_id: string;
  program: Program;
  amount: number;
  date: string;
  payment_method: string;
  recurring: boolean;
  next_billing_date: string | null;
  closer: string;
}

export interface TestimonialRequest {
  id: string;
  member_id: string;
  trigger_event: "milestone" | "program_complete";
  sent_at: string;
  permission_granted: boolean;
  format: "written" | "video";
  status: "requested" | "received" | "published";
  content: string | null;
}

export interface ReferralRecord {
  id: string;
  referring_member_id: string;
  referred_lead_id: string;
  reward_status: "pending" | "credited";
}

export interface DeliveryStep {
  id: string;
  module: string;
  step: string;
  owner_tier: OwnerTier;
  sop_url: string;
}

export interface DashboardMetric {
  id: string;
  os_source: OsSource;
  metric_name: string;
  value: number;
  period: "daily" | "weekly" | "monthly";
  computed_at: string;
}

export interface StoreData {
  team: TeamMember[];
  campaigns: Campaign[];
  leads: Lead[];
  appointments: Appointment[];
  sales_calls: SalesCall[];
  members: Member[];
  interactions: Interaction[];
  revenue: Revenue[];
  testimonials: TestimonialRequest[];
  referrals: ReferralRecord[];
  delivery_steps: DeliveryStep[];
  metrics: DashboardMetric[];
}

export const PIPELINE_STAGES: PipelineStage[] = [
  "new",
  "nurturing",
  "qualified",
  "booked",
  "confirmed",
  "attended",
  "offer_made",
  "won",
  "lost",
];

/** Canonical 12 OS - order matches ARCHITECTURE.md / PRD.md */
export const OS_MODULES = [
  {
    n: "01",
    href: "/marketing",
    name: "Marketing OS",
    short: "01",
    phase: "Acquire",
  },
  {
    n: "02",
    href: "/leads",
    name: "Lead OS",
    short: "02",
    phase: "Acquire",
  },
  {
    n: "03",
    href: "/appointments",
    name: "Appointment OS",
    short: "03",
    phase: "Acquire",
  },
  {
    n: "04",
    href: "/sales",
    name: "Sales OS",
    short: "04",
    phase: "Acquire",
  },
  {
    n: "05",
    href: "/onboarding",
    name: "Onboarding OS",
    short: "05",
    phase: "Deliver",
  },
  {
    n: "06",
    href: "/delivery",
    name: "Delivery OS",
    short: "06",
    phase: "Deliver",
  },
  {
    n: "07",
    href: "/community",
    name: "Community OS",
    short: "07",
    phase: "Retain",
  },
  {
    n: "08",
    href: "/success",
    name: "Client Success OS",
    short: "08",
    phase: "Retain",
  },
  {
    n: "09",
    href: "/testimonials",
    name: "Testimonial OS",
    short: "09",
    phase: "Grow",
  },
  {
    n: "10",
    href: "/referrals",
    name: "Referral OS",
    short: "10",
    phase: "Grow",
  },
  {
    n: "11",
    href: "/reporting",
    name: "Reporting OS",
    short: "11",
    phase: "Lead",
  },
  {
    n: "12",
    href: "/founder",
    name: "Founder OS",
    short: "12",
    phase: "Lead",
  },
] as const;

export const OS_NAV = [
  { href: "/", label: "Home", short: "Home" },
  { href: "/pipeline", label: "Pipeline", short: "Pipe" },
  ...OS_MODULES.map((os) => ({
    href: os.href,
    label: os.name.replace(" OS", ""),
    short: os.short,
  })),
] as const;
