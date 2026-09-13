class SettingsRepo {
  constructor(db) { this.db = db; this.up = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"); }
  getAll(prefix = "") { const o = {}; for (const r of this.db.prepare("SELECT key, value FROM settings WHERE key LIKE ?").all(prefix + "%")) o[r.key.slice(prefix.length)] = JSON.parse(r.value); return o; }
  setMany(obj, prefix = "") { const tx = this.db.transaction(o => { for (const [k, v] of Object.entries(o)) this.up.run(prefix + k, JSON.stringify(v)); }); tx(obj); }
}
module.exports = { SettingsRepo };
