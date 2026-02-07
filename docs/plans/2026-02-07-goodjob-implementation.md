# GoodJob Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal job search journey tracker with dashboard, job journal, and mock interview pages.

**Architecture:** Monorepo with React+Vite frontend and Hono+SQLite backend. The server serves both the API and the built frontend static files. Single deployment target.

**Tech Stack:** React, Vite, Tailwind CSS, shadcn/ui, Recharts, react-big-calendar, Hono, better-sqlite3, Drizzle ORM, TypeScript throughout.

**Design doc:** `docs/plans/2026-02-07-goodjob-design.md`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `client/package.json`
- Create: `client/vite.config.ts`
- Create: `client/tsconfig.json`
- Create: `client/index.html`
- Create: `client/src/main.tsx`
- Create: `client/src/App.tsx`
- Create: `client/tailwind.config.ts`
- Create: `client/postcss.config.js`
- Create: `client/src/index.css`
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/index.ts`
- Create: `.gitignore`

**Step 1: Initialize root package.json**

```bash
cd /Users/cattie/Desktop/project/goodjob
npm init -y
```

Edit `package.json` to add workspaces:

```json
{
  "name": "goodjob",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w client\" \"npm run dev -w server\"",
    "build": "npm run build -w client && npm run build -w server",
    "start": "npm run start -w server"
  },
  "devDependencies": {
    "concurrently": "^9.1.0"
  }
}
```

**Step 2: Scaffold Vite + React + TypeScript client**

```bash
cd /Users/cattie/Desktop/project/goodjob
npm create vite@latest client -- --template react-ts
cd client
npm install
```

**Step 3: Install client dependencies**

```bash
cd /Users/cattie/Desktop/project/goodjob/client
npm install react-router-dom recharts react-big-calendar date-fns
npm install -D tailwindcss @tailwindcss/vite @types/react-big-calendar
```

**Step 4: Set up Tailwind CSS**

Update `client/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
```

Replace `client/src/index.css` with:

```css
@import "tailwindcss";
```

**Step 5: Initialize shadcn/ui**

```bash
cd /Users/cattie/Desktop/project/goodjob/client
npx shadcn@latest init
```

Choose: New York style, Zinc color, CSS variables enabled. Then add components we'll need:

```bash
npx shadcn@latest add button card input textarea tabs badge dialog select table
```

**Step 6: Scaffold Hono + SQLite server**

```bash
cd /Users/cattie/Desktop/project/goodjob
mkdir -p server/src
cd server
npm init -y
npm install hono @hono/node-server drizzle-orm better-sqlite3
npm install -D typescript @types/better-sqlite3 @types/node tsx drizzle-kit
```

Create `server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Create `server/package.json` scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**Step 7: Create minimal server entry**

Create `server/src/index.ts`:

```ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

app.get("/api/health", (c) => c.json({ status: "ok" }));

// Serve static frontend in production
app.use("/*", serveStatic({ root: "../client/dist" }));

serve({ fetch: app.fetch, port: 3001 }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});

export default app;
```

**Step 8: Create .gitignore**

```
node_modules/
dist/
*.db
.env
```

**Step 9: Create minimal App with router**

Replace `client/src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <nav className="border-b px-4 py-3 flex gap-4">
          <NavLink to="/" className={({ isActive }) =>
            isActive ? "font-bold" : "text-muted-foreground"
          }>Dashboard</NavLink>
          <NavLink to="/jobs" className={({ isActive }) =>
            isActive ? "font-bold" : "text-muted-foreground"
          }>Job Journal</NavLink>
          <NavLink to="/interview" className={({ isActive }) =>
            isActive ? "font-bold" : "text-muted-foreground"
          }>Mock Interview</NavLink>
        </nav>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<div>Dashboard</div>} />
            <Route path="/jobs" element={<div>Job Journal</div>} />
            <Route path="/interview" element={<div>Mock Interview</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

**Step 10: Install root deps and verify everything runs**

```bash
cd /Users/cattie/Desktop/project/goodjob
npm install
npm run dev
```

Expected: Vite dev server on :5173, Hono server on :3001, `/api/health` returns `{"status":"ok"}`, frontend shows nav + placeholder pages.

**Step 11: Commit**

```bash
git add -A
git commit -m "feat: project scaffolding with React+Vite client and Hono+SQLite server"
```

---

## Task 2: Database Schema & Seed Data

**Files:**
- Create: `server/src/db/schema.ts`
- Create: `server/src/db/index.ts`
- Create: `server/src/db/seed.ts`
- Create: `drizzle.config.ts` (in server/)

**Step 1: Define Drizzle schema**

Create `server/src/db/schema.ts`:

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const statuses = sqliteTable("statuses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(),
  jobTitle: text("job_title").notNull(),
  website: text("website"),
  jobDescription: text("job_description"),
  contactPerson: text("contact_person"),
  contactLink: text("contact_link"),
  currentStatus: text("current_status").notNull().default("Saved"),
  deadline: text("deadline"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const jobStatusHistory = sqliteTable("job_status_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: integer("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  changedAt: text("changed_at").notNull().$defaultFn(() => new Date().toISOString()),
  contactPerson: text("contact_person"),
  contactLink: text("contact_link"),
  note: text("note"),
});

export const jobPrepTodos = sqliteTable("job_prep_todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: integer("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const interviewQuestions = sqliteTable("interview_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  answer: text("answer"),
  label: text("label").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});
```

