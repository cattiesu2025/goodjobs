import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface Props {
  onCreated: () => void;
}

export function AddQuestionDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", label: "" });

  const handleSubmit = async () => {
    await api.createQuestion(form);
    setOpen(false);
    setForm({ question: "", answer: "", label: "" });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add Question</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Interview Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Label (e.g. Behavioral, Technical)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <Textarea placeholder="Question *" value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            rows={3} />
          <Textarea placeholder="Answer" value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            rows={6} />
          <Button onClick={handleSubmit} disabled={!form.question || !form.label}
            className="w-full">
            Save Question
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
