import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { JobStatusEntry, Status } from "@/lib/types";

interface Props {
  jobId: number;
  history: JobStatusEntry[];
  statuses: Status[];
  onUpdate: () => void;
}

export function JobTimeline({ jobId, history, statuses, onUpdate }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ status: "", contactPerson: "", contactLink: "", note: "" });
  const colorMap = Object.fromEntries(statuses.map((s) => [s.name, s.color]));

  const handleAdd = async () => {
    await api.addStatusChange(jobId, form);
    setAdding(false);
    setForm({ status: "", contactPerson: "", contactLink: "", note: "" });
    onUpdate();
  };

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div key={entry.id} className="flex gap-3 items-start">
          <div
            className="w-3 h-3 rounded-full mt-1.5 shrink-0"
            style={{ backgroundColor: colorMap[entry.status] ?? "#6b7280" }}
          />
          <div>
            <div className="font-medium">{entry.status}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(entry.changedAt).toLocaleDateString()}
              {entry.contactPerson && ` — ${entry.contactPerson}`}
            </div>
            {entry.note && <div className="text-sm">{entry.note}</div>}
          </div>
        </div>
      ))}

      {adding ? (
        <div className="space-y-2 border rounded-lg p-3">
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Contact person" value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          <Input placeholder="Contact link" value={form.contactLink}
            onChange={(e) => setForm({ ...form, contactLink: e.target.value })} />
          <Input placeholder="Note" value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!form.status}>Add</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          + Add Status Change
        </Button>
      )}
    </div>
  );
}
