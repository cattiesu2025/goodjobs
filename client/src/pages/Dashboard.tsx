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
      <h1 className="text-2xl font-bold" style={{ fontFamily: "'DM Serif Display', serif" }}>Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <SummaryCards jobs={jobs} />
        <Card>
          <CardHeader>
            <CardTitle>Job Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart
              jobs={jobs}
              statuses={statuses}
              onSliceClick={(status) => navigate(`/jobs?status=${status}`)}
            />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardCalendar />
        </CardContent>
      </Card>
    </div>
  );
}
