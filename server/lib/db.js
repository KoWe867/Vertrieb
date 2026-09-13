const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

// Öffnet die Datenbank und spielt alle Migrationen aus db/migrations/ in Reihenfolge ein.
function openDb(file = ":memory:") {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  const dir = path.join(__dirname, "..", "db", "migrations");
  const done = new Set(db.prepare("SELECT name FROM migrations").all().map(r => r.name));
  for (const name of fs.readdirSync(dir).filter(f => f.endsWith(".sql")).sort()) {
    if (done.has(name)) continue;
    const sql = fs.readFileSync(path.join(dir, name), "utf8");
    db.transaction(() => { db.exec(sql); db.prepare("INSERT INTO migrations (name, applied_at) VALUES (?, ?)").run(name, new Date().toISOString()); })();
  }
  return db;
}
module.exports = { openDb };