**Step 2: Create database connection**

Create `server/src/db/index.ts`:

```ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("goodjob.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
```

**Step 3: Create drizzle config**

Create `server/drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: "./goodjob.db" },
});
```

**Step 4: Generate and run migration**

```bash
cd /Users/cattie/Desktop/project/goodjob/server
npx drizzle-kit generate
npx drizzle-kit push
```

**Step 5: Create seed script**

Create `server/src/db/seed.ts`:

```ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { statuses } from "./schema";

const sqlite = new Database("goodjob.db");
const db = drizzle(sqlite);

const defaultStatuses = [
  { name: "Saved", color: "#94a3b8", sortOrder: 0 },
  { name: "Applied", color: "#3b82f6", sortOrder: 1 },
  { name: "Resume Screened", color: "#8b5cf6", sortOrder: 2 },
  { name: "Phone Screen", color: "#a855f7", sortOrder: 3 },
  { name: "First Interview", color: "#f59e0b", sortOrder: 4 },
  { name: "Technical Interview", color: "#f97316", sortOrder: 5 },
  { name: "Final Interview", color: "#ef4444", sortOrder: 6 },
  { name: "Offer Received", color: "#22c55e", sortOrder: 7 },
  { name: "Accepted", color: "#10b981", sortOrder: 8 },
  { name: "Rejected", color: "#6b7280", sortOrder: 9 },
  { name: "Withdrawn", color: "#9ca3af", sortOrder: 10 },
];

db.insert(statuses).values(defaultStatuses).run();
console.log("Seeded default statuses");
sqlite.close();
```

**Step 6: Run seed**

```bash
cd /Users/cattie/Desktop/project/goodjob/server
npx tsx src/db/seed.ts
```

Expected: "Seeded default statuses" logged.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: database schema with Drizzle ORM and seed default statuses"
```

---

## Task 3: API Routes — Statuses

**Files:**
- Create: `server/src/routes/statuses.ts`
- Modify: `server/src/index.ts`

**Step 1: Create statuses routes**

Create `server/src/routes/statuses.ts`:

```ts
import { Hono } from "hono";
import { db } from "../db";
import { statuses } from "../db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

// GET /api/statuses
app.get("/", async (c) => {
  const rows = await db.select().from(statuses).orderBy(statuses.sortOrder);
  return c.json(rows);
});

// POST /api/statuses
app.post("/", async (c) => {
  const body = await c.req.json();
  const maxOrder = await db.select({ max: statuses.sortOrder }).from(statuses);
  const nextOrder = (maxOrder[0]?.max ?? -1) + 1;
  const result = db.insert(statuses).values({
    name: body.name,
    color: body.color,
    sortOrder: nextOrder,
  }).returning().get();
  return c.json(result, 201);
});

// PUT /api/statuses/:id
app.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const result = db.update(statuses)
    .set({ name: body.name, color: body.color, sortOrder: body.sortOrder })
    .where(eq(statuses.id, id))
    .returning().get();
  return c.json(result);
});

// DELETE /api/statuses/:id
app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  db.delete(statuses).where(eq(statuses.id, id)).run();
  return c.json({ ok: true });
});

