const { AccountService } = require("./AccountService");
const NICHT_ERREICHT = new Set(["nicht_erreicht", "mailbox", "zentrale", "falsche_nummer"]);

class ReportService {
  constructor(leadRepo, accountRepo) { this.leads = leadRepo; this.accounts = accountRepo; }
  heute(tag = new Date().toISOString().slice(0, 10)) {
    const r = { tag, anrufe: 0, erreicht: 0, termine: 0, mails: 0, antworten: 0, bounces: 0, abmeldungen: 0, mailsJeKonto: {}, neueLeads: 0, hot: 0, warm: 0, cold: 0, pipeline: this.leads.statusCounts(), konten: [] };
    for (const k of this.leads.kontakteSince(tag)) {
      if (!k.ts.startsWith(tag)) continue;
      if (k.typ === "anruf") { r.anrufe++; if (!NICHT_ERREICHT.has(k.ergebnis)) r.erreicht++; if (k.ergebnis === "termin") r.termine++; }
      if (k.typ === "email") { r.mails++; if (k.account_id) r.mailsJeKonto[k.account_id] = (r.mailsJeKonto[k.account_id] || 0) + 1; }
      if (k.typ === "notiz") { const n = (k.notiz || "").toLowerCase(); if (/antwort/.test(n)) r.antworten++; if (/bounce|unzustellbar/.test(n)) r.bounces++; if (/\bstop\b|abmeld|unsubscribe/.test(n)) r.abmeldungen++; }
    }
    for (const l of this.leads.createdSince(tag)) { r.neueLeads++; if (l.klasse in r) r[l.klasse]++; }
    r.konten = this.accounts.list().map(a => ({ id: a.id, email: a.email, status: a.status, gesendet: r.mailsJeKonto[a.id] || 0, limit: AccountService.limitToday(a) }));
    r.kontingent = r.konten.filter(a => a.status !== "pausiert").reduce((s, a) => s + Math.max(0, a.limit - a.gesendet), 0);
    return r;
  }
}
module.exports = { ReportService };
