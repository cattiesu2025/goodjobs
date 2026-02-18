import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

const __dirname = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.resolve(__dirname, "../../goodjob.db");

// Ensure the directory exists before opening the database
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Auto-create tables on first run
const tableCheck = sqlite.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='statuses'"
).get();

if (!tableCheck) {
  console.log("Initializing database tables...");
  sqlite.exec(`
    CREATE TABLE statuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      job_title TEXT NOT NULL,
      website TEXT,
      job_description TEXT,
      contact_person TEXT,
      contact_link TEXT,
      current_status TEXT NOT NULL DEFAULT 'Saved',
      deadline TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE job_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      changed_at TEXT NOT NULL,
      contact_person TEXT,
      contact_link TEXT,
      note TEXT
    );
    CREATE TABLE job_prep_todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE dashboard_todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE interview_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT,
      label TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Seed default statuses
  const insert = sqlite.prepare(
    "INSERT INTO statuses (name, color, sort_order) VALUES (?, ?, ?)"
  );
  const seed = sqlite.transaction((rows: [string, string, number][]) => {
    for (const row of rows) insert.run(...row);
  });
  seed([
    ["Saved", "#94a3b8", 0],
    ["Applied", "#3b82f6", 1],
    ["Resume Screened", "#8b5cf6", 2],
    ["Phone Screen", "#a855f7", 3],
    ["First Interview", "#f59e0b", 4],
    ["Technical Interview", "#f97316", 5],
    ["Final Interview", "#ef4444", 6],
    ["Offer Received", "#22c55e", 7],
    ["Accepted", "#10b981", 8],
    ["Rejected", "#6b7280", 9],
    ["Withdrawn", "#9ca3af", 10],
  ]);
  console.log("Database initialized with default statuses.");
}

// Migrate: add dashboard_todos table if missing
const dashboardTodosCheck = sqlite.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='dashboard_todos'"
).get();
if (!dashboardTodosCheck) {
  console.log("Adding dashboard_todos table...");
  sqlite.exec(`
    CREATE TABLE dashboard_todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

export const db = drizzle(sqlite, { schema });