export default app;
```

**Step 2: Mount statuses routes**

Update `server/src/index.ts` to import and mount:

```ts
import statusesRoutes from "./routes/statuses";

// After health check, before static files
app.route("/api/statuses", statusesRoutes);
```

**Step 3: Test manually**

```bash
curl http://localhost:3001/api/statuses
```

Expected: JSON array of 11 default statuses.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: API routes for statuses CRUD"
```

---

## Task 4: API Routes — Jobs

**Files:**
- Create: `server/src/routes/jobs.ts`
- Modify: `server/src/index.ts`

**Step 1: Create jobs routes**

Create `server/src/routes/jobs.ts`:

```ts
import { Hono } from "hono";
import { db } from "../db";
import { jobs, jobStatusHistory, jobPrepTodos } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const app = new Hono();

// GET /api/jobs — list all jobs
app.get("/", async (c) => {
  const rows = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  return c.json(rows);
});

// GET /api/jobs/:id — single job with history and todos
app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const job = await db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!job) return c.json({ error: "Not found" }, 404);

  const history = await db.select().from(jobStatusHistory)
    .where(eq(jobStatusHistory.jobId, id))
    .orderBy(desc(jobStatusHistory.changedAt));

  const todos = await db.select().from(jobPrepTodos)
    .where(eq(jobPrepTodos.jobId, id))
    .orderBy(jobPrepTodos.createdAt);

  return c.json({ ...job, history, todos });
});

// POST /api/jobs — create new job
app.post("/", async (c) => {
  const body = await c.req.json();
  const job = db.insert(jobs).values({
    company: body.company,
    jobTitle: body.jobTitle,
    website: body.website,
    jobDescription: body.jobDescription,
    contactPerson: body.contactPerson,
    contactLink: body.contactLink,
    currentStatus: body.currentStatus ?? "Saved",
    deadline: body.deadline,
    notes: body.notes,
  }).returning().get();

  // Create initial status history entry
  db.insert(jobStatusHistory).values({
    jobId: job.id,
    status: job.currentStatus,
    contactPerson: body.contactPerson,
    contactLink: body.contactLink,
  }).run();

  return c.json(job, 201);
});

// PUT /api/jobs/:id — update job details
app.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const result = db.update(jobs).set({
    company: body.company,
    jobTitle: body.jobTitle,
    website: body.website,
    jobDescription: body.jobDescription,
    contactPerson: body.contactPerson,
    contactLink: body.contactLink,
    currentStatus: body.currentStatus,
    deadline: body.deadline,
    notes: body.notes,
  }).where(eq(jobs.id, id)).returning().get();
  return c.json(result);
});

// DELETE /api/jobs/:id
app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  db.delete(jobs).where(eq(jobs.id, id)).run();
  return c.json({ ok: true });
});

// POST /api/jobs/:id/status — add status change
app.post("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  const entry = db.insert(jobStatusHistory).values({
    jobId: id,
    status: body.status,
    changedAt: body.changedAt ?? new Date().toISOString(),
    contactPerson: body.contactPerson,
    contactLink: body.contactLink,
    note: body.note,
  }).returning().get();

  // Update current status on the job
  db.update(jobs).set({ currentStatus: body.status }).where(eq(jobs.id, id)).run();

  return c.json(entry, 201);
});

// GET /api/jobs/:id/todos — list prep todos
app.get("/:id/todos", async (c) => {
  const id = Number(c.req.param("id"));
  const todos = await db.select().from(jobPrepTodos)
    .where(eq(jobPrepTodos.jobId, id))
    .orderBy(jobPrepTodos.createdAt);
  return c.json(todos);
});

// POST /api/jobs/:id/todos — add prep todo
app.post("/:id/todos", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const todo = db.insert(jobPrepTodos).values({
    jobId: id,
    content: body.content,
  }).returning().get();
  return c.json(todo, 201);
});

// PUT /api/jobs/:id/todos/:todoId — toggle/update todo
app.put("/:id/todos/:todoId", async (c) => {
  const todoId = Number(c.req.param("todoId"));
  const body = await c.req.json();
  const result = db.update(jobPrepTodos).set({
    content: body.content,
    completed: body.completed,
  }).where(eq(jobPrepTodos.id, todoId)).returning().get();
  return c.json(result);
});

// DELETE /api/jobs/:id/todos/:todoId
app.delete("/:id/todos/:todoId", async (c) => {
  const todoId = Number(c.req.param("todoId"));
  db.delete(jobPrepTodos).where(eq(jobPrepTodos.id, todoId)).run();
  return c.json({ ok: true });
});

export default app;
```

