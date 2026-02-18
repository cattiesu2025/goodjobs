import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCards } from "@/components/SummaryCards";
import { StatusPieChart } from "@/components/StatusPieChart";
import { DashboardCalendar } from "@/components/DashboardCalendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Job, Status, DashboardTodo } from "@/lib/types";

export function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [todos, setTodos] = useState<DashboardTodo[]>([]);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getJobs().then(setJobs);
    api.getStatuses().then(setStatuses);
    api.getDashboardTodos().then(setTodos);
  }, []);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const addTodo = async () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    try {
      const todo = await api.addDashboardTodo(trimmed);
      setTodos((prev) => [todo, ...prev]);
      setNewText("");
      setAdding(false);
    } catch {
      console.error("Failed to add todo");
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const updated = await api.updateDashboardTodo(id, { completed: !todo.completed });
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const sortedTodos = (() => {
    const active = todos.filter((t) => !t.completed).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const done = todos.filter((t) => t.completed).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return [...active, ...done];
  })();

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
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                To Do List
              </CardTitle>
              {!adding && (
                <button
                  onClick={() => setAdding(true)}
                  className="text-muted-foreground hover:text-foreground text-lg leading-none transition-colors"
                  aria-label="Add todo"
                >
                  +
                </button>
              )}
            </CardHeader>
            <CardContent className="space-y-1">
              {adding && (
                <form
                  onSubmit={(e) => { e.preventDefault(); addTodo(); }}
                  className="flex items-center gap-2 mb-2"
                >
                  <Input
                    ref={inputRef}
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Add a task..."
                    className="h-7 text-sm"
                  />
                  <Button type="submit" size="xs" disabled={!newText.trim()}>
                    Add
                  </Button>
                  <Button type="button" size="xs" variant="ghost" onClick={() => { setAdding(false); setNewText(""); }}>
                    ✕
                  </Button>
                </form>
              )}
              {sortedTodos.length === 0 && !adding && (
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              )}
              {sortedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-start gap-2 rounded px-2 py-1.5 transition-colors cursor-pointer group ${todo.completed ? "opacity-50" : "hover:bg-muted/50"}`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  <span className={`mt-0.5 flex-shrink-0 size-4 rounded-full border-2 flex items-center justify-center transition-colors ${todo.completed ? "border-muted-foreground bg-muted-foreground" : "border-muted-foreground"}`}>
                    {todo.completed && (
                      <svg className="size-2.5 text-background" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-tight ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                      {todo.content}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(todo.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
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
