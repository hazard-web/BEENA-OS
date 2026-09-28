import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { readStore } from "@/lib/store";
import { formatINR, reportingSnapshot } from "@/lib/utils";

export default async function HomePage() {
  const store = await readStore();
  const snap = reportingSnapshot(store);
  const stats = [
    { label: "Revenue", value: formatINR(snap.revenueTotal) },
    { label: "Leads", value: String(snap.activeLeads) },
    { label: "Members", value: String(snap.members) },
    { label: "Critical", value: String(snap.openCritical) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>At risk</CardTitle>
          </CardHeader>
          <CardContent>
            {snap.atRisk.length === 0 ? (
              <p className="text-sm text-muted-foreground">None</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {snap.atRisk.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>{member.name}</span>
                    <Badge variant="destructive">At risk</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Waiting</CardTitle>
          </CardHeader>
          <CardContent>
            {snap.untouchedLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">None</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {snap.untouchedLeads.slice(0, 6).map((lead) => (
                  <li
                    key={lead.id}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span>{lead.name}</span>
                    <Badge variant="outline">
                      {lead.current_stage.replace(/_/g, " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
