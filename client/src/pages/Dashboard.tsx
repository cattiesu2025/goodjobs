import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCards } from "@/components/SummaryCards";
import { StatusPieChart } from "@/components/StatusPieChart";
import { DashboardCalendar } from "@/components/DashboardCalendar";
import { api } from "@/lib/api";
import type { Job, Status } from "@/lib/types";

export function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getJobs().then(setJobs);
    api.getStatuses().then(setStatuses);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
        <SummaryCards jobs={jobs} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <StatusPieChart
                jobs={jobs}
                statuses={statuses}
                onSliceClick={(status) => navigate(`/jobs?status=${status}`)}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                To Apply
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {jobs
                .filter((j) => j.currentStatus === "Saved")
                .slice(0, 8)
                .map((j) => (
                  <div
                    key={j.id}
                    className="flex justify-between items-center text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition-colors"
                    onClick={() => navigate(`/jobs?id=${j.id}`)}
                  >
                    <span className="font-medium truncate">{j.company}</span>
                    <span className="text-muted-foreground text-xs truncate ml-2">
                      {j.jobTitle}
                    </span>
                  </div>
                ))}
              {jobs.filter((j) => j.currentStatus === "Saved").length === 0 && (
                <p className="text-sm text-muted-foreground">No saved jobs</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardContent>
          <DashboardCalendar />
        </CardContent>
      </Card>
    </div>
  );
}
