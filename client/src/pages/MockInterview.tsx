import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QuestionCard } from "@/components/QuestionCard";
import { AddQuestionDialog } from "@/components/AddQuestionDialog";
import { api } from "@/lib/api";
import type { InterviewQuestion } from "@/lib/types";

export function MockInterview() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [search, setSearch] = useState("");
  const [labelFilter, setLabelFilter] = useState<string | null>(null);

  const refresh = () => {
    api.getQuestions().then(setQuestions);
  };

  useEffect(() => { refresh(); }, []);

  const labels = [...new Set(questions.map((q) => q.label))];

  const filtered = questions.filter((q) => {
    const matchesSearch = !search ||
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.answer?.toLowerCase().includes(search.toLowerCase());
    const matchesLabel = !labelFilter || q.label === labelFilter;
    return matchesSearch && matchesLabel;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mock Interview</h1>
        <AddQuestionDialog onCreated={refresh} />
      </div>

      <div className="flex gap-2 items-center">
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-1 flex-wrap">
          <Badge
            variant={labelFilter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setLabelFilter(null)}
          >
            All
          </Badge>
          {labels.map((label) => (
            <Badge
              key={label}
              variant={labelFilter === label ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setLabelFilter(label)}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            onUpdate={refresh}
            onDelete={async () => {
              await api.deleteQuestion(q.id);
              refresh();
            }}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-muted-foreground text-center py-8">
            No questions yet — add your first one!
          </div>
        )}
      </div>
    </div>
  );
}
