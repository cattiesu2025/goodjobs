import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Job } from "@/lib/types";

export function SummaryCards({ jobs }: { jobs: Job[] }) {
  const total = jobs.length;
  const active = jobs.filter((j) =>
    !["Accepted", "Rejected", "Withdrawn"].includes(j.currentStatus)
  ).length;
  const interviews = jobs.filter((j) =>
    j.currentStatus.includes("Interview")
  ).length;
  const offers = jobs.filter((j) => j.currentStatus === "Offer Received").length;

  const cards = [
    { title: "Total", value: total },
    { title: "Active", value: active },
    { title: "Interviews", value: interviews },
    { title: "Offers", value: offers },
  ];

  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
