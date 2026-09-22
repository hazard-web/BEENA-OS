"use server";

import { revalidatePath } from "next/cache";
import { readStore, resetStore, updateStore } from "./store";
import { computeHealth } from "./utils";
import type {
  EscalationTier,
  Lead,
  PipelineStage,
  QualificationStatus,
} from "./types";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function resetDemoData() {
  await resetStore();
  revalidatePath("/", "layout");
}

export async function createLead(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  const source = String(formData.get("source") || "organic") as Lead["source"];
  const campaign_id = String(formData.get("campaign_id") || "");
  const program_interest = String(
    formData.get("program_interest") || "business_coaching",
  ) as Lead["program_interest"];
  const cost = Number(formData.get("cost") || 0);
  const referred_by = String(formData.get("referred_by") || "") || null;

  if (!name || !contact || !campaign_id) {
    throw new Error("Name, contact, and campaign are required");
  }

  await updateStore((data) => {
    const campaign = data.campaigns.find((c) => c.id === campaign_id);
    if (!campaign) throw new Error("Campaign not found");

    data.leads.unshift({
      id: id("lead"),
      name,
      contact,
      source,
      campaign_id,
      cost,
      first_touch_date: new Date().toISOString(),
      last_touch_date: new Date().toISOString(),
      qualification_status: "not_qualified",
      lead_score: 30,
      assigned_setter: "tm_arjun",
      current_stage: "new",
      program_interest,
      referred_by,
    });

    if (referred_by) {
      data.referrals.push({
        id: id("ref"),
        referring_member_id: referred_by,
        referred_lead_id: data.leads[0].id,
        reward_status: "pending",
      });
    }
  });

  revalidatePath("/leads");
  revalidatePath("/marketing");
  revalidatePath("/pipeline");
  revalidatePath("/referrals");
  revalidatePath("/");
}

export async function advanceLeadStage(leadId: string, stage: PipelineStage) {
  await updateStore((data) => {
    const lead = data.leads.find((l) => l.id === leadId);
    if (!lead) return;
    lead.current_stage = stage;
    lead.last_touch_date = new Date().toISOString();
    if (stage === "qualified") lead.qualification_status = "qualified";
    if (stage === "lost") lead.qualification_status = "disqualified";
  });
  revalidatePath("/", "layout");
}

