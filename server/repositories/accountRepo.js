class AccountRepo {
  constructor(db) {
    this.db = db;
    this.upsertStmt = db.prepare(`INSERT INTO accounts (id, email, name, limit_tag, warmup, start, status, signature) VALUES (@id, @email, @name, @limit_tag, @warmup, @start, @status, @signature)
      ON CONFLICT(id) DO UPDATE SET email=excluded.email, name=excluded.name, limit_tag=excluded.limit_tag, warmup=excluded.warmup, start=excluded.start, status=excluded.status, signature=excluded.signature`);
    this.byId = db.prepare("SELECT * FROM accounts WHERE id = ?");
    this.byEmail = db.prepare("SELECT * FROM accounts WHERE lower(email) = lower(?)");
    this.all = db.prepare("SELECT * FROM accounts ORDER BY email");
    this.del = db.prepare("DELETE FROM accounts WHERE id = ?");
  }
  upsert(r) { this.upsertStmt.run(r); return this.byId.get(r.id); }
  get(id) { return this.byId.get(id); }
  findByEmail(e) { return this.byEmail.get(e); }
  list() { return this.all.all(); }
  remove(id) { return this.del.run(id).changes; }
  setOauth(id, json) { this.db.prepare("UPDATE accounts SET oauth_json = ? WHERE id = ?").run(json, id); }
}
module.exports = { AccountRepo };
