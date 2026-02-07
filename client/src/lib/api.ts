const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  // Statuses
  getStatuses: () => request("/statuses"),
  createStatus: (data: { name: string; color: string }) =>
    request("/statuses", { method: "POST", body: JSON.stringify(data) }),

  // Jobs
  getJobs: () => request("/jobs"),
  getJob: (id: number) => request(`/jobs/${id}`),
  createJob: (data: Record<string, unknown>) =>
    request("/jobs", { method: "POST", body: JSON.stringify(data) }),
  updateJob: (id: number, data: Record<string, unknown>) =>
    request(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteJob: (id: number) =>
    request(`/jobs/${id}`, { method: "DELETE" }),

  // Status history
  addStatusChange: (jobId: number, data: Record<string, unknown>) =>
    request(`/jobs/${jobId}/status`, { method: "POST", body: JSON.stringify(data) }),

  // Prep todos
  getTodos: (jobId: number) => request(`/jobs/${jobId}/todos`),
  addTodo: (jobId: number, content: string) =>
    request(`/jobs/${jobId}/todos`, { method: "POST", body: JSON.stringify({ content }) }),
  updateTodo: (jobId: number, todoId: number, data: Record<string, unknown>) =>
    request(`/jobs/${jobId}/todos/${todoId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTodo: (jobId: number, todoId: number) =>
    request(`/jobs/${jobId}/todos/${todoId}`, { method: "DELETE" }),

  // Interview questions
  getQuestions: () => request("/questions"),
  createQuestion: (data: Record<string, unknown>) =>
    request("/questions", { method: "POST", body: JSON.stringify(data) }),
  updateQuestion: (id: number, data: Record<string, unknown>) =>
    request(`/questions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteQuestion: (id: number) =>
    request(`/questions/${id}`, { method: "DELETE" }),

  // Calendar
  getCalendarEvents: (start: string, end: string) =>
    request(`/calendar?start=${start}&end=${end}`),
};
