import { Hono } from "hono";
import { db } from "../db/index.js";
import { statuses } from "../db/schema.js";
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
  const allStatuses = await db.select().from(statuses);
  const maxOrder = allStatuses.reduce((max, s) => Math.max(max, s.sortOrder), -1);
  const result = db.insert(statuses).values({
    name: body.name,
    color: body.color,
    sortOrder: maxOrder + 1,
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
