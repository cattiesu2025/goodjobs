import { Badge } from "@/components/ui/badge";
import type { Job, Status } from "@/lib/types";

interface Props {
  jobs: Job[];
  statuses: Status[];
  search: string;
  statusFilter: string | null;
  onSelect: (job: Job) => void;
}

export function JobList({ jobs, statuses, search, statusFilter, onSelect }: Props) {
  const colorMap = Object.fromEntries(statuses.map((s) => [s.name, s.color]));

  const filtered = jobs.filter((j) => {
    const matchesSearch = !search ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || j.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    return <div className="text-muted-foreground py-8 text-center">No jobs found</div>;
  }

  return (
    <div className="space-y-2">
      {filtered.map((job) => (
        <div
          key={job.id}
          onClick={() => onSelect(job)}
          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
        >
          <div>
            <div className="font-medium">{job.company}</div>
            <div className="text-sm text-muted-foreground">{job.jobTitle}</div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {job.deadline && (
              <span className="text-muted-foreground">{job.deadline}</span>
            )}
            <Badge style={{ backgroundColor: colorMap[job.currentStatus] }}>
              {job.currentStatus}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
