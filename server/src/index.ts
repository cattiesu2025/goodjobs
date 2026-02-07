import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import statusesRoutes from "./routes/statuses.js";
import jobsRoutes from "./routes/jobs.js";
import questionsRoutes from "./routes/questions.js";
import calendarRoutes from "./routes/calendar.js";

const app = new Hono();

app.get("/api/health", (c) => c.json({ status: "ok" }));

// Mount API routes
app.route("/api/statuses", statusesRoutes);
app.route("/api/jobs", jobsRoutes);
app.route("/api/questions", questionsRoutes);
app.route("/api/calendar", calendarRoutes);

// Serve static frontend in production
app.use("/*", serveStatic({ root: "../client/dist" }));

serve({ fetch: app.fetch, port: 3001 }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});

export default app;
