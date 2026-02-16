import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { getCookie, setCookie } from "hono/cookie";
import statusesRoutes from "./routes/statuses.js";
import jobsRoutes from "./routes/jobs.js";
import questionsRoutes from "./routes/questions.js";
import calendarRoutes from "./routes/calendar.js";

const app = new Hono();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function makeToken(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Login endpoint
app.post("/api/login", async (c) => {
  if (!ADMIN_PASSWORD) {
    return c.json({ error: "ADMIN_PASSWORD not configured" }, 500);
  }
  const body = await c.req.json<{ password: string }>();
  if (body.password !== ADMIN_PASSWORD) {
    return c.json({ error: "Wrong password" }, 401);
  }
  setCookie(c, "auth", makeToken(ADMIN_PASSWORD), {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return c.json({ ok: true });
});

// Auth check endpoint
app.get("/api/auth", (c) => {
  if (!ADMIN_PASSWORD) return c.json({ authenticated: true });
  const token = getCookie(c, "auth");
  if (token === makeToken(ADMIN_PASSWORD)) {
    return c.json({ authenticated: true });
  }
  return c.json({ authenticated: false }, 401);
});

app.get("/api/health", (c) => c.json({ status: "ok" }));

// Auth middleware for all other API routes
app.use("/api/*", async (c, next) => {
  if (!ADMIN_PASSWORD) return next();
  const token = getCookie(c, "auth");
  if (token === makeToken(ADMIN_PASSWORD)) {
    return next();
  }
  return c.json({ error: "Unauthorized" }, 401);
});

// Mount API routes
app.route("/api/statuses", statusesRoutes);
app.route("/api/jobs", jobsRoutes);
app.route("/api/questions", questionsRoutes);
app.route("/api/calendar", calendarRoutes);

// Serve static frontend in production
const __dirname =
  import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
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

const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});

export default app;