**Step 2: Mount jobs routes**

Update `server/src/index.ts`:

```ts
import jobsRoutes from "./routes/jobs";
app.route("/api/jobs", jobsRoutes);
```

**Step 3: Test manually**

```bash
# Create a job
curl -X POST http://localhost:3001/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"company":"Google","jobTitle":"SWE","currentStatus":"Applied"}'

# List jobs
curl http://localhost:3001/api/jobs
```

Expected: Job created and listed with status history entry.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: API routes for jobs, status history, and prep todos"
```

---

## Task 5: API Routes — Interview Questions & Calendar Events

**Files:**
- Create: `server/src/routes/questions.ts`
- Create: `server/src/routes/calendar.ts`
- Modify: `server/src/index.ts`

**Step 1: Create interview questions routes**

Create `server/src/routes/questions.ts`:

```ts
import { Hono } from "hono";
import { db } from "../db";
import { interviewQuestions } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const app = new Hono();

// GET /api/questions
app.get("/", async (c) => {
  const rows = await db.select().from(interviewQuestions).orderBy(desc(interviewQuestions.createdAt));
  return c.json(rows);
});

// POST /api/questions
app.post("/", async (c) => {
  const body = await c.req.json();
  const result = db.insert(interviewQuestions).values({
    question: body.question,
    answer: body.answer,
    label: body.label,
  }).returning().get();
  return c.json(result, 201);
});

// PUT /api/questions/:id
app.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const result = db.update(interviewQuestions).set({
    question: body.question,
    answer: body.answer,
    label: body.label,
  }).where(eq(interviewQuestions.id, id)).returning().get();
  return c.json(result);
});

// DELETE /api/questions/:id
app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  db.delete(interviewQuestions).where(eq(interviewQuestions.id, id)).run();
  return c.json({ ok: true });
});

export default app;
```

**Step 2: Create calendar events endpoint**

Create `server/src/routes/calendar.ts`:

```ts
import { Hono } from "hono";
import { db } from "../db";
import { jobs, jobStatusHistory, statuses } from "../db/schema";
import { between } from "drizzle-orm";

const app = new Hono();

// GET /api/calendar?start=2026-03-01&end=2026-03-31
app.get("/", async (c) => {
  const start = c.req.query("start") ?? "2000-01-01";
  const end = c.req.query("end") ?? "2099-12-31";

  // Status change events
  const historyEvents = await db.select({
    id: jobStatusHistory.id,
    jobId: jobStatusHistory.jobId,
    company: jobs.company,
    jobTitle: jobs.jobTitle,
    status: jobStatusHistory.status,
    date: jobStatusHistory.changedAt,
    contactPerson: jobStatusHistory.contactPerson,
    note: jobStatusHistory.note,
  })
    .from(jobStatusHistory)
    .innerJoin(jobs, (fields) =>
      fields(jobStatusHistory.jobId, jobs.id)
    )
    .where(between(jobStatusHistory.changedAt, start, end));

  // Deadline events
  const allJobs = await db.select().from(jobs);
  const deadlineEvents = allJobs
    .filter((j) => j.deadline && j.deadline >= start && j.deadline <= end)
    .map((j) => ({
      id: `deadline-${j.id}`,
      jobId: j.id,
      company: j.company,
      jobTitle: j.jobTitle,
      status: "Deadline",
      date: j.deadline,
      contactPerson: null,
      note: `Application deadline`,
    }));

  // Get status colors
  const statusColors = await db.select().from(statuses);
  const colorMap = Object.fromEntries(statusColors.map((s) => [s.name, s.color]));

  return c.json({
    events: [...historyEvents, ...deadlineEvents],
    colorMap,
  });
});

export default app;
```

**Step 3: Mount routes**

Update `server/src/index.ts`:

```ts
import questionsRoutes from "./routes/questions";
import calendarRoutes from "./routes/calendar";
app.route("/api/questions", questionsRoutes);
app.route("/api/calendar", calendarRoutes);
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: API routes for interview questions and calendar events"
```

---

## Task 6: Frontend API Client & Shared Types

**Files:**
- Create: `client/src/lib/api.ts`
- Create: `client/src/lib/types.ts`

**Step 1: Create shared types**

Create `client/src/lib/types.ts`:

```ts
export interface Status {
  id: number;
  name: string;
  color: string;
  sortOrder: number;
}

