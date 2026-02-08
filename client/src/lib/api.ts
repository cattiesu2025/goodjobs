const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

import type {
  Status,
  Job,
  JobDetail,
  JobPrepTodo,
  InterviewQuestion,
  CalendarEvent,
} from "./types";

export const api = {
  // Statuses
  getStatuses: () => request<Status[]>("/statuses"),
  createStatus: (data: { name: string; color: string }) =>
    request<Status>("/statuses", { method: "POST", body: JSON.stringify(data) }),

  // Jobs
  getJobs: () => request<Job[]>("/jobs"),
  getJob: (id: number) => request<JobDetail>(`/jobs/${id}`),
  createJob: (data: Record<string, unknown>) =>
    request<Job>("/jobs", { method: "POST", body: JSON.stringify(data) }),
  updateJob: (id: number, data: Record<string, unknown>) =>
    request<Job>(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteJob: (id: number) =>
    request<void>(`/jobs/${id}`, { method: "DELETE" }),

  // Status history
  addStatusChange: (jobId: number, data: Record<string, unknown>) =>
    request<void>(`/jobs/${jobId}/status`, { method: "POST", body: JSON.stringify(data) }),

  // Prep todos
  getTodos: (jobId: number) => request<JobPrepTodo[]>(`/jobs/${jobId}/todos`),
  addTodo: (jobId: number, content: string) =>
    request<JobPrepTodo>(`/jobs/${jobId}/todos`, { method: "POST", body: JSON.stringify({ content }) }),
  updateTodo: (jobId: number, todoId: number, data: Record<string, unknown>) =>
    request<JobPrepTodo>(`/jobs/${jobId}/todos/${todoId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTodo: (jobId: number, todoId: number) =>
    request<void>(`/jobs/${jobId}/todos/${todoId}`, { method: "DELETE" }),

  // Interview questions
  getQuestions: () => request<InterviewQuestion[]>("/questions"),
  createQuestion: (data: Record<string, unknown>) =>
    request<InterviewQuestion>("/questions", { method: "POST", body: JSON.stringify(data) }),
  updateQuestion: (id: number, data: Record<string, unknown>) =>
    request<InterviewQuestion>(`/questions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteQuestion: (id: number) =>
    request<void>(`/questions/${id}`, { method: "DELETE" }),

  // Calendar
  getCalendarEvents: (start: string, end: string) =>
    request<{ events: CalendarEvent[]; colorMap: Record<string, string> }>(`/calendar?start=${start}&end=${end}`),
};
