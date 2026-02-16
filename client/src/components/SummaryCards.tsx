import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex flex-col gap-2">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardContent className="py-2 px-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {card.title}
            </span>
            <span className="text-xl font-bold">{card.value}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