export interface Job {
  id: number;
  company: string;
  jobTitle: string;
  website: string | null;
  jobDescription: string | null;
  contactPerson: string | null;
  contactLink: string | null;
  currentStatus: string;
  deadline: string | null;
  notes: string | null;
  createdAt: string;
}

export interface JobStatusEntry {
  id: number;
  jobId: number;
  status: string;
  changedAt: string;
  contactPerson: string | null;
  contactLink: string | null;
  note: string | null;
}

export interface JobPrepTodo {
  id: number;
  jobId: number;
  content: string;
  completed: boolean;
  createdAt: string;
}

export interface JobDetail extends Job {
  history: JobStatusEntry[];
  todos: JobPrepTodo[];
}

export interface InterviewQuestion {
  id: number;
  question: string;
  answer: string | null;
  label: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: number | string;
  jobId: number;
  company: string;
  jobTitle: string;
  status: string;
  date: string;
  contactPerson: string | null;
  note: string | null;
}
```

**Step 2: Create API client**

Create `client/src/lib/api.ts`:

```ts
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
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: frontend types and API client"
```

---

## Task 7: Dashboard Page — Summary Cards & Pie Chart

**Files:**
- Create: `client/src/pages/Dashboard.tsx`
- Create: `client/src/components/SummaryCards.tsx`
- Create: `client/src/components/StatusPieChart.tsx`
- Modify: `client/src/App.tsx` (import Dashboard)

**Step 1: Create SummaryCards component**

Create `client/src/components/SummaryCards.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Job } from "@/lib/types";

export function SummaryCards({ jobs }: { jobs: Job[] }) {
  const total = jobs.length;
  const active = jobs.filter((j) =>
    !["Accepted", "Rejected", "Withdrawn"].includes(j.currentStatus)
  ).length;
  const interviews = jobs.filter((j) =>
    j.currentStatus.includes("Interview")
  ).length;
  const offers = jobs.filter((j) => j.currentStatus === "Offer Received").length;

  const cards = [
    { title: "Total", value: total },
    { title: "Active", value: active },
    { title: "Interviews", value: interviews },
    { title: "Offers", value: offers },
  ];

  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Step 2: Create StatusPieChart component**

Create `client/src/components/StatusPieChart.tsx`:

```tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Job, Status } from "@/lib/types";

interface Props {
  jobs: Job[];
  statuses: Status[];
  onSliceClick?: (status: string) => void;
}

export function StatusPieChart({ jobs, statuses, onSliceClick }: Props) {
  const colorMap = Object.fromEntries(statuses.map((s) => [s.name, s.color]));

  const data = statuses
    .map((s) => ({
      name: s.name,
      value: jobs.filter((j) => j.currentStatus === s.name).length,
      color: s.color,
    }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No jobs yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
          onClick={(_, index) => onSliceClick?.(data[index].name)}
          className="cursor-pointer"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

**Step 3: Create Dashboard page**

Create `client/src/pages/Dashboard.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCards } from "@/components/SummaryCards";
import { StatusPieChart } from "@/components/StatusPieChart";
import { api } from "@/lib/api";
import type { Job, Status } from "@/lib/types";

