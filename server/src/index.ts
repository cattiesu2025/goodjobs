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
