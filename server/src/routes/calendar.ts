import { Hono } from "hono";
import { db } from "../db/index.js";
import { jobs, jobStatusHistory, statuses } from "../db/schema.js";
import { eq, and, gte, lte } from "drizzle-orm";

const app = new Hono();

// GET /api/calendar?start=2026-03-01&end=2026-03-31
app.get("/", async (c) => {
  const start = c.req.query("start") ?? "2000-01-01";
  const end = c.req.query("end") ?? "2099-12-31";

  // Status change events with job info via join
  const historyEvents = db.select({
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
    .innerJoin(jobs, eq(jobStatusHistory.jobId, jobs.id))
    .where(and(
      gte(jobStatusHistory.changedAt, start),
      lte(jobStatusHistory.changedAt, end)
    ))
    .all();

  // Deadline events
  const allJobs = db.select().from(jobs).all();
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
      note: "Application deadline",
    }));

  // Get status colors
  const statusColors = db.select().from(statuses).all();
  const colorMap = Object.fromEntries(statusColors.map((s) => [s.name, s.color]));

  return c.json({
    events: [...historyEvents, ...deadlineEvents],
    colorMap,
  });
});

export default app;
