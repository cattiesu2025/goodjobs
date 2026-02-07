import { Hono } from "hono";
import { db } from "../db/index.js";
import { jobs, jobStatusHistory, jobPrepTodos } from "../db/schema.js";
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
  const job = db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!job) return c.json({ error: "Not found" }, 404);

  const history = db.select().from(jobStatusHistory)
    .where(eq(jobStatusHistory.jobId, id))
    .orderBy(desc(jobStatusHistory.changedAt))
    .all();

  const todos = db.select().from(jobPrepTodos)
    .where(eq(jobPrepTodos.jobId, id))
    .orderBy(jobPrepTodos.createdAt)
    .all();

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
  const todos = db.select().from(jobPrepTodos)
    .where(eq(jobPrepTodos.jobId, id))
    .orderBy(jobPrepTodos.createdAt)
    .all();
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