export function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getJobs().then(setJobs);
    api.getStatuses().then(setStatuses);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <SummaryCards jobs={jobs} />
        <Card>
          <CardHeader>
            <CardTitle>Job Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart
              jobs={jobs}
              statuses={statuses}
              onSliceClick={(status) => navigate(`/jobs?status=${status}`)}
            />
          </CardContent>
        </Card>
      </div>
      {/* Calendar will be added in Task 8 */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <div className="text-muted-foreground">Calendar coming next...</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 4: Wire up in App.tsx**

Update `client/src/App.tsx` Route for `/`:

```tsx
import { Dashboard } from "./pages/Dashboard";
// ...
<Route path="/" element={<Dashboard />} />
```

**Step 5: Verify visually**

Open `http://localhost:5173`. Should see summary cards on the left, pie chart on the right (will be empty with "No jobs yet"), and calendar placeholder below.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: dashboard page with summary cards and pie chart"
```

---

## Task 8: Dashboard — Calendar Component

**Files:**
- Create: `client/src/components/DashboardCalendar.tsx`
- Modify: `client/src/pages/Dashboard.tsx`

**Step 1: Create DashboardCalendar**

Create `client/src/components/DashboardCalendar.tsx`:

```tsx
import { useCallback, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { api } from "@/lib/api";
import type { CalendarEvent } from "@/lib/types";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

interface CalEvent extends Event {
  color: string;
  calendarEvent: CalendarEvent;
}

export function DashboardCalendar() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = useCallback(async (date: Date) => {
    const start = startOfMonth(date).toISOString().slice(0, 10);
    const end = endOfMonth(date).toISOString().slice(0, 10);
    const data = await api.getCalendarEvents(start, end) as {
      events: CalendarEvent[];
      colorMap: Record<string, string>;
    };
    setColorMap(data.colorMap);
    setEvents(
      data.events.map((e) => ({
        title: `${e.company} — ${e.status}`,
        start: new Date(e.date),
        end: new Date(e.date),
        allDay: true,
        color: data.colorMap[e.status] ?? "#6b7280",
        calendarEvent: e,
      }))
    );
  }, []);

  useEffect(() => {
    fetchEvents(currentDate);
  }, [currentDate, fetchEvents]);

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
      views={["month", "week"]}
      defaultView="month"
      date={currentDate}
      onNavigate={setCurrentDate}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: (event as CalEvent).color,
          border: "none",
          fontSize: "0.75rem",
        },
      })}
    />
  );
}
```

**Step 2: Add calendar to Dashboard**

Replace the calendar placeholder in `client/src/pages/Dashboard.tsx`:

```tsx
import { DashboardCalendar } from "@/components/DashboardCalendar";

// Replace the placeholder Card with:
<Card>
  <CardHeader>
    <CardTitle>Calendar</CardTitle>
  </CardHeader>
  <CardContent>
    <DashboardCalendar />
  </CardContent>
</Card>
```

**Step 3: Verify**

Open dashboard. Calendar should render with month view. No events yet (that's fine).

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: dashboard calendar with status changes and deadlines"
```

---

## Task 9: Job Journal — List View

**Files:**
- Create: `client/src/pages/JobJournal.tsx`
- Create: `client/src/components/JobList.tsx`
- Create: `client/src/components/AddJobDialog.tsx`
- Modify: `client/src/App.tsx`

**Step 1: Create AddJobDialog**

Create `client/src/components/AddJobDialog.tsx`:

```tsx
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
```

**Step 2: Create JobList**

Create `client/src/components/JobList.tsx`:

```tsx
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
```

**Step 3: Create JobJournal page**

Create `client/src/pages/JobJournal.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { JobList } from "@/components/JobList";
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
        <h1 className="text-2xl font-bold">Job Journal</h1>
        <AddJobDialog statuses={statuses} onCreated={refresh} />
      </div>

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

      {selectedJobId ? (
        <div>
          {/* Job detail view will be added in Task 10 */}
          <button onClick={() => setSelectedJobId(null)} className="text-sm underline mb-4">
            ← Back to list
          </button>
          <div className="text-muted-foreground">Detail view coming next...</div>
        </div>
      ) : (
        <JobList
          jobs={jobs}
          statuses={statuses}
          search={search}
          statusFilter={statusFilter}
          onSelect={(job) => setSelectedJobId(job.id)}
        />
      )}
    </div>
  );
}
```

**Step 4: Wire up in App.tsx**

```tsx
import { JobJournal } from "./pages/JobJournal";
// ...
<Route path="/jobs" element={<JobJournal />} />
```

**Step 5: Verify**

Open `/jobs`. Should see search bar, status filter, "Add Job" button, and empty job list. Create a job via the dialog. It should appear in the list.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: job journal list view with search, filter, and add dialog"
```

---

## Task 10: Job Journal — Detail View with Tabs

**Files:**
- Create: `client/src/components/JobDetail.tsx`
- Create: `client/src/components/JobTimeline.tsx`
- Create: `client/src/components/JobPrep.tsx`
- Modify: `client/src/pages/JobJournal.tsx`

**Step 1: Create JobTimeline**

Create `client/src/components/JobTimeline.tsx`:

```tsx
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
```

**Step 2: Create JobPrep**

Create `client/src/components/JobPrep.tsx`:

```tsx
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
```

**Step 3: Create JobDetail**

Create `client/src/components/JobDetail.tsx`:

```tsx
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { JobTimeline } from "./JobTimeline";
import { JobPrep } from "./JobPrep";
import { api } from "@/lib/api";
import type { JobDetail as JobDetailType, Status } from "@/lib/types";

