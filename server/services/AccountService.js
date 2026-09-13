const { HttpError } = require("../lib/apiResponse");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

class AccountService {
  constructor(repo) { this.repo = repo; }
  toRow(i, ex = null) {
    return { id: i.id || ex?.id || uid(), email: i.email ?? ex?.email, name: i.name ?? ex?.name ?? "", limit_tag: i.limit ?? ex?.limit_tag ?? 300,
      warmup: (i.warmup ?? (ex ? !!ex.warmup : true)) ? 1 : 0, start: i.start ?? ex?.start ?? new Date().toISOString().slice(0, 10),
      status: i.status ?? ex?.status ?? "nicht verbunden", signature: i.signature ?? ex?.signature ?? "" };
  }
  list() { return this.repo.list(); }
  get(id) { const a = this.repo.get(id); if (!a) throw new HttpError(404, "Konto nicht gefunden"); return a; }
  create(i) { if (this.repo.findByEmail(i.email)) throw new HttpError(409, "Konto mit dieser E-Mail existiert bereits"); return this.repo.upsert(this.toRow(i)); }
  update(id, i) { const ex = this.get(id); return this.repo.upsert(this.toRow({ ...i, id }, ex)); }
  remove(id) { this.get(id); this.repo.remove(id); }
  // Warm-up: Tag 1 = 20, täglich +20 bis zum Limit.
  static limitToday(a, at = Date.now()) {
    if (!a.warmup || !a.start) return a.limit_tag;
    const days = Math.floor((at - new Date(a.start).getTime()) / 86400e3) + 1;
    return Math.min(a.limit_tag, Math.max(20, days * 20));
  }
  importMany(list, mode = "merge") {
    let n = 0; const keep = new Set();
    const tx = this.repo.db.transaction(() => {
      for (const a of list) { const ex = (a.id && this.repo.get(a.id)) || this.repo.findByEmail(a.email); const row = this.toRow({ ...a, id: ex?.id || a.id }, ex); this.repo.upsert(row); keep.add(row.id); n++; }
      if (mode === "replace") for (const a of this.repo.list()) if (!keep.has(a.id)) this.repo.remove(a.id);
    });
    tx(); return n;
  }
}
module.exports = { AccountService };
