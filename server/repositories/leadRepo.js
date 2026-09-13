const COLS = ["id", "firma", "ansprechpartner", "telefon", "email", "website", "branche", "markt", "sprache", "kanal", "stadt", "status", "naechster", "notizen", "quelle", "score", "klasse", "lat", "lon", "erstellt", "aktualisiert"];

class LeadRepo {
  constructor(db) {
    this.db = db;
    this.upsertStmt = db.prepare(`INSERT INTO leads (${COLS.join(",")}) VALUES (${COLS.map(c => "@" + c).join(",")})
      ON CONFLICT(id) DO UPDATE SET ${COLS.filter(c => c !== "id" && c !== "erstellt").map(c => `${c}=excluded.${c}`).join(",")}`);
    this.byId = db.prepare("SELECT * FROM leads WHERE id = ?");
    this.byQuelle = db.prepare("SELECT * FROM leads WHERE quelle = ? AND quelle <> '' AND quelle <> 'csv'");
    this.byFirmaStadt = db.prepare("SELECT * FROM leads WHERE lower(firma) = lower(?) AND lower(stadt) = lower(?)");
    this.del = db.prepare("DELETE FROM leads WHERE id = ?");
    this.kontakteByLead = db.prepare("SELECT id, ts, typ, ergebnis, notiz, account_id AS account FROM kontakte WHERE lead_id = ? ORDER BY ts");
    this.insertKontakt = db.prepare("INSERT INTO kontakte (lead_id, ts, typ, ergebnis, notiz, account_id) VALUES (?, ?, ?, ?, ?, ?)");
    this.deleteKontakte = db.prepare("DELETE FROM kontakte WHERE lead_id = ?");
  }
  upsert(row) { this.upsertStmt.run(row); return this.get(row.id); }
  get(id) { const r = this.byId.get(id); return r ? { ...r, kontakte: this.kontakteByLead.all(id) } : null; }
  findByQuelle(q) { return q ? this.byQuelle.get(q) : null; }
  findByFirmaStadt(f, s) { return this.byFirmaStadt.get(f, s || ""); }
  remove(id) { return this.del.run(id).changes; }
  list({ status, markt, klasse, kanal, faellig, q, limit = 1000 } = {}) {
    const w = [], p = [];
    if (status) { w.push("status = ?"); p.push(status); }
    if (markt) { w.push("markt = ?"); p.push(markt); }
    if (klasse) { w.push("klasse = ?"); p.push(klasse); }
    if (kanal) { w.push("kanal = ?"); p.push(kanal); }
    if (faellig) { w.push("naechster <> '' AND substr(naechster,1,10) <= ? AND status NOT IN ('kunde','kein_interesse','nicht_anrufen')"); p.push(new Date().toISOString().slice(0, 10)); }
    if (q) { w.push("(lower(firma) LIKE ? OR lower(stadt) LIKE ? OR lower(notizen) LIKE ? OR telefon LIKE ?)"); const l = `%${q.toLowerCase()}%`; p.push(l, l, l, l); }
    const rows = this.db.prepare(`SELECT * FROM leads ${w.length ? "WHERE " + w.join(" AND ") : ""} ORDER BY score DESC, erstellt DESC LIMIT ?`).all(...p, limit);
    const kontakte = this.db.prepare("SELECT lead_id, id, ts, typ, ergebnis, notiz, account_id AS account FROM kontakte ORDER BY ts").all();
    const byLead = {}; for (const k of kontakte) (byLead[k.lead_id] = byLead[k.lead_id] || []).push(k);
    return rows.map(r => ({ ...r, kontakte: (byLead[r.id] || []).map(({ lead_id, ...k }) => k) }));
  }
  addKontakt(leadId, k) { this.insertKontakt.run(leadId, k.ts, k.typ, k.ergebnis || "", k.notiz || "", k.account || k.account_id || null); }
  replaceKontakte(leadId, list) { this.deleteKontakte.run(leadId); for (const k of list) this.addKontakt(leadId, k); }
  allIds() { return this.db.prepare("SELECT id FROM leads").all().map(r => r.id); }
  count() { return this.db.prepare("SELECT COUNT(*) AS n FROM leads").get().n; }
  kontakteSince(iso) { return this.db.prepare("SELECT k.*, l.erstellt AS lead_erstellt FROM kontakte k JOIN leads l ON l.id = k.lead_id WHERE k.ts >= ?").all(iso); }
  createdSince(iso) { return this.db.prepare("SELECT id, klasse FROM leads WHERE erstellt >= ?").all(iso); }
  statusCounts() { const o = {}; for (const r of this.db.prepare("SELECT status, COUNT(*) AS n FROM leads GROUP BY status").all()) o[r.status] = r.n; return o; }
}
module.exports = { LeadRepo, COLS };