interface Props {
  jobId: number;
  statuses: Status[];
  onBack: () => void;
}

export function JobDetail({ jobId, statuses, onBack }: Props) {
  const [job, setJob] = useState<JobDetailType | null>(null);
  const colorMap = Object.fromEntries(statuses.map((s) => [s.name, s.color]));

  const refresh = () => {
    api.getJob(jobId).then(setJob);
  };

  useEffect(() => { refresh(); }, [jobId]);

  if (!job) return <div>Loading...</div>;

  const saveNotes = async (notes: string) => {
    await api.updateJob(jobId, { ...job, notes });
    refresh();
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm underline">← Back to list</button>

      <div className="space-y-1">
        <h2 className="text-xl font-bold">{job.company} — {job.jobTitle}</h2>
        <div className="flex items-center gap-3 text-sm">
          <Badge style={{ backgroundColor: colorMap[job.currentStatus] }}>
            {job.currentStatus}
          </Badge>
          {job.contactPerson && <span>Contact: {job.contactPerson}</span>}
          {job.deadline && <span>Deadline: {job.deadline}</span>}
        </div>
        {job.website && (
          <a href={job.website} target="_blank" rel="noreferrer"
            className="text-sm text-blue-500 hover:underline">
            {job.website}
          </a>
        )}
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="prep">Prep</TabsTrigger>
          <TabsTrigger value="jd">JD</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <JobTimeline
            jobId={jobId}
            history={job.history}
            statuses={statuses}
            onUpdate={refresh}
          />
        </TabsContent>

        <TabsContent value="prep">
          <JobPrep jobId={jobId} todos={job.todos} onUpdate={refresh} />
        </TabsContent>

        <TabsContent value="jd">
          <div className="whitespace-pre-wrap text-sm">
            {job.jobDescription || "No job description saved."}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <Textarea
            defaultValue={job.notes ?? ""}
            rows={10}
            onBlur={(e) => saveNotes(e.target.value)}
            placeholder="Add notes..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Step 4: Wire into JobJournal**

Replace the placeholder in `client/src/pages/JobJournal.tsx`:

```tsx
import { JobDetail } from "@/components/JobDetail";

// Replace the selectedJobId block:
{selectedJobId ? (
  <JobDetail
    jobId={selectedJobId}
    statuses={statuses}
    onBack={() => { setSelectedJobId(null); refresh(); }}
  />
) : (
  <JobList ... />
)}
```

**Step 5: Verify**

Create a job, click it, see the detail view with all 4 tabs. Add a status change, add a prep todo, check tabs work.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: job detail view with timeline, prep, JD, and notes tabs"
```

---

## Task 11: Mock Interview Page

**Files:**
- Create: `client/src/pages/MockInterview.tsx`
- Create: `client/src/components/QuestionCard.tsx`
- Create: `client/src/components/AddQuestionDialog.tsx`
- Create: `client/src/lib/tts.ts`
- Modify: `client/src/App.tsx`

**Step 1: Create TTS helper**

Create `client/src/lib/tts.ts`:

```ts
export function speak(text: string, rate: number = 1) {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-speech is not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
}
```

**Step 2: Create AddQuestionDialog**

Create `client/src/components/AddQuestionDialog.tsx`:

```tsx
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
```

**Step 3: Create QuestionCard**

Create `client/src/components/QuestionCard.tsx`:

```tsx
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { speak, stopSpeaking } from "@/lib/tts";
import { api } from "@/lib/api";
import type { InterviewQuestion } from "@/lib/types";

interface Props {
  question: InterviewQuestion;
  onUpdate: () => void;
  onDelete: () => void;
}

export function QuestionCard({ question, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [answer, setAnswer] = useState(question.answer ?? "");
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);

  const saveAnswer = async () => {
    await api.updateQuestion(question.id, { ...question, answer });
    setEditing(false);
    onUpdate();
  };

  const handlePlay = () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
    } else if (answer) {
      setPlaying(true);
      speak(answer, speed);
      // Reset playing state when done
      const utterance = new SpeechSynthesisUtterance(answer);
      utterance.onend = () => setPlaying(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{question.label}</Badge>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
        <div className="font-medium pt-1">{question.question}</div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-2">
            <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveAnswer}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {answer || "No answer yet — click Edit to add one."}
          </div>
        )}

        {answer && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t">
            <Button size="sm" variant="outline" onClick={handlePlay}>
              {playing ? "⏹ Stop" : "🔊 Play Answer"}
            </Button>
            <div className="flex items-center gap-1 text-sm">
              <span>Speed:</span>
              {[0.5, 0.75, 1, 1.25].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-xs ${
                    speed === s ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 4: Create MockInterview page**

Create `client/src/pages/MockInterview.tsx`:

```tsx
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
```

**Step 5: Wire up in App.tsx**

```tsx
import { MockInterview } from "./pages/MockInterview";
// ...
<Route path="/interview" element={<MockInterview />} />
```

**Step 6: Verify**

Open `/interview`. Add a question with label and answer. Click "Play Answer" — should hear TTS. Speed control should work.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: mock interview page with TTS playback and speed control"
```

---

## Task 12: UI Polish & Mobile Responsiveness

Use the `frontend-design` skill for this task to ensure high design quality.

**Files:**
- Modify: `client/src/App.tsx` (nav styling, mobile menu)
- Modify: `client/src/index.css` (global styles)
- Modify: all page and component files (spacing, responsive tweaks)

**Step 1: Polish the navigation**

Update `client/src/App.tsx` nav to be mobile-friendly with a clean design:
- App name "GoodJob" on the left
- Nav links
- On mobile: hamburger menu or bottom tab bar

**Step 2: Add global styles**

Update `client/src/index.css`:
- Smooth font rendering
- Custom scrollbar
- Consistent spacing

**Step 3: Responsive breakpoints**

Review each page and ensure:
- Dashboard: cards/chart stack on mobile, calendar goes to agenda view
- Job Journal: list is full-width on mobile, detail tabs scroll horizontally
- Mock Interview: cards are full-width on mobile

**Step 4: Visual polish**

- Consistent card shadows and rounded corners
- Status badge colors are readable (white text on dark backgrounds)
- Hover states on interactive elements
- Loading states where data is being fetched

**Step 5: Verify on mobile**

Use browser dev tools mobile viewport (375px width). All pages should be usable.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: UI polish and mobile responsiveness"
```

---

## Task 13: Build & Deployment Setup

**Files:**
- Modify: `server/src/index.ts` (serve static files in production)
- Create: `Dockerfile` (optional, for Railway/Fly.io)
- Modify: root `package.json` (build scripts)

**Step 1: Update server to serve built frontend**

Ensure `server/src/index.ts` serves the Vite build output in production:

```ts
import { serveStatic } from "@hono/node-server/serve-static";
import path from "path";

// Serve API routes first (already done)

// Then serve static frontend
if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: path.resolve(__dirname, "../../client/dist") }));
}
```

**Step 2: Create Dockerfile**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -w client
RUN npm run build -w server

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

**Step 3: Update root build scripts**

Ensure `npm run build` builds both client and server, and `npm start` runs the production server.

**Step 4: Test production build locally**

```bash
npm run build
NODE_ENV=production npm start
```

Open `http://localhost:3001`. Should see the full app served from the production build.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: production build and Dockerfile for deployment"
```

---

## Summary

| Task | Description | Estimated Steps |
|------|-------------|-----------------|
| 1 | Project scaffolding | 11 |
| 2 | Database schema & seed | 7 |
| 3 | API — Statuses | 4 |
| 4 | API — Jobs | 4 |
| 5 | API — Questions & Calendar | 4 |
| 6 | Frontend types & API client | 3 |
| 7 | Dashboard — Cards & Pie Chart | 6 |
| 8 | Dashboard — Calendar | 4 |
| 9 | Job Journal — List View | 6 |
| 10 | Job Journal — Detail View | 6 |
| 11 | Mock Interview Page | 7 |
| 12 | UI Polish & Mobile | 6 |
| 13 | Build & Deployment | 5 |