export async function qualifyLead(
  leadId: string,
  status: QualificationStatus,
  score: number,
) {
  await updateStore((data) => {
    const lead = data.leads.find((l) => l.id === leadId);
    if (!lead) return;
    lead.qualification_status = status;
    lead.lead_score = score;
    lead.last_touch_date = new Date().toISOString();
    if (status === "qualified") lead.current_stage = "qualified";
    if (status === "disqualified") lead.current_stage = "lost";
  });
  revalidatePath("/leads");
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function bookAppointment(formData: FormData) {
  const lead_id = String(formData.get("lead_id") || "");
  const scheduled_at = String(formData.get("scheduled_at") || "");
  if (!lead_id || !scheduled_at) throw new Error("Lead and time required");

  await updateStore((data) => {
    const lead = data.leads.find((l) => l.id === lead_id);
    if (!lead) throw new Error("Lead not found");
    data.appointments.unshift({
      id: id("apt"),
      lead_id,
      scheduled_at: new Date(scheduled_at).toISOString(),
      status: "booked",
      reminder_sent: false,
      owner: "tm_priya",
      no_show_follow_up_at: null,
    });
    lead.current_stage = "booked";
    lead.last_touch_date = new Date().toISOString();
  });

  revalidatePath("/appointments");
  revalidatePath("/pipeline");
  revalidatePath("/leads");
  revalidatePath("/");
}

export async function markAppointmentStatus(
  appointmentId: string,
  status: "confirmed" | "attended" | "no_show" | "rescheduled",
) {
  await updateStore((data) => {
    const apt = data.appointments.find((a) => a.id === appointmentId);
    if (!apt) return;
    apt.status = status;
    const lead = data.leads.find((l) => l.id === apt.lead_id);
    if (status === "confirmed" && lead) lead.current_stage = "confirmed";
    if (status === "attended" && lead) lead.current_stage = "attended";
    if (status === "no_show") {
      apt.no_show_follow_up_at = new Date().toISOString();
      if (lead) lead.last_touch_date = new Date().toISOString();
    }
  });
  revalidatePath("/appointments");
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function sendReminder(appointmentId: string) {
  await updateStore((data) => {
    const apt = data.appointments.find((a) => a.id === appointmentId);
    if (!apt) return;
    apt.reminder_sent = true;
  });
  revalidatePath("/appointments");
}

export async function scoreSalesCall(formData: FormData) {
  const appointment_id = String(formData.get("appointment_id") || "");
  const outcome = String(formData.get("outcome") || "follow_up") as
    | "won"
    | "lost"
    | "follow_up";
  const escalated = formData.get("escalated") === "on";
  const escalation_reason = String(formData.get("escalation_reason") || "") || null;

  await updateStore((data) => {
    const apt = data.appointments.find((a) => a.id === appointment_id);
    if (!apt) throw new Error("Appointment not found");
    const lead = data.leads.find((l) => l.id === apt.lead_id);
    data.sales_calls.unshift({
      id: id("call"),
      appointment_id,
      closer: "tm_priya",
      recording_url: `https://example.com/recordings/${id("rec")}`,
      scorecard: {
        discovery: Number(formData.get("discovery") || 3),
        qualification: Number(formData.get("qualification") || 3),
        offer: Number(formData.get("offer") || 3),
        objection_handling: Number(formData.get("objection_handling") || 3),
        next_step: Number(formData.get("next_step") || 3),
      },
      outcome,
      escalated,
      escalation_reason: escalated ? escalation_reason : null,
      scored_at: new Date().toISOString(),
    });

    if (lead) {
      if (outcome === "won") {
        lead.current_stage = "won";
        const memberId = id("mem");
        data.members.unshift({
          id: memberId,
          lead_id: lead.id,
          name: lead.name,
          program: lead.program_interest,
          stage: 1,
          onboarding_status: "in_progress",
          onboarding_day: 1,
          community_channel_id: `skool_${lead.name.split(" ")[0].toLowerCase()}`,
          coach_assigned: "tm_ravi",
          health_status: "on_track",
          health_score: 70,
          payment_status: "current",
          payment_frequency: "monthly",
          attendance_rate: 100,
          engagement_score: 50,
          implementation_score: 40,
          joined_at: new Date().toISOString(),
        });
        data.revenue.unshift({
          id: id("rev"),
          member_id: memberId,
          program: lead.program_interest,
          amount: Number(formData.get("amount") || 150000),
          date: new Date().toISOString().slice(0, 10),
          payment_method: "UPI",
          recurring: true,
          next_billing_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          )
            .toISOString()
            .slice(0, 10),
          closer: "tm_priya",
        });
      } else if (outcome === "lost") {
        lead.current_stage = "lost";
      } else {
        lead.current_stage = "offer_made";
      }
      lead.last_touch_date = new Date().toISOString();
    }

    if (escalated) {
      data.interactions.unshift({
        id: id("int"),
        member_id: null,
        subject: escalation_reason || "Sales escalation",
        channel: "email",
        type: "escalation",
        tier: "critical",
        handled_by: null,
        response_time_minutes: null,
        sla_minutes: 120,
        resolved: false,
        resolved_at: null,
        created_at: new Date().toISOString(),
        os_source: "sales",
      });
    }
  });

  revalidatePath("/", "layout");
}

export async function advanceOnboarding(memberId: string) {
  await updateStore((data) => {
    const member = data.members.find((m) => m.id === memberId);
    if (!member) return;
    member.onboarding_day = Math.min(7, member.onboarding_day + 1);
    member.onboarding_status =
      member.onboarding_day >= 7 ? "complete" : "in_progress";
  });
  revalidatePath("/onboarding");
  revalidatePath("/success");
  revalidatePath("/");
}

export async function createInteraction(formData: FormData) {
  const subject = String(formData.get("subject") || "").trim();
  const member_id = String(formData.get("member_id") || "") || null;
  const tier = String(formData.get("tier") || "routine") as EscalationTier;
  const channel = String(formData.get("channel") || "community") as
    | "whatsapp"
    | "email"
    | "community";

  if (!subject) throw new Error("Subject required");

  await updateStore((data) => {
    data.interactions.unshift({
      id: id("int"),
      member_id,
      subject,
      channel,
      type: tier === "critical" ? "escalation" : "question",
      tier,
      handled_by: null,
      response_time_minutes: null,
      sla_minutes: tier === "critical" ? 60 : tier === "complex" ? 240 : 120,
      resolved: false,
      resolved_at: null,
      created_at: new Date().toISOString(),
      os_source: "community",
    });
  });

  revalidatePath("/community");
  revalidatePath("/founder");
  revalidatePath("/");
}

export async function resolveInteraction(
  interactionId: string,
  handlerId: string,
) {
  await updateStore((data) => {
    const item = data.interactions.find((i) => i.id === interactionId);
    if (!item || item.resolved) return;
    const created = new Date(item.created_at).getTime();
    item.resolved = true;
    item.resolved_at = new Date().toISOString();
    item.handled_by = handlerId;
    item.response_time_minutes = Math.round(
      (Date.now() - created) / (1000 * 60),
    );
  });
  revalidatePath("/community");
  revalidatePath("/founder");
  revalidatePath("/");
}

export async function refreshHealthScores() {
  await updateStore((data) => {
    for (const member of data.members) {
      const { score, status } = computeHealth(
        member.attendance_rate,
        member.engagement_score,
        member.implementation_score,
      );
      member.health_score = score;
      member.health_status = status;
      if (status === "at_risk") {
        const existing = data.interactions.find(
          (i) =>
            i.member_id === member.id &&
            i.tier === "critical" &&
            !i.resolved &&
            i.os_source === "client_success",
        );
        if (!existing) {
          data.interactions.unshift({
            id: id("int"),
            member_id: member.id,
            subject: `${member.name} flagged at risk (score ${score})`,
            channel: "whatsapp",
            type: "escalation",
            tier: "critical",
            handled_by: null,
            response_time_minutes: null,
            sla_minutes: 60,
            resolved: false,
            resolved_at: null,
            created_at: new Date().toISOString(),
            os_source: "client_success",
          });
        }
      }
    }
  });
  revalidatePath("/success");
  revalidatePath("/founder");
  revalidatePath("/");
}

export async function requestTestimonial(memberId: string) {
  await updateStore((data) => {
    const member = data.members.find((m) => m.id === memberId);
    if (!member) return;
    data.testimonials.unshift({
      id: id("tst"),
      member_id: memberId,
      trigger_event: member.stage >= 4 ? "program_complete" : "milestone",
      sent_at: new Date().toISOString(),
      permission_granted: false,
      format: "written",
      status: "requested",
      content: null,
    });
  });
  revalidatePath("/testimonials");
  revalidatePath("/");
}

export async function publishTestimonial(testimonialId: string) {
  await updateStore((data) => {
    const t = data.testimonials.find((x) => x.id === testimonialId);
    if (!t) return;
    t.status = "published";
    t.permission_granted = true;
    if (!t.content) {
      t.content = "Published proof - permission granted.";
    }
  });
  revalidatePath("/testimonials");
}

export async function creditReferral(referralId: string) {
  await updateStore((data) => {
    const r = data.referrals.find((x) => x.id === referralId);
    if (!r) return;
    r.reward_status = "credited";
  });
  revalidatePath("/referrals");
}

export async function getStoreSnapshot() {
  return readStore();
}
