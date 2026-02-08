import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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
const __dirname = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../../client/dist");

if (fs.existsSync(clientDist)) {
  app.use("/*", serveStatic({ root: clientDist }));

  // SPA fallback — serve index.html for any non-API route
  app.get("*", (c) => {
    const indexPath = path.join(clientDist, "index.html");
    const html = fs.readFileSync(indexPath, "utf-8");
    return c.html(html);
  });
}

serve({ fetch: app.fetch, port: 3001 }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});

export default app;
