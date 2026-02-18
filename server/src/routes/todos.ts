import { Hono } from "hono";
import { db } from "../db/index.js";
import { dashboardTodos } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

const app = new Hono();

// GET /api/todos — list all dashboard todos
app.get("/", async (c) => {
  const rows = db.select().from(dashboardTodos).orderBy(desc(dashboardTodos.createdAt)).all();
  return c.json(rows);
});

// POST /api/todos — create a dashboard todo
app.post("/", async (c) => {
  const body = await c.req.json<{ content: string }>();
  const todo = db.insert(dashboardTodos).values({
    content: body.content,
  }).returning().get();
  return c.json(todo, 201);
});

// PUT /api/todos/:id — update a dashboard todo
app.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json<{ content?: string; completed?: boolean }>();
  const result = db.update(dashboardTodos).set({
    content: body.content,
    completed: body.completed,
  }).where(eq(dashboardTodos.id, id)).returning().get();
  return c.json(result);
});

// DELETE /api/todos/:id
app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  db.delete(dashboardTodos).where(eq(dashboardTodos.id, id)).run();
  return c.json({ ok: true });
});

export default app;
