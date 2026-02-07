import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { JobTimeline } from "./JobTimeline";
import { JobPrep } from "./JobPrep";
import { api } from "@/lib/api";
import type { JobDetail as JobDetailType, Status } from "@/lib/types";

interface Props {
  jobId: number;
  statuses: Status[];
  onBack: () => void;
}

export function JobDetail({ jobId, statuses, onBack }: Props) {
  const [job, setJob] = useState<JobDetailType | null>(null);
  const colorMap = Object.fromEntries(statuses.map((s) => [s.name, s.color]));

  const refresh = () => {
    api.getJob(jobId).then(setJob);
  };

  useEffect(() => { refresh(); }, [jobId]);

  if (!job) return <div>Loading...</div>;

  const saveNotes = async (notes: string) => {
    await api.updateJob(jobId, { ...job, notes });
    refresh();
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm underline">&larr; Back to list</button>

      <div className="space-y-1">
        <h2 className="text-xl font-bold" style={{ fontFamily: "'DM Serif Display', serif" }}>{job.company} — {job.jobTitle}</h2>
        <div className="flex items-center gap-3 text-sm">
          <Badge style={{ backgroundColor: colorMap[job.currentStatus], color: "white" }}>
            {job.currentStatus}
          </Badge>
          {job.contactPerson && <span>Contact: {job.contactPerson}</span>}
          {job.deadline && <span>Deadline: {job.deadline}</span>}
        </div>
        {job.website && (
          <a href={job.website} target="_blank" rel="noreferrer"
            className="text-sm text-blue-500 hover:underline">
            {job.website}
          </a>
        )}
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="prep">Prep</TabsTrigger>
          <TabsTrigger value="jd">JD</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <JobTimeline
            jobId={jobId}
            history={job.history}
            statuses={statuses}
            onUpdate={refresh}
          />
        </TabsContent>

        <TabsContent value="prep">
          <JobPrep jobId={jobId} todos={job.todos} onUpdate={refresh} />
        </TabsContent>

        <TabsContent value="jd">
          <div className="whitespace-pre-wrap text-sm">
            {job.jobDescription || "No job description saved."}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <Textarea
            defaultValue={job.notes ?? ""}
            rows={10}
            onBlur={(e) => saveNotes(e.target.value)}
            placeholder="Add notes..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
