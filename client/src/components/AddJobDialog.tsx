import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Status } from "@/lib/types";

interface Props {
  statuses: Status[];
  onCreated: () => void;
}

export function AddJobDialog({ statuses, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    company: "",
    jobTitle: "",
    website: "",
    jobDescription: "",
    contactPerson: "",
    contactLink: "",
    currentStatus: "Saved",
    deadline: "",
  });

  const handleSubmit = async () => {
    await api.createJob(form);
    setOpen(false);
    setForm({
      company: "", jobTitle: "", website: "", jobDescription: "",
      contactPerson: "", contactLink: "", currentStatus: "Saved", deadline: "",
    });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add Job</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Company *" value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Input placeholder="Job Title *" value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
          <Input placeholder="Website URL" value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input placeholder="Contact Person" value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          <Input placeholder="Contact Link (LinkedIn/Email)" value={form.contactLink}
            onChange={(e) => setForm({ ...form, contactLink: e.target.value })} />
          <Input type="date" placeholder="Application Deadline" value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <Select value={form.currentStatus}
            onValueChange={(v) => setForm({ ...form, currentStatus: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea placeholder="Job Description (paste JD here)" value={form.jobDescription}
            onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
            rows={6} />
          <Button onClick={handleSubmit} disabled={!form.company || !form.jobTitle}
            className="w-full">
            Save Job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
