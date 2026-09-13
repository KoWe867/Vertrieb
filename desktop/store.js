/* Gemeinsamer Datenzugriff für Desktop und Handy-App (gleicher localStorage, gleiche Schlüssel). */
window.AlwineStore = (function () {
  const K = { leads: "alwine.leads.v1", settings: "alwine.settings.v1", searches: "alwine.searches.v1", accounts: "alwine.accounts.v1", profil: "alwine.profil.v1" };
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const MARKETS = window.ALWINE_SOURCES.MARKETS;
  const KETTEN = ["mcdonald", "burger king", "subway", "starbucks", "rewe", "edeka", "aldi", "lidl", "netto", "penny", "kaufland", "dm ", "rossmann", "deichmann", "h&m", "c&a", "zara", "media markt", "saturn", "obi", "bauhaus", "hornbach", "toom", "ikea", "fielmann", "apollo", "vodafone", "telekom", "o2", "sparkasse", "volksbank", "commerzbank", "deutsche bank", "postbank", "allianz", "ergo", "atu", "a.t.u", "euromaster", "pitstop", "vergölst", "sixt", "europcar", "hertz", "avis", "shell", "aral", "esso", "total", "jet", "block house", "vapiano", "nordsee", "kfc", "domino", "pizza hut", "ihle", "kamps", "backwerk", "ditsch", "thalia", "hugendubel", "douglas", "tchibo", "kik", "takko", "ernsting", "action", "woolworth", "tedi", "fressnapf", "dehner", "hagebau", "expert", "euronics", "cyberport", "apotheke zur", "dr. oetker", "autohaus wolfsburg", "wellness", "mrs.sporty", "fitx", "mcfit", "clever fit", "john reed", "kieser", "holmes place", "engel & völkers", "von poll", "remax", "re/max", "century 21", "dahler", "mccafe", "tim hortons", "five guys", "chipotle", "walmart", "target", "home depot", "lowe's", "cvs", "walgreens", "autozone", "jiffy lube", "midas", "firestone", "goodyear", "tesco", "sainsbury", "asda", "boots", "greggs", "costa", "pret", "nando", "wetherspoon", "halfords", "kwik fit"];

  function scoreLead(l) {
    let s = 0; const sig = [];
    const name = (l.firma || "").toLowerCase();
    if (KETTEN.some(k => name.includes(k)) || /\b(gmbh & co\. kg|filiale|niederlassung)\b/.test(name) && /\b(nr\.|#)\s*\d/.test(name)) { sig.push("Kette"); s -= 40; }
    if (!l.website) { s += 30; sig.push("keine Webseite"); } else if (!l.email) { s += 10; sig.push("Webseite ohne E-Mail"); }
    if (l.telefon) s += 10;
    const n = (l.notizen || "").toLowerCase();
    if (l.neu || /neueröffnung|neu eröffnet|new opening|start_date|opening_date/.test(n)) { s += 25; sig.push("Neueröffnung"); }
    if (/wenige bewertungen|few reviews|keine bewertungen/.test(n)) { s += 15; sig.push("wenige Bewertungen"); }
    if (/kein(e)? social|letzter post|no social/.test(n)) { s += 10; sig.push("kein Social"); }
    if (/sucht personal|stellenanzeige|hiring|indeed/.test(n)) { s += 15; sig.push("sucht Personal"); }
    if (/nicht mobil|kein formular|veraltet|not mobile|no form|outdated/.test(n)) { s += 20; sig.push("Webseite schwach"); }
    if (["kunde", "nicht_anrufen"].includes(l.status)) s = -100;
    s = Math.max(0, Math.min(100, s));
    return { score: s, klasse: s >= 60 ? "hot" : s >= 35 ? "warm" : "cold", signale: sig };
  }

  function todayStats(leads) {
    const t = today(); const r = { anrufe: 0, erreicht: 0, termine: 0, mails: 0, antworten: 0, neueLeads: 0, mailsJeKonto: {} };
    for (const l of leads) {
      if ((l.erstellt || "").startsWith(t)) r.neueLeads++;
      for (const k of l.kontakte || []) {
        if (!k.ts.startsWith(t)) continue;
        if (k.typ === "anruf") { r.anrufe++; if (!["nicht_erreicht", "mailbox", "zentrale", "falsche_nummer"].includes(k.ergebnis)) r.erreicht++; if (k.ergebnis === "termin") r.termine++; }
        if (k.typ === "email") { r.mails++; if (k.account) r.mailsJeKonto[k.account] = (r.mailsJeKonto[k.account] || 0) + 1; }
        if (k.typ === "notiz" && /antwort/i.test(k.notiz || "")) r.antworten++;
      }
    }
    return r;
  }
  function weekStats(leads) {
    const since = new Date(); since.setDate(since.getDate() - 7); const s = since.toISOString();
    const r = { mails: 0, antworten: 0, bounces: 0, abmeldungen: 0 };
    for (const l of leads) for (const k of l.kontakte || []) {
      if (k.ts < s) continue;
      if (k.typ === "email") r.mails++;
      if (k.typ === "notiz" && /antwort/i.test(k.notiz || "")) r.antworten++;
      if (k.typ === "notiz" && /bounce|unzustellbar/i.test(k.notiz || "")) r.bounces++;
      if (k.typ === "notiz" && /stop|abmeld|unsubscribe/i.test(k.notiz || "")) r.abmeldungen++;
    }
    return r;
  }
  function warmupLimit(acc) {
    if (!acc.warmup || !acc.start) return acc.limit || 300;
    const days = Math.floor((Date.now() - new Date(acc.start).getTime()) / 86400e3) + 1;
    return Math.min(acc.limit || 300, Math.max(20, days * 20));
  }

  return {
    K, load, save, today, uid, MARKETS, KETTEN, scoreLead, todayStats, weekStats, warmupLimit,
    leads: () => load(K.leads, []), saveLeads: v => save(K.leads, v),
    settings: () => Object.assign({ ich: "", telefon: "", zielAnrufe: 40, zielMails: 15, zielTermine: 1, zielLeads: 30, kanalDe: "anruf", kanalIntl: "email" }, load(K.settings, {})),
    saveSettings: v => save(K.settings, v),
    accounts: () => load(K.accounts, []), saveAccounts: v => save(K.accounts, v),
    profil: () => Object.assign({ firma: "Alwine", inhaber: "", adresse: "", plz_ort: "", ust: "", telefon: "", web: "", email: "", signatur: "" }, load(K.profil, {})),
    saveProfil: v => save(K.profil, v),
    searches: () => load(K.searches, []), saveSearches: v => save(K.searches, v)
  };
})();
