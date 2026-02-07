import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { JobList } from "@/components/JobList";
import { JobDetail } from "@/components/JobDetail";
import { AddJobDialog } from "@/components/AddJobDialog";
import { api } from "@/lib/api";
import type { Job, Status } from "@/lib/types";

export function JobJournal() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const refresh = () => {
    api.getJobs().then(setJobs);
  };

  useEffect(() => {
    refresh();
    api.getStatuses().then(setStatuses);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'DM Serif Display', serif" }}>Job Journal</h1>
        <AddJobDialog statuses={statuses} onCreated={refresh} />
      </div>

      {selectedJobId ? (
        <JobDetail
          jobId={selectedJobId}
          statuses={statuses}
          onBack={() => { setSelectedJobId(null); refresh(); }}
        />
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              placeholder="Search company or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter ?? "all"}
              onValueChange={(v) => {
                if (v === "all") searchParams.delete("status");
                else searchParams.set("status", v);
                setSearchParams(searchParams);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <JobList
            jobs={jobs}
            statuses={statuses}
            search={search}
            statusFilter={statusFilter}
            onSelect={(job) => setSelectedJobId(job.id)}
          />
        </>
      )}
    </div>
  );
}
