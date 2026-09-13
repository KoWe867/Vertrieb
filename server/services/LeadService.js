const { HttpError } = require("../lib/apiResponse");
const MARKET_LANG = { de: "de", at: "de", ch: "de", us: "en", ca: "en", uk: "en", ie: "en", au: "en", nz: "en", intl: "en" };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const now = () => new Date().toISOString();

class LeadService {
  constructor(repo) { this.repo = repo; }

  toRow(input, existing = null) {
    const ts = now();
    return {
      id: input.id || existing?.id || uid(),
      firma: input.firma ?? existing?.firma, ansprechpartner: input.ansprechpartner ?? existing?.ansprechpartner ?? "",
      telefon: input.telefon ?? existing?.telefon ?? "", email: input.email ?? existing?.email ?? "", website: input.website ?? existing?.website ?? "",
      branche: input.branche ?? existing?.branche ?? "", markt: input.markt ?? existing?.markt ?? "de",
      sprache: input.sprache ?? existing?.sprache ?? MARKET_LANG[input.markt ?? existing?.markt ?? "de"],
      kanal: input.kanal ?? existing?.kanal ?? "", stadt: input.stadt ?? existing?.stadt ?? "", status: input.status ?? existing?.status ?? "neu",
      naechster: input.naechster ?? existing?.naechster ?? "", notizen: input.notizen ?? existing?.notizen ?? "", quelle: input.quelle ?? existing?.quelle ?? "",
      score: input.score ?? existing?.score ?? 0, klasse: input.klasse ?? existing?.klasse ?? "", lat: input.lat ?? existing?.lat ?? null, lon: input.lon ?? existing?.lon ?? null,
      erstellt: existing?.erstellt || input.erstellt || ts, aktualisiert: ts
    };
  }
  list(filter) { return this.repo.list(filter); }
  get(id) { const l = this.repo.get(id); if (!l) throw new HttpError(404, "Lead nicht gefunden"); return l; }
  create(input) {
    if (input.quelle && this.repo.findByQuelle(input.quelle)) throw new HttpError(409, "Lead mit dieser Quelle existiert bereits");
    if (this.repo.findByFirmaStadt(input.firma, input.stadt)) throw new HttpError(409, "Firma in dieser Stadt existiert bereits");
    const row = this.toRow(input);
    const lead = this.repo.upsert(row);
    if (input.kontakte?.length) this.repo.replaceKontakte(row.id, input.kontakte);
    return this.repo.get(row.id);
  }
  update(id, input) { const ex = this.get(id); this.repo.upsert(this.toRow({ ...input, id }, ex)); return this.repo.get(id); }
  remove(id) { this.get(id); this.repo.remove(id); }
  // Kontakt loggen und Folgezustand setzen (Status, Wiedervorlage). Regeln wie in der App.
  addKontakt(id, k) {
    const lead = this.get(id);
    this.repo.addKontakt(id, { ts: now(), typ: k.typ, ergebnis: k.ergebnis, notiz: k.notiz, account: k.account_id || null });
    const patch = {};
    if (k.status) patch.status = k.status;
    if (k.naechster !== undefined) patch.naechster = k.naechster;
    const calls = lead.kontakte.filter(x => x.typ === "anruf").length + (k.typ === "anruf" ? 1 : 0);
    const mails = lead.kontakte.filter(x => x.typ === "email").length + (k.typ === "email" ? 1 : 0);
    if (k.typ === "anruf" && k.ergebnis === "nicht_erreicht" && calls >= 8) { patch.status = "kein_interesse"; patch.naechster = ""; }
    if (k.typ === "email" && mails >= 3 && !k.status) { patch.status = "kein_interesse"; patch.naechster = ""; }
    if (Object.keys(patch).length) this.repo.upsert(this.toRow(patch, this.repo.get(id)));
    return this.repo.get(id);
  }
  // Import/Sync: Upsert nach id, Duplikate nach Quelle bzw. Firma+Stadt zusammenführen.
  importMany(list, mode = "merge") {
    let created = 0, updated = 0;
    const keep = new Set();
    const tx = this.repo.db.transaction(() => {
      for (const l of list) {
        const ex = (l.id && this.repo.get(l.id)) || (l.quelle && this.repo.findByQuelle(l.quelle)) || this.repo.findByFirmaStadt(l.firma, l.stadt);
        const row = this.toRow({ ...l, id: ex?.id || l.id }, ex ? this.repo.get(ex.id) : null);
        this.repo.upsert(row); keep.add(row.id);
        if (Array.isArray(l.kontakte)) this.repo.replaceKontakte(row.id, l.kontakte);
        ex ? updated++ : created++;
      }
      if (mode === "replace") for (const id of this.repo.allIds()) if (!keep.has(id)) this.repo.remove(id);
    });
    tx();
    return { created, updated, total: this.repo.count() };
  }
}
module.exports = { LeadService };
