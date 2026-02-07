import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { JobPrepTodo } from "@/lib/types";

interface Props {
  jobId: number;
  todos: JobPrepTodo[];
  onUpdate: () => void;
}

export function JobPrep({ jobId, todos, onUpdate }: Props) {
  const [newTodo, setNewTodo] = useState("");

  const handleAdd = async () => {
    if (!newTodo.trim()) return;
    await api.addTodo(jobId, newTodo.trim());
    setNewTodo("");
    onUpdate();
  };

  const toggleTodo = async (todo: JobPrepTodo) => {
    await api.updateTodo(jobId, todo.id, { ...todo, completed: !todo.completed });
    onUpdate();
  };

  const deleteTodo = async (todoId: number) => {
    await api.deleteTodo(jobId, todoId);
    onUpdate();
  };

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo)}
            className="h-4 w-4"
          />
          <span className={todo.completed ? "line-through text-muted-foreground" : ""}>
            {todo.content}
          </span>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="ml-auto text-muted-foreground hover:text-destructive text-sm"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          placeholder="Add prep todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button size="sm" onClick={handleAdd}>Add</Button>
      </div>
    </div>
  );
}
