import { Hono } from "hono";
import { db } from "../db/index.js";
import { interviewQuestions } from "../db/schema.js";
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
