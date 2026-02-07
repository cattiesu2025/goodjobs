import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { statuses } from "./schema.js";

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
