/* Alwine Vertrieb – mobile Akquise-App. Keine Abhängigkeiten, Daten liegen im localStorage des Handys. */
(function () {
  "use strict";

  // ---------- Daten ----------
  const LS_LEADS = "alwine.leads.v1";
  const LS_SETTINGS = "alwine.settings.v1";
  const STATUS = {
    neu: "Neu", in_arbeit: "In Arbeit", rueckruf: "Rückruf", termin: "Termin", angebot: "Angebot",
    kunde: "Kunde", kein_interesse: "Kein Interesse", nicht_anrufen: "Nicht anrufen"
  };
  const OUTCOMES = [
    { id: "nicht_erreicht", label: "Nicht erreicht", status: "in_arbeit", cls: "ghost", next: 1 },
    { id: "mailbox", label: "Mailbox", status: "in_arbeit", cls: "ghost", next: 1 },
    { id: "zentrale", label: "Nur Zentrale", status: "in_arbeit", cls: "ghost", next: 1 },
    { id: "rueckruf", label: "Rückruf vereinbart", status: "rueckruf", cls: "warn", ask: "date" },
    { id: "termin", label: "🎉 Termin!", status: "termin", cls: "ok", ask: "datetime" },
    { id: "infos", label: "Infos gewünscht", status: "in_arbeit", cls: "soft", next: 2 },
    { id: "kein_interesse", label: "Kein Interesse", status: "kein_interesse", cls: "danger" },
    { id: "nicht_anrufen", label: "Nicht anrufen", status: "nicht_anrufen", cls: "danger" },
    { id: "falsche_nummer", label: "Falsche Nummer", status: "in_arbeit", cls: "ghost" }
  ];

  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  let leads = load(LS_LEADS, []);
  let settings = Object.assign({ ich: "", telefon: "", zielAnrufe: 40, zielMails: 15, zielTermine: 1, kanalDe: "email", kanalIntl: "anruf" }, load(LS_SETTINGS, {}));
  const LS_SEARCHES = "alwine.searches.v1";
  let searches = load(LS_SEARCHES, []);
  const saveSearches = () => save(LS_SEARCHES, searches);
  const saveLeads = () => save(LS_LEADS, leads);
  const saveSettings = () => save(LS_SETTINGS, settings);

  const SERVICES = window.ALWINE_SERVICES, INDUSTRIES = window.ALWINE_INDUSTRIES,
        SCRIPTS = window.ALWINE_SCRIPTS, EMAILS = window.ALWINE_EMAILS,
        SCRIPTS_EN = window.ALWINE_SCRIPTS_EN, EMAILS_EN = window.ALWINE_EMAILS_EN, SOURCES = window.ALWINE_SOURCES;
  const MARKETS = SOURCES.MARKETS;
  const marketOf = l => MARKETS.find(m => m.id === (l?.markt || "de")) || MARKETS[0];
  const langOf = l => l?.sprache || marketOf(l).sprache;
  const scriptsFor = l => langOf(l) === "en" ? SCRIPTS_EN : SCRIPTS;
  const emailsFor = l => langOf(l) === "en" ? EMAILS_EN : EMAILS;
  const kanalOf = l => l?.kanal || (["de", "at"].includes(l?.markt || "de") ? settings.kanalDe : settings.kanalIntl);
  const defaultKanal = marktId => ["de", "at"].includes(marktId || "de") ? settings.kanalDe : settings.kanalIntl;
  // Grobe Ortszeit aus Längengrad (für Anrufe in andere Zeitzonen)
  const localTimeOf = l => { if (l?.lon == null) return ""; const off = Math.round(l.lon / 15); const d = new Date(Date.now() + off * 3600e3); return d.toISOString().slice(11, 16) + " (UTC" + (off >= 0 ? "+" : "") + off + ")"; };

  // ---------- Helfer ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const today = () => new Date().toISOString().slice(0, 10);
  const fmtDate = iso => { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }) + (iso.length > 10 ? " " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : ""); };
  const industryOf = l => INDUSTRIES.find(i => i.id === l?.branche);
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 2200); };
  const copy = async txt => { try { await navigator.clipboard.writeText(txt); toast("Kopiert"); } catch { prompt("Kopieren:", txt); } };

  function fill(text, lead) {
    const ind = industryOf(lead);
    const map = {
      firma: lead?.firma || "[Firma]",
      ansprechpartner: lead?.ansprechpartner || "[Name]",
      ich: settings.ich || "[Ihr Name]",
      telefon: settings.telefon || "[Ihre Nummer]",
      branche: ind?.name || "[Branche]",
      aufhaenger: langOf(lead) === "en" ? ({ handwerk: "hiring and website inquiries", gastro: "online reservations and social videos", praxis: "online booking", einzelhandel: "local visibility on Google and Instagram", immobilien: "automated property videos", dienstleister: "a website that actually generates inquiries", autohaus: "automated vehicle videos" }[lead?.branche] || "your website and online presence") : (ind?.aufhaenger || "[Thema]"),
      opener_branche: langOf(lead) === "en"
        ? "I'm calling because we help businesses in your industry get more inquiries through their website and automate admin work. Is that a topic for you right now?"
        : (ind?.opener_variante || "Ich rufe an, weil wir Unternehmen aus Ihrer Branche helfen, mehr Anfragen über die Webseite zu bekommen und Verwaltungsarbeit zu automatisieren. Ist das bei Ihnen gerade Thema?"),
      beobachtung: lead?.notizen ? lead.notizen.split("\n")[0] : (langOf(lead) === "en" ? "[what I noticed on the website]" : "[Was ist mir auf der Webseite aufgefallen?]"),
      termin: lead?.naechster ? fmtDate(lead.naechster) : "[Termin]"
    };
    return text.replace(/\{(\w+)\}/g, (m, k) => map[k] ?? m);
  }

  function todayStats() {
    const t = today(); let anrufe = 0, erreicht = 0, termine = 0, mails = 0;
    for (const l of leads) for (const k of l.kontakte || []) {
      if (!k.ts.startsWith(t)) continue;
      if (k.typ === "anruf") { anrufe++; if (!["nicht_erreicht", "mailbox", "zentrale", "falsche_nummer"].includes(k.ergebnis)) erreicht++; if (k.ergebnis === "termin") termine++; }
      if (k.typ === "email") mails++;
    }
    return { anrufe, erreicht, termine, mails };
  }

  function dueLeads() {
    const t = today();
    return leads.filter(l => l.naechster && l.naechster.slice(0, 10) <= t && !["kunde", "kein_interesse", "nicht_anrufen"].includes(l.status))
      .sort((a, b) => a.naechster.localeCompare(b.naechster));
  }
  const isCallLead = l => kanalOf(l) === "anruf" || ["rueckruf", "termin", "angebot"].includes(l.status);
  function nextLead(excludeId) {
    const due = dueLeads().filter(l => l.id !== excludeId && isCallLead(l));
    if (due.length) return due[0];
    const pool = leads.filter(l => l.id !== excludeId && isCallLead(l) && ["neu", "in_arbeit"].includes(l.status) && (!l.naechster || l.naechster.slice(0, 10) <= today()));
    pool.sort((a, b) => (a.kontakte?.length || 0) - (b.kontakte?.length || 0) || (a.erstellt || "").localeCompare(b.erstellt || ""));
    return pool[0] || null;
  }

  function writeQueue(excludeId) {
    const t = today();
    return leads.filter(l => l.id !== excludeId && kanalOf(l) === "email" && l.email && ["neu", "in_arbeit"].includes(l.status) && (!l.naechster || l.naechster.slice(0, 10) <= t))
      .sort((a, b) => (a.kontakte?.length || 0) - (b.kontakte?.length || 0));
  }
  function logContact(lead, typ, ergebnis, notiz) {
    lead.kontakte = lead.kontakte || [];
    lead.kontakte.push({ ts: new Date().toISOString(), typ, ergebnis, notiz: notiz || "" });
    saveLeads();
  }

  // ---------- Modal ----------
  function openModal(html, onMount) {
    const m = $("#modal"), c = $("#modal-card");
    c.innerHTML = html; m.hidden = false; document.body.style.overflow = "hidden";
    m.onclick = e => { if (e.target === m) closeModal(); };
    onMount && onMount(c);
  }
  function closeModal() { $("#modal").hidden = true; document.body.style.overflow = ""; }

  // ---------- Views ----------
  function viewHeute() {
    const s = todayStats(), due = dueLeads();
    const pct = (a, b) => Math.min(100, Math.round(100 * a / Math.max(1, b)));
    const rules = SCRIPTS.goldene_regeln;
    const rule = rules[new Date().getDate() % rules.length];
    return `
      <h1>Heute, ${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</h1>
      ${!settings.ich ? `<div class="hint warn">Bitte zuerst oben rechts ⚙︎ Name und Telefonnummer eintragen – sie werden in Skripte und Mails eingesetzt.</div>` : ""}
      <div class="stat-grid">
        <div class="stat"><b>${s.anrufe}</b><small>Anrufe / ${settings.zielAnrufe}</small><div class="progress"><i style="width:${pct(s.anrufe, settings.zielAnrufe)}%"></i></div></div>
        <div class="stat"><b>${s.erreicht}</b><small>Erreicht</small><div class="progress"><i style="width:${pct(s.erreicht, Math.round(settings.zielAnrufe * .3))}%"></i></div></div>
        <div class="stat"><b>${s.termine}</b><small>Termine / ${settings.zielTermine}</small><div class="progress"><i style="width:${pct(s.termine, settings.zielTermine)}%"></i></div></div>
      </div>
      <div class="card" style="margin-top:.8rem">
        <div class="row between"><div><b>${s.mails}</b> <span class="muted">E-Mails / ${settings.zielMails}</span></div><small>${leads.length} Leads gesamt</small></div>
        <div class="progress"><i style="width:${pct(s.mails, settings.zielMails)}%"></i></div>
      </div>
      <div class="row" style="margin-bottom:.4rem"><a class="btn big grow" href="#/anruf">📞 Anrufen (${leads.filter(l => isCallLead(l) && ["neu","in_arbeit","rueckruf"].includes(l.status)).length})</a><a class="btn big grow soft" href="#/anschreiben">✉️ Anschreiben (${writeQueue().length})</a></div>
      <button class="btn ghost sm block" id="btn-autoleads">🤖 Automatische Leads laden</button>
      <h2>Fällig heute (${due.length})</h2>
      ${due.length ? due.slice(0, 8).map(leadRow).join("") : `<div class="card muted">Keine Rückrufe fällig. Neue Leads anrufen!</div>`}
      <h2>Tagesablauf</h2>
      <div class="card stack">
        <div><b>08:00</b> – 15 Min: Leads für heute prüfen, Webseiten kurz anschauen, Notizen</div>
        <div><b>08:30–10:30</b> – Block 1: Handwerk, Dienstleister, Autohäuser (Entscheider vor Ort)</div>
        <div><b>10:30–12:00</b> – Block 2: Gastro, Einzelhandel, Immobilien</div>
        <div><b>12:30–13:30</b> – Praxen (Mittagspause) + E-Mails nach Telefonaten</div>
        <div><b>14:00–16:30</b> – Block 3: Rückrufe, Nachfassen, restliche Leads</div>
        <div><b>16:30–17:30</b> – Nachfass-Mails, Termine bestätigen, 20 neue Leads für morgen recherchieren</div>
      </div>
      <div class="hint">Regel des Tages: ${esc(rule)}</div>`;
  }

  function leadRow(l) {
    const ind = industryOf(l);
    const due = l.naechster && l.naechster.slice(0, 10) <= today();
    return `<div class="card tight lead ${due ? "due" : ""}" data-open="${l.id}">
      <div class="grow"><div class="name">${esc(l.firma)}</div>
      <div class="sub">${esc(l.ansprechpartner || "")}${l.ansprechpartner ? " · " : ""}${esc(ind?.name.split(" (")[0] || "")}${l.naechster ? " · " + fmtDate(l.naechster) : ""} · ${(l.kontakte || []).length} Kontakte</div></div>
      <span class="badge ${langOf(l)}" style="margin-right:.2rem">${esc(marketOf(l).cc || "EN")}</span><span class="badge ${l.status}">${STATUS[l.status] || l.status}</span></div>`;
  }

  let leadFilter = { q: "", status: "" };
  function viewLeads() {
    const q = leadFilter.q.toLowerCase();
    const list = leads.filter(l => (!leadFilter.status || l.status === leadFilter.status) && (!q || [l.firma, l.ansprechpartner, l.notizen, l.telefon].join(" ").toLowerCase().includes(q)))
      .sort((a, b) => (b.naechster ? 1 : 0) - (a.naechster ? 1 : 0) || (b.erstellt || "").localeCompare(a.erstellt || ""));
    const counts = {}; leads.forEach(l => counts[l.status] = (counts[l.status] || 0) + 1);
    return `
      <div class="row between"><h1>Leads (${leads.length})</h1><button class="btn sm" id="btn-add">+ Neu</button></div>
      <input id="lead-q" placeholder="Suchen…" value="${esc(leadFilter.q)}">
      <div class="chips" style="margin:.6rem 0">
        <button class="chip ${!leadFilter.status ? "active" : ""}" data-status="">Alle</button>
        ${Object.entries(STATUS).map(([k, v]) => `<button class="chip ${leadFilter.status === k ? "active" : ""}" data-status="${k}">${v} ${counts[k] ? "(" + counts[k] + ")" : ""}</button>`).join("")}
      </div>
      ${list.length ? list.map(leadRow).join("") : `<div class="empty">Noch keine Leads. Oben „+ Neu“ oder unten CSV importieren.</div>`}
      <div class="row" style="margin-top:1rem">
        <button class="btn ghost sm grow" id="btn-import">CSV importieren</button>
        <button class="btn ghost sm grow" id="btn-export">CSV exportieren</button>
      </div>
      <input type="file" id="file-import" accept=".csv,text/csv" hidden>
      <small class="muted">CSV-Spalten: firma;ansprechpartner;telefon;email;website;branche;markt;kanal;stadt;notizen – Vorlage: leads-vorlage.csv</small>`;
  }

  function leadForm(l = {}) {
    return `
      <label>Firma *</label><input id="f-firma" value="${esc(l.firma)}">
      <label>Ansprechpartner</label><input id="f-ap" value="${esc(l.ansprechpartner)}" placeholder="Herr/Frau Nachname">
      <label>Telefon</label><input id="f-tel" type="tel" value="${esc(l.telefon)}">
      <label>E-Mail</label><input id="f-mail" type="email" value="${esc(l.email)}">
      <label>Webseite</label><input id="f-web" value="${esc(l.website)}" placeholder="https://…">
      <label>Markt / Land</label><select id="f-markt">${MARKETS.map(m => `<option value="${m.id}" ${(l.markt || "de") === m.id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select>
      <label>Kanal</label><select id="f-kanal"><option value="">Standard laut Markt</option><option value="anruf" ${l.kanal === "anruf" ? "selected" : ""}>Anrufen</option><option value="email" ${l.kanal === "email" ? "selected" : ""}>Anschreiben (E-Mail)</option></select>
      <label>Stadt</label><input id="f-stadt" value="${esc(l.stadt)}">
      <label>Branche</label><select id="f-branche"><option value="">– wählen –</option>${INDUSTRIES.map(i => `<option value="${i.id}" ${l.branche === i.id ? "selected" : ""}>${esc(i.name)}</option>`).join("")}</select>
      <label>Status</label><select id="f-status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${(l.status || "neu") === k ? "selected" : ""}>${v}</option>`).join("")}</select>
      <label>Nächster Kontakt</label><input id="f-next" type="datetime-local" value="${esc(l.naechster || "")}">
      <label>Notizen (1. Zeile = Beobachtung für Opener/Mail)</label><textarea id="f-notiz">${esc(l.notizen)}</textarea>`;
  }
  function readLeadForm(c, l = {}) {
    return Object.assign(l, {
      firma: $("#f-firma", c).value.trim(), ansprechpartner: $("#f-ap", c).value.trim(), telefon: $("#f-tel", c).value.trim(),
      email: $("#f-mail", c).value.trim(), website: $("#f-web", c).value.trim(), branche: $("#f-branche", c).value,
      status: $("#f-status", c).value, naechster: $("#f-next", c).value, notizen: $("#f-notiz", c).value,
      markt: $("#f-markt", c).value, kanal: $("#f-kanal", c).value, stadt: $("#f-stadt", c).value.trim(),
      sprache: (MARKETS.find(m => m.id === $("#f-markt", c).value) || MARKETS[0]).sprache
    });
  }

  function openLead(id) {
    const l = leads.find(x => x.id === id); if (!l) return;
    const ind = industryOf(l);
    openModal(`
      <div class="row between"><h2 style="margin:0">${esc(l.firma)}</h2><span class="badge ${l.status}">${STATUS[l.status]}</span></div>
      <p class="muted">${esc(ind?.name || "")} · ${esc(marketOf(l).name)}${l.stadt ? ", " + esc(l.stadt) : ""} · ${kanalOf(l) === "email" ? "✉️ Anschreiben" : "📞 Anrufen"}${l.lon != null ? " · Ortszeit ca. " + localTimeOf(l) : ""}</p>
      <div class="row wrap" style="margin:.6rem 0">
        ${l.telefon ? `<a class="btn sm" href="tel:${esc(l.telefon)}">📞 ${esc(l.telefon)}</a>` : ""}
        ${l.email ? `<a class="btn sm soft" href="mailto:${esc(l.email)}">✉️ Mail</a>` : ""}
        ${l.website ? `<a class="btn sm ghost" href="${esc(l.website.startsWith("http") ? l.website : "https://" + l.website)}" target="_blank">🌐 Web</a>` : ""}
        <a class="btn sm ok" href="#/anruf/${l.id}" data-close>Anruf-Modus</a>
        ${l.email ? `<a class="btn sm ok" href="#/anschreiben/${l.id}" data-close>Anschreiben</a>` : ""}
      </div>
      <details><summary>Bearbeiten</summary>${leadForm(l)}
        <div class="row" style="margin-top:.8rem"><button class="btn grow" id="m-save">Speichern</button><button class="btn danger sm" id="m-del">Löschen</button></div>
      </details>
      <h3>Verlauf (${(l.kontakte || []).length})</h3>
      <ul class="log">${(l.kontakte || []).slice().reverse().map(k => `<li><b>${fmtDate(k.ts)}</b> · ${k.typ === "anruf" ? "📞" : "✉️"} ${esc(OUTCOMES.find(o => o.id === k.ergebnis)?.label || k.ergebnis)}${k.notiz ? " – " + esc(k.notiz) : ""}</li>`).join("") || "<li class='muted'>Noch kein Kontakt</li>"}</ul>
      <div class="row" style="margin-top:.6rem"><input id="m-note" placeholder="Notiz zum Verlauf…"><button class="btn sm" id="m-addnote">+</button></div>
      <button class="btn ghost block" style="margin-top:.8rem" data-close>Schließen</button>
    `, c => {
      $("#m-save", c).onclick = () => { readLeadForm(c, l); saveLeads(); closeModal(); render(); toast("Gespeichert"); };
      $("#m-del", c).onclick = () => { if (confirm("Lead wirklich löschen?")) { leads = leads.filter(x => x.id !== id); saveLeads(); closeModal(); render(); } };
      $("#m-addnote", c).onclick = () => { const n = $("#m-note", c).value.trim(); if (!n) return; logContact(l, "notiz", "notiz", n); openLead(id); };
      $$("[data-close]", c).forEach(b => b.onclick = () => closeModal());
    });
  }

  function openNewLead() {
    openModal(`<h2 style="margin:0 0 .5rem">Neuer Lead</h2>${leadForm({})}<button class="btn block" style="margin-top:1rem" id="m-create">Anlegen</button><button class="btn ghost block" style="margin-top:.5rem" data-close>Abbrechen</button>`, c => {
      $("#m-create", c).onclick = () => {
        const l = readLeadForm(c, { id: uid(), erstellt: new Date().toISOString(), kontakte: [] });
        if (!l.firma) return toast("Firma fehlt");
        leads.unshift(l); saveLeads(); closeModal(); render(); toast("Lead angelegt");
      };
      $("[data-close]", c).onclick = closeModal;
    });
  }

  // ---------- CSV ----------
  function parseCSV(text) {
    const sep = (text.split("\n")[0].match(/;/g) || []).length >= (text.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const head = rows.shift().map(h => h.trim().toLowerCase());
    return rows.filter(r => r.some(c => c.trim())).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
  }
  function importCSV(file) {
    const rd = new FileReader();
    rd.onload = () => {
      const rows = parseCSV(rd.result); let n = 0;
      for (const r of rows) {
        const firma = r.firma || r.name || r.unternehmen; if (!firma) continue;
        if (leads.some(l => l.firma.toLowerCase() === firma.toLowerCase())) continue;
        const brancheRaw = (r.branche || "").toLowerCase();
        const branche = INDUSTRIES.find(i => i.id === brancheRaw || i.name.toLowerCase().includes(brancheRaw) && brancheRaw)?.id || "";
        const markt = MARKETS.find(m => m.id === (r.markt || "").toLowerCase() || m.cc.toLowerCase() === (r.markt || r.land || "").toLowerCase())?.id || "de";
        leads.push({ id: uid(), erstellt: new Date().toISOString(), kontakte: [], status: "neu", firma, ansprechpartner: r.ansprechpartner || r.kontakt || "", telefon: r.telefon || r.phone || "", email: r.email || r["e-mail"] || "", website: r.website || r.web || "", branche, notizen: r.notizen || r.notiz || "", naechster: "", markt, sprache: MARKETS.find(m => m.id === markt).sprache, kanal: ["anruf", "email"].includes(r.kanal) ? r.kanal : "", stadt: r.stadt || r.city || "", quelle: r.quelle || "csv" });
        n++;
      }
      saveLeads(); render(); toast(`${n} Leads importiert`);
    };
    rd.readAsText(file, "utf-8");
  }
  function exportCSV() {
    const cols = ["firma", "ansprechpartner", "telefon", "email", "website", "branche", "markt", "kanal", "stadt", "status", "naechster", "notizen", "kontakte"];
    const esc2 = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [cols.join(";")].concat(leads.map(l => cols.map(c => esc2(c === "kontakte" ? (l.kontakte || []).length : l[c])).join(";")));
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `alwine-leads-${today()}.csv`; a.click();
  }

  // ---------- Anruf-Modus ----------
  let callState = { leadId: null, phase: 0 };
  function viewAnruf(leadId) {
    let l = leadId ? leads.find(x => x.id === leadId) : leads.find(x => x.id === callState.leadId);
    if (!l) l = nextLead();
    if (!l) return `<h1>Anrufen</h1><div class="empty">Keine offenen Leads. Lege unter „Leads“ neue an oder importiere eine CSV.</div>`;
    if (callState.leadId !== l.id) { callState = { leadId: l.id, phase: 0 }; }
    const ind = industryOf(l);
    const SC = scriptsFor(l);
    const phases = SC.phasen;
    const ph = phases[callState.phase];
    const recommended = (ind?.empfohlene_leistungen || ["website"]).map(id => SERVICES.find(s => s.id === id)).filter(Boolean);
    return `
      <div class="card">
        <div class="row between"><div><div style="font-weight:700;font-size:1.1rem">${esc(l.firma)}</div>
        <div class="muted" style="font-size:.85rem">${esc(l.ansprechpartner || "Ansprechpartner unbekannt")} · ${esc(ind?.name.split(" (")[0] || "Branche?")} · ${(l.kontakte || []).length}. Kontakt</div></div>
        <span class="badge ${l.status}">${STATUS[l.status]}</span></div>
        ${l.notizen ? `<p style="font-size:.85rem;margin-top:.4rem">📝 ${esc(l.notizen.split("\n")[0])}</p>` : ""}
        ${ind ? `<p class="muted" style="font-size:.8rem">⏱ ${esc(ind.beste_zeit)} · 👤 ${esc(ind.entscheider)}</p>` : ""}
        ${langOf(l) === "en" ? `<p class="hint" style="margin-top:.4rem">🌍 ${esc(marketOf(l).name)}${l.stadt ? ", " + esc(l.stadt) : ""} · Englisches Skript${l.lon != null ? " · Ortszeit dort ca. <b>" + localTimeOf(l) + "</b>" : " · Zeitzone prüfen!"}</p>` : ""}
        <div class="row" style="margin-top:.6rem">
          ${l.telefon ? `<a class="btn big grow" href="tel:${esc(l.telefon)}">📞 ${esc(l.telefon)}</a>` : `<button class="btn big grow" disabled>Keine Nummer</button>`}
          <button class="btn ghost" id="c-edit">✎</button>
          <button class="btn ghost" id="c-skip">⏭</button>
        </div>
      </div>

      <div class="steps">${phases.map((p, i) => `<button class="${i === callState.phase ? "active" : ""}" data-phase="${i}">${esc(p.kurz || p.titel)}</button>`).join("")}</div>
      <div class="card">
        <h3 style="margin-top:0">${esc(ph.titel)}</h3>
        <small class="muted">Ziel: ${esc(ph.ziel)}</small>
        ${ph.text.map(t => `<div class="script-line">${esc(fill(t, l))}</div>`).join("")}
        ${(ph.tipps || []).map(t => `<div class="tipp">💡 ${esc(t)}</div>`).join("")}
        <div class="row" style="margin-top:.6rem">
          <button class="btn ghost sm grow" id="c-prev" ${callState.phase === 0 ? "disabled" : ""}>◀ Zurück</button>
          <button class="btn sm grow" id="c-next" ${callState.phase >= phases.length - 1 ? "disabled" : ""}>Weiter ▶</button>
        </div>
      </div>

      <details><summary>Passende Leistungen (${recommended.length})</summary>
        ${recommended.map(s => `<div style="margin:.5rem 0"><b>${esc(s.name)}</b><p style="font-size:.9rem">${esc(s.kurz)}</p><p class="tipp">❓ ${esc(s.frage)}</p><p class="tipp">📌 ${esc(s.beispiel)}</p><p class="tipp">💶 ${esc(s.paket)}</p></div>`).join("")}
      </details>
      <details><summary>Einwände (${SC.einwaende.length})</summary>
        ${SC.einwaende.map(e => `<details><summary>${esc(e.einwand)}</summary><p>${esc(fill(e.antwort, l))}</p><p class="tipp">${esc(e.hinweis)}</p></details>`).join("")}
      </details>

      <h2>Ergebnis eintragen</h2>
      <input id="c-note" placeholder="Kurznotiz (z. B. Name der Zentrale, Einwand, Wunsch)…" style="margin-bottom:.5rem">
      <div class="outcome-grid">${OUTCOMES.map(o => `<button class="btn ${o.cls}" data-outcome="${o.id}">${o.label}</button>`).join("")}</div>`;
  }

  function recordOutcome(l, o, note) {
    const finish = (naechster, extra) => {
      const noteAll = [note, extra].filter(Boolean).join(" · ");
      logContact(l, "anruf", o.id, noteAll);
      l.status = o.status === "in_arbeit" && ["termin", "angebot", "kunde", "rueckruf"].includes(l.status) ? l.status : o.status;
      if (naechster !== undefined) l.naechster = naechster;
      else if (o.next) { const d = new Date(); d.setDate(d.getDate() + o.next); if (d.getDay() === 6) d.setDate(d.getDate() + 2); if (d.getDay() === 0) d.setDate(d.getDate() + 1); l.naechster = d.toISOString().slice(0, 16); }
      else l.naechster = "";
      if (o.id === "nicht_erreicht" && (l.kontakte || []).filter(k => k.typ === "anruf").length >= 8) { l.status = "kein_interesse"; l.naechster = ""; toast("8 Versuche – Lead geparkt"); }
      saveLeads();
      afterOutcome(l, o);
    };
    if (o.ask) {
      const d = new Date(); d.setDate(d.getDate() + 1); const def = d.toISOString().slice(0, 16);
      openModal(`<h2 style="margin:0">${esc(o.label)}</h2><label>Wann?</label><input id="m-when" type="${o.ask === "date" ? "datetime-local" : "datetime-local"}" value="${def}">
        ${o.id === "termin" ? `<label>E-Mail für Einladung</label><input id="m-mail" type="email" value="${esc(l.email)}">` : ""}
        <button class="btn block" style="margin-top:1rem" id="m-ok">Speichern</button><button class="btn ghost block" style="margin-top:.5rem" data-close>Abbrechen</button>`, c => {
        $("#m-ok", c).onclick = () => { const w = $("#m-when", c).value; if (!w) return toast("Datum fehlt"); if ($("#m-mail", c)) l.email = $("#m-mail", c).value.trim(); closeModal(); finish(w, fmtDate(w)); };
        $("[data-close]", c).onclick = closeModal;
      });
    } else finish();
  }

  function afterOutcome(l, o) {
    const mailFor = { termin: "nach_gespraech", mailbox: "nach_mailbox", infos: "infos_gewuenscht" }[o.id];
    const tpl = mailFor && emailsFor(l).find(e => e.id === mailFor);
    const s = todayStats();
    const nxt = nextLead(l.id);
    openModal(`
      <h2 style="margin:0">${o.id === "termin" ? "🎉 Stark! Termin gebucht." : "Gespeichert."}</h2>
      <p class="muted">Heute: ${s.anrufe} Anrufe · ${s.erreicht} erreicht · ${s.termine} Termine</p>
      ${tpl ? `<div class="card" style="margin-top:.6rem"><b>Jetzt passende E-Mail senden:</b> ${esc(tpl.titel)}
        <div class="row" style="margin-top:.5rem"><a class="btn sm grow" id="m-mailto" href="${mailtoHref(tpl, l)}">✉️ Mail öffnen</a><button class="btn sm ghost" id="m-copy">Kopieren</button></div></div>` : ""}
      ${o.id === "termin" ? `<div class="hint">Bestätigung innerhalb von 5 Minuten senden und Kalendereintrag anlegen. Am Vortag erinnern.</div>` : ""}
      <div class="row" style="margin-top:1rem">
        ${nxt ? `<a class="btn big grow" href="#/anruf/${nxt.id}" data-close>📞 Nächster: ${esc(nxt.firma.slice(0, 18))}</a>` : `<a class="btn big grow" href="#/leads" data-close>Keine weiteren Leads</a>`}
      </div>
      <button class="btn ghost block" style="margin-top:.5rem" data-close-stay>Bei diesem Lead bleiben</button>`, c => {
      if (tpl) {
        $("#m-mailto", c).onclick = () => { logContact(l, "email", tpl.id, tpl.titel); };
        $("#m-copy", c).onclick = () => { copy(fill(tpl.betreff, l) + "\n\n" + fill(tpl.text, l)); logContact(l, "email", tpl.id, tpl.titel); };
      }
      $$("[data-close]", c).forEach(b => b.onclick = () => { closeModal(); });
      $("[data-close-stay]", c).onclick = () => { closeModal(); render(); };
    });
  }
  const mailtoHref = (tpl, l) => `mailto:${encodeURIComponent(l.email || "")}?subject=${encodeURIComponent(fill(tpl.betreff, l))}&body=${encodeURIComponent(fill(tpl.text, l))}`;

  // ---------- Vorlagen ----------
  let tplState = { tab: "skript", leadId: "", lang: "" };
  function viewVorlagen() {
    const l = leads.find(x => x.id === tplState.leadId) || null;
    const lang = l ? langOf(l) : (tplState.lang || "de");
    const SC = lang === "en" ? SCRIPTS_EN : SCRIPTS, EM = lang === "en" ? EMAILS_EN : EMAILS;
    const leadSel = `<select id="t-lead"><option value="">Platzhalter allgemein</option>${leads.filter(x => !["kein_interesse", "nicht_anrufen"].includes(x.status)).map(x => `<option value="${x.id}" ${x.id === tplState.leadId ? "selected" : ""}>${esc(x.firma)}</option>`).join("")}</select>`;
    let body = "";
    if (tplState.tab === "skript") {
      body = SC.phasen.map(p => `<details ${p.id === "opener" ? "open" : ""}><summary>${esc(p.titel)}</summary><small class="muted">Ziel: ${esc(p.ziel)}</small>${p.text.map(t => `<div class="script-line">${esc(fill(t, l))}</div>`).join("")}${(p.tipps || []).map(t => `<div class="tipp">💡 ${esc(t)}</div>`).join("")}</details>`).join("");
    } else if (tplState.tab === "einwaende") {
      body = SC.einwaende.map(e => `<details><summary>${esc(e.einwand)}</summary><p>${esc(fill(e.antwort, l))}</p><p class="tipp">${esc(e.hinweis)}</p></details>`).join("");
    } else {
      const groups = {}; EM.forEach(e => (groups[e.kategorie] = groups[e.kategorie] || []).push(e));
      body = Object.entries(groups).map(([g, es]) => `<h3>${esc(g)}</h3>` + es.map(e => `<details><summary>${esc(e.titel)}</summary>
        <p><b>Betreff:</b> ${esc(fill(e.betreff, l))}</p><pre class="mail">${esc(fill(e.text, l))}</pre>
        <div class="row"><a class="btn sm grow" href="${mailtoHref(e, l || {})}" data-mail="${e.id}">✉️ Mail-App öffnen</a><button class="btn sm ghost" data-copy="${e.id}">Kopieren</button></div></details>`).join("")).join("");
    }
    return `<h1>Vorlagen</h1>
      <div class="chips" style="margin-bottom:.6rem">${[["skript", "Gesprächsleitfaden"], ["einwaende", "Einwände"], ["emails", "E-Mails"]].map(([k, v]) => `<button class="chip ${tplState.tab === k ? "active" : ""}" data-tab="${k}">${v}</button>`).join("")}</div>
      <div class="row"><div class="grow"><label>Platzhalter füllen mit Lead</label>${leadSel}</div><div><label>Sprache</label><select id="t-lang" ${l ? "disabled" : ""}><option value="de" ${lang === "de" ? "selected" : ""}>Deutsch</option><option value="en" ${lang === "en" ? "selected" : ""}>English</option></select></div></div>
      <div style="margin-top:.8rem">${body}</div>`;
  }

  // ---------- Wissen ----------
  function viewWissen() {
    return `<h1>Wissen</h1>
      <h2>Goldene Regeln</h2><div class="card">${SCRIPTS.goldene_regeln.map((r, i) => `<p>${i + 1}. ${esc(r)}</p>`).join("")}</div>
      <h2>Unsere Leistungen</h2>
      ${SERVICES.map(s => `<details><summary>${esc(s.name)}</summary><p>${esc(s.kurz)}</p><p><b>Nutzen:</b></p><ul>${s.nutzen.map(n => `<li>${esc(n)}</li>`).join("")}</ul><p><b>Schmerz des Kunden:</b> ${esc(s.schmerz)}</p><p><b>Frage im Gespräch:</b> ${esc(s.frage)}</p><p><b>Beispiel:</b> ${esc(s.beispiel)}</p><p><b>Preisrahmen:</b> ${esc(s.paket)}</p></details>`).join("")}
      <h2>Branchen</h2>
      ${INDUSTRIES.map(i => `<details><summary>${esc(i.name)}</summary><p><b>Entscheider:</b> ${esc(i.entscheider)}</p><p><b>Beste Zeit:</b> ${esc(i.beste_zeit)}</p><p><b>Typische Probleme:</b></p><ul>${i.schmerz.map(s => `<li>${esc(s)}</li>`).join("")}</ul><p><b>Aufhänger:</b> ${esc(i.aufhaenger)}</p><div class="script-line">${esc(i.opener_variante)}</div></details>`).join("")}
      <h2>Kennzahlen (Richtwerte Kaltakquise B2B)</h2>
      <div class="card">
        <p>40 Wählversuche → ca. 10–12 Entscheider erreicht → 1–2 Termine → nach 4 Wochen ca. 1 Auftrag je 3–4 Termine.</p>
        <p>Also: <b>1 Auftrag ≈ 120–160 Anrufe.</b> Jeder Anruf hat damit einen messbaren Wert. Deshalb zählen, nicht fühlen.</p>
        <p>Lead ist erst nach 6–8 Versuchen über 3–4 Wochen „tot“. Die meisten Verkäufer geben nach 2 auf – da liegt der Vorsprung.</p>
      </div>
      <h2>Rechtliches (Deutschland, kurz)</h2>
      <div class="hint warn">
        <p><b>Telefon B2B:</b> erlaubt bei „mutmaßlicher Einwilligung“ (§ 7 Abs. 2 Nr. 1 UWG) – d. h. das Angebot muss sachlich zum Geschäft des Angerufenen passen. Bei „bitte nicht mehr anrufen“ sofort Status „Nicht anrufen“.</p>
        <p><b>E-Mail B2B:</b> unaufgeforderte Werbe-Mails sind auch an Firmen <b>ohne vorherige Einwilligung unzulässig</b> (§ 7 Abs. 2 Nr. 2 UWG, Abmahnrisiko). Deshalb: <b>erst anrufen, Einverständnis für die Mail holen („Darf ich Ihnen dazu etwas schicken?“), dann mailen.</b> Das ist genau der Ablauf dieser App.</p>
        <p><b>Privatpersonen:</b> weder Anruf noch Mail ohne ausdrückliche Einwilligung.</p>
        <p>Details: docs/03-rechtliches.md im Repository.</p>
      </div>
      <h2>International (USA, UK, Welt)</h2>
      <div class="card">
        <p><b>Leads:</b> Tab „Finden“ sucht Firmen weltweit in OpenStreetMap. Suchaufträge speichern und morgens „Alle ausführen“, oder die nächtliche Automatik nutzen (Heute → Automatische Leads laden).</p>
        <p><b>Kanal:</b> Ausland standardmäßig Anrufen mit englischem Skript, Deutschland Anschreiben. Unter ⚙︎ änderbar, je Lead überschreibbar.</p>
        <p><b>Anrufzeiten von Deutschland aus:</b> UK 10–12 und 15–17 Uhr · USA Ostküste 15–18 Uhr · Texas/Chicago 16–19 Uhr · Kalifornien 18–20 Uhr · Australien 6–8 Uhr morgens.</p>
        <p><b>USA-Recht:</b> Firmen anrufen erlaubt. Kalt-E-Mail an Firmen erlaubt (CAN-SPAM: echte Absenderadresse, Postanschrift, Abmeldemöglichkeit). <b>UK:</b> Firmen anrufen erlaubt (CTPS prüfen), E-Mail an Firmenadressen erlaubt (PECR). <b>Kanada:</b> E-Mail streng (CASL).</p>
        <p>Details, Telefonie-Tipps und Preise: docs/06-international.md</p>
      </div>
      <h2>Weiterführend</h2>
      <div class="card"><p>docs/06-international.md – USA, UK, Welt: Quellen, Zeiten, Recht</p><p>docs/01-taktiken.md – erprobte Taktiken für unsere Branche</p><p>docs/02-verkaufsgespraech.md – das komplette Verkaufsgespräch</p><p>docs/04-tagesroutine.md – Tages- und Wochenroutine</p><p>docs/05-lead-recherche.md – wo die Firmen herkommen</p></div>`;
  }

  function openSettings() {
    openModal(`<h2 style="margin:0">Einstellungen</h2>
      <label>Mein Name (für Skripte/Mails)</label><input id="s-ich" value="${esc(settings.ich)}" placeholder="Vorname Nachname">
      <label>Meine Telefonnummer</label><input id="s-tel" value="${esc(settings.telefon)}">
      <label>Tagesziel Anrufe</label><input id="s-za" type="number" value="${settings.zielAnrufe}">
      <label>Tagesziel E-Mails</label><input id="s-zm" type="number" value="${settings.zielMails}">
      <label>Tagesziel Termine</label><input id="s-zt" type="number" value="${settings.zielTermine}">
      <label>Kanal Deutschland / Österreich</label><select id="s-kde"><option value="email" ${settings.kanalDe === "email" ? "selected" : ""}>Anschreiben (E-Mail)</option><option value="anruf" ${settings.kanalDe === "anruf" ? "selected" : ""}>Anrufen</option></select>
      <label>Kanal Ausland (USA, UK, Welt)</label><select id="s-kin"><option value="anruf" ${settings.kanalIntl === "anruf" ? "selected" : ""}>Anrufen</option><option value="email" ${settings.kanalIntl === "email" ? "selected" : ""}>Anschreiben (E-Mail)</option></select>
      <small class="muted">Hinweis: In Deutschland ist Kalt-E-Mail ohne Einwilligung rechtlich riskant, Telefon B2B erlaubt. In den USA ist Kalt-E-Mail B2B erlaubt (CAN-SPAM, mit Abmeldemöglichkeit). Details: Wissen → Rechtliches.</small>
      <button class="btn block" style="margin-top:1rem" id="s-save">Speichern</button>
      <div class="row" style="margin-top:.8rem"><button class="btn ghost sm grow" id="s-backup">Backup (JSON)</button><button class="btn ghost sm grow" id="s-restore">Wiederherstellen</button></div>
      <input type="file" id="s-file" accept="application/json" hidden>
      <button class="btn ghost block" style="margin-top:.5rem" data-close>Schließen</button>`, c => {
      $("#s-save", c).onclick = () => { settings.ich = $("#s-ich", c).value.trim(); settings.telefon = $("#s-tel", c).value.trim(); settings.zielAnrufe = +$("#s-za", c).value || 40; settings.zielMails = +$("#s-zm", c).value || 15; settings.zielTermine = +$("#s-zt", c).value || 1; settings.kanalDe = $("#s-kde", c).value; settings.kanalIntl = $("#s-kin", c).value; saveSettings(); closeModal(); render(); toast("Gespeichert"); };
      $("#s-backup", c).onclick = () => { const blob = new Blob([JSON.stringify({ leads, settings, searches }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `alwine-backup-${today()}.json`; a.click(); };
      $("#s-restore", c).onclick = () => $("#s-file", c).click();
      $("#s-file", c).onchange = e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { const d = JSON.parse(rd.result); if (Array.isArray(d.leads)) { leads = d.leads; settings = Object.assign(settings, d.settings || {}); if (Array.isArray(d.searches)) { searches = d.searches; saveSearches(); } saveLeads(); saveSettings(); closeModal(); render(); toast("Wiederhergestellt"); } } catch { toast("Ungültige Datei"); } }; rd.readAsText(f); };
      $("[data-close]", c).onclick = closeModal;
    });
  }

  // ---------- Anschreiben-Modus (E-Mail-Leads) ----------
  let writeState = { leadId: null, tplId: "" };
  function viewAnschreiben(leadId) {
    let l = leadId ? leads.find(x => x.id === leadId) : leads.find(x => x.id === writeState.leadId && writeQueue().some(q => q.id === x.id));
    if (!l) l = writeQueue()[0];
    if (!l) return `<h1>Anschreiben</h1><div class="empty">Keine Leads mit E-Mail-Adresse und Kanal „Anschreiben“ offen.<br><br>Unter „Finden“ neue Leads suchen oder in den Einstellungen den Kanal für Deutschland auf „Anschreiben“ stellen.</div>`;
    if (writeState.leadId !== l.id) writeState = { leadId: l.id, tplId: "" };
    const EM = emailsFor(l);
    const n = (l.kontakte || []).filter(k => k.typ === "email").length;
    const suggested = ["erstkontakt", "followup2", "followup3"][Math.min(n, 2)];
    const tpl = EM.find(e => e.id === (writeState.tplId || suggested)) || EM[0];
    const ind = industryOf(l);
    const isDe = langOf(l) === "de";
    return `
      <div class="card">
        <div class="row between"><div><div style="font-weight:700;font-size:1.1rem">${esc(l.firma)}</div>
        <div class="muted" style="font-size:.85rem">${esc(l.ansprechpartner || "Ansprechpartner unbekannt")} · ${esc(ind?.name.split(" (")[0] || "")} · ${esc(marketOf(l).name)} · ${n}. Mail</div></div>
        <span class="badge ${l.status}">${STATUS[l.status]}</span></div>
        ${l.notizen ? `<p style="font-size:.85rem;margin-top:.4rem">📝 ${esc(l.notizen.split("\n")[0])}</p>` : ""}
        <div class="row wrap" style="margin-top:.5rem">
          ${l.website ? `<a class="btn sm ghost" href="${esc(l.website.startsWith("http") ? l.website : "https://" + l.website)}" target="_blank">🌐 Webseite prüfen</a>` : ""}
          <button class="btn sm ghost" id="w-edit">✎ Beobachtung/Name</button>
          <button class="btn sm ghost" id="w-skip">⏭ Überspringen</button>
        </div>
      </div>
      ${isDe && n === 0 ? `<div class="hint warn">⚠️ Deutschland: Erst-E-Mail ohne Einwilligung ist nach § 7 UWG unzulässig. Sicherer: zuerst anrufen (Lead auf „Anrufen“ stellen) oder per Brief/LinkedIn anschreiben. Nur senden, wenn eine Einwilligung vorliegt.</div>` : ""}
      <label>Vorlage</label>
      <select id="w-tpl">${EM.map(e => `<option value="${e.id}" ${e.id === tpl.id ? "selected" : ""}>${esc(e.titel)}</option>`).join("")}</select>
      <div class="card" style="margin-top:.6rem">
        <p><b>An:</b> ${esc(l.email)}</p>
        <p><b>Betreff:</b> ${esc(fill(tpl.betreff, l))}</p>
        <pre class="mail">${esc(fill(tpl.text, l))}</pre>
        <div class="row"><a class="btn big grow" id="w-send" href="${mailtoHref(tpl, l)}">✉️ In Mail-App öffnen</a><button class="btn ghost" id="w-copy">Kopieren</button></div>
      </div>
      <h2>Ergebnis</h2>
      <div class="outcome-grid">
        <button class="btn ok" id="w-sent">✅ Gesendet (Wiedervorlage +7 Tage)</button>
        <button class="btn warn" id="w-call">📞 Lieber anrufen</button>
        <button class="btn soft" id="w-reply">💬 Antwort erhalten</button>
        <button class="btn danger" id="w-no">Kein Interesse</button>
      </div>`;
  }
  function bindAnschreiben(v) {
    const l = leads.find(x => x.id === writeState.leadId); if (!l) return;
    const goNext = () => { const n = writeQueue(l.id)[0]; location.hash = n ? "#/anschreiben/" + n.id : "#/heute"; if (!n) toast("Alle Anschreiben erledigt"); };
    $("#w-tpl").onchange = e => { writeState.tplId = e.target.value; render(); };
    $("#w-edit").onclick = () => openLead(l.id);
    $("#w-skip").onclick = goNext;
    const tplId = () => $("#w-tpl").value;
    $("#w-send").onclick = () => { logContact(l, "email", tplId(), emailsFor(l).find(e => e.id === tplId())?.titel); };
    $("#w-copy").onclick = () => { const t = emailsFor(l).find(e => e.id === tplId()); copy(fill(t.betreff, l) + "\n\n" + fill(t.text, l)); };
    $("#w-sent").onclick = () => {
      const t = emailsFor(l).find(e => e.id === tplId());
      if (!(l.kontakte || []).some(k => k.typ === "email" && k.ts.startsWith(today()))) logContact(l, "email", t.id, t.titel);
      const mails = (l.kontakte || []).filter(k => k.typ === "email").length;
      l.status = "in_arbeit";
      if (mails >= 3) { l.status = "kein_interesse"; l.naechster = ""; toast("3 Mails ohne Antwort – Lead geparkt"); }
      else { const d = new Date(); d.setDate(d.getDate() + 7); l.naechster = d.toISOString().slice(0, 16); }
      saveLeads(); goNext();
    };
    $("#w-call").onclick = () => { l.kanal = "anruf"; l.naechster = ""; saveLeads(); location.hash = "#/anruf/" + l.id; };
    $("#w-reply").onclick = () => { l.status = "rueckruf"; l.kanal = "anruf"; l.naechster = new Date().toISOString().slice(0, 16); logContact(l, "notiz", "notiz", "Antwort auf Mail erhalten"); saveLeads(); toast("Als Rückruf markiert"); goNext(); };
    $("#w-no").onclick = () => { l.status = "kein_interesse"; l.naechster = ""; saveLeads(); goNext(); };
  }

  // ---------- Lead-Finder ----------
  let findState = { marktId: "us", ort: "", branche: "handwerk", radius: 15, results: null, status: "", error: "", filter: { tel: true, web: false, mail: false }, sel: new Set() };
  function viewFinden() {
    const f = findState;
    const filtered = (f.results || []).filter(r => (!f.filter.tel || r.telefon) && (!f.filter.web || !r.website) && (!f.filter.mail || r.email));
    const exists = r => leads.some(l => l.quelle === r.quelle || l.firma.toLowerCase() === r.firma.toLowerCase());
    return `<h1>Leads finden</h1>
      <div class="card">
        <div class="row"><div class="grow"><label>Markt</label><select id="fi-markt">${MARKETS.map(m => `<option value="${m.id}" ${f.marktId === m.id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select></div>
        <div style="width:6rem"><label>Radius km</label><input id="fi-radius" type="number" value="${f.radius}"></div></div>
        <label>Stadt / Region</label><input id="fi-ort" value="${esc(f.ort)}" placeholder="z. B. Austin, Texas oder Hamburg">
        <label>Branche</label><select id="fi-branche">${INDUSTRIES.map(i => `<option value="${i.id}" ${f.branche === i.id ? "selected" : ""}>${esc(i.name)}</option>`).join("")}</select>
        <div class="row" style="margin-top:.8rem"><button class="btn grow" id="fi-run">🔍 Suchen</button><button class="btn ghost" id="fi-save" title="Als Suchauftrag speichern">💾</button></div>
        <p class="muted" style="font-size:.78rem;margin-top:.5rem">Quelle: OpenStreetMap (kostenlos, weltweit). Kanal wird nach Markt gesetzt: Deutschland → ${settings.kanalDe === "email" ? "Anschreiben" : "Anrufen"}, Ausland → ${settings.kanalIntl === "email" ? "Anschreiben" : "Anrufen"}.</p>
      </div>
      ${searches.length ? `<h2>Suchaufträge (${searches.length})</h2>
        <button class="btn soft block" id="fi-runall" style="margin-bottom:.5rem">🤖 Alle ausführen und neue Leads importieren</button>
        ${searches.map((s, i) => `<div class="card tight row between"><div><b>${esc(MARKETS.find(m => m.id === s.marktId)?.cc || s.marktId)}</b> ${esc(s.ort)} · ${esc(INDUSTRIES.find(x => x.id === s.branche)?.name.split(" (")[0] || s.branche)} <small class="muted">· ${s.radius} km · zuletzt ${s.last ? fmtDate(s.last) : "nie"}${s.lastNew != null ? ", " + s.lastNew + " neu" : ""}</small></div><div class="row"><button class="btn sm ghost" data-runsearch="${i}">▶</button><button class="btn sm ghost" data-delsearch="${i}">🗑</button></div></div>`).join("")}` : ""}
      ${f.status ? `<p><span class="spinner"></span> ${esc(f.status)}</p>` : ""}
      ${f.error ? `<div class="hint warn">${esc(f.error)}</div>` : ""}
      ${f.results ? `<h2>Ergebnisse (${filtered.length} von ${f.results.length})</h2>
        <div class="chips" style="margin-bottom:.5rem">
          <button class="chip ${f.filter.tel ? "active" : ""}" data-ff="tel">nur mit Telefon</button>
          <button class="chip ${f.filter.mail ? "active" : ""}" data-ff="mail">nur mit E-Mail</button>
          <button class="chip ${f.filter.web ? "active" : ""}" data-ff="web">ohne Webseite (beste Leads)</button>
        </div>
        <div class="row" style="margin-bottom:.4rem"><button class="btn sm ghost" id="fi-all">Alle wählen</button><button class="btn sm ghost" id="fi-none">Keine</button><span class="grow"></span><button class="btn sm" id="fi-import">⬇ ${f.sel.size} importieren</button></div>
        <div class="card">${filtered.map(r => `<label class="result"><input type="checkbox" data-sel="${esc(r.quelle)}" ${f.sel.has(r.quelle) ? "checked" : ""} ${exists(r) ? "disabled" : ""}>
          <div class="grow"><div class="name">${esc(r.firma)} ${exists(r) ? '<span class="badge">schon da</span>' : ""}</div>
          <div class="sub">${esc(r.typ)}${r.stadt ? " · " + esc(r.stadt) : ""}<br>${r.telefon ? "📞 " + esc(r.telefon) : "<s>📞</s>"} ${r.email ? " ✉️ " + esc(r.email) : ""} ${r.website ? " 🌐" : " <b>kein Web</b>"}</div></div></label>`).join("") || "<p class='muted'>Nichts gefunden – Filter lockern oder Radius erhöhen.</p>"}</div>
        <button class="btn block" id="fi-import2" style="margin-top:.6rem">⬇ ${f.sel.size} Leads importieren</button>` : ""}
      <div class="hint" style="margin-top:1rem">Tipp: Für USA/UK abends (deutsche Zeit) suchen und anrufen, dann ist dort Vormittag. Ergebnisse ohne Webseite zuerst, das sind die dankbarsten Kunden.</div>`;
  }
  async function runSearch(s, silent) {
    findState.status = "Suche startet …"; findState.error = ""; if (!silent) render();
    try {
      const res = await SOURCES.find({ marktId: s.marktId, ort: s.ort, branche: s.branche, radiusKm: +s.radius || 15, onStatus: st => { findState.status = st; if (!silent) render(); } });
      findState.status = ""; return res;
    } catch (e) { findState.status = ""; findState.error = "Fehler: " + (e.message || e) + " – Internetverbindung prüfen, Ort genauer angeben oder später erneut versuchen."; if (!silent) render(); return null; }
  }
  function importResults(list) {
    let n = 0;
    for (const r of list) {
      if (leads.some(l => l.quelle === r.quelle || (l.firma.toLowerCase() === r.firma.toLowerCase() && (l.stadt || "") === (r.stadt || "")))) continue;
      leads.unshift(Object.assign({ id: uid(), erstellt: new Date().toISOString(), kontakte: [], status: "neu", ansprechpartner: "", naechster: "" }, r, { kanal: defaultKanal(r.markt) }));
      n++;
    }
    saveLeads(); return n;
  }
  function bindFinden(v) {
    const f = findState;
    const readForm = () => { f.marktId = $("#fi-markt").value; f.ort = $("#fi-ort").value.trim(); f.branche = $("#fi-branche").value; f.radius = +$("#fi-radius").value || 15; };
    $("#fi-markt").onchange = readForm; $("#fi-branche").onchange = readForm; $("#fi-ort").oninput = readForm; $("#fi-radius").oninput = readForm;
    $("#fi-run").onclick = async () => { readForm(); if (!f.ort) return toast("Stadt fehlt"); f.sel = new Set(); f.results = await runSearch(f); if (f.results) { f.results.filter(r => r.telefon).forEach(r => f.sel.add(r.quelle)); } render(); };
    $("#fi-save").onclick = () => { readForm(); if (!f.ort) return toast("Stadt fehlt"); searches.push({ marktId: f.marktId, ort: f.ort, branche: f.branche, radius: f.radius, last: "", lastNew: null }); saveSearches(); render(); toast("Suchauftrag gespeichert"); };
    $$("[data-runsearch]", v).forEach(b => b.onclick = async () => { const s = searches[+b.dataset.runsearch]; Object.assign(f, { marktId: s.marktId, ort: s.ort, branche: s.branche, radius: s.radius, sel: new Set() }); f.results = await runSearch(s); if (f.results) { s.last = new Date().toISOString(); f.results.filter(r => r.telefon).forEach(r => f.sel.add(r.quelle)); saveSearches(); } render(); });
    $$("[data-delsearch]", v).forEach(b => b.onclick = () => { searches.splice(+b.dataset.delsearch, 1); saveSearches(); render(); });
    const runAll = $("#fi-runall"); if (runAll) runAll.onclick = async () => {
      let total = 0;
      for (const s of searches) {
        f.status = `Suchauftrag ${esc(s.ort)} …`; render();
        const res = await runSearch(s, true); if (!res) continue;
        const n = importResults(res.filter(r => r.telefon || r.email)); s.last = new Date().toISOString(); s.lastNew = n; total += n;
        await new Promise(r => setTimeout(r, 1500)); // Overpass nicht überlasten
      }
      saveSearches(); f.status = ""; render(); toast(`${total} neue Leads importiert`);
    };
    $$("[data-ff]", v).forEach(b => b.onclick = () => { f.filter[b.dataset.ff] = !f.filter[b.dataset.ff]; render(); });
    $$("[data-sel]", v).forEach(cb => cb.onchange = () => { cb.checked ? f.sel.add(cb.dataset.sel) : f.sel.delete(cb.dataset.sel); $$("#fi-import,#fi-import2", v).forEach(b => b.textContent = `⬇ ${f.sel.size} importieren`); });
    const all = $("#fi-all"); if (all) all.onclick = () => { $$("[data-sel]:not(:disabled)", v).forEach(cb => f.sel.add(cb.dataset.sel)); render(); };
    const none = $("#fi-none"); if (none) none.onclick = () => { f.sel = new Set(); render(); };
    $$("#fi-import,#fi-import2", v).forEach(b => b.onclick = () => { const n = importResults(f.results.filter(r => f.sel.has(r.quelle))); f.sel = new Set(); render(); toast(`${n} Leads importiert`); });
  }

  // Automatisch (nachts per GitHub Action) gefundene Leads aus data/leads-auto.json einlesen
  async function loadAutoLeads() {
    toast("Lade automatische Leads …");
    try {
      const r = await fetch("data/leads-auto.json?ts=" + Date.now(), { cache: "no-store" });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      const list = (j.leads || []).map(x => Object.assign({}, x, { markt: x.markt || "de", sprache: x.sprache || (MARKETS.find(m => m.id === x.markt)?.sprache || "de") }));
      const n = importResults(list);
      render(); toast(n ? `${n} neue automatische Leads importiert` : "Keine neuen Leads (Stand " + (j.generated || "?").slice(0, 10) + ")");
    } catch (e) { toast("Keine automatischen Leads verfügbar (data/leads-auto.json fehlt oder nicht erreichbar)"); }
  }

  // ---------- Router ----------
  function route() {
    const h = location.hash.replace(/^#\/?/, "") || "heute";
    const [name, param] = h.split("/");
    return { name, param };
  }
  function render() {
    const { name, param } = route();
    const v = $("#view");
    const views = { heute: viewHeute, leads: viewLeads, anruf: () => viewAnruf(param), anschreiben: () => viewAnschreiben(param), finden: viewFinden, vorlagen: viewVorlagen, wissen: viewWissen };
    v.innerHTML = (views[name] || viewHeute)();
    $$("#tabbar a").forEach(a => a.classList.toggle("active", a.dataset.route === name));
    if (name !== "anruf") window.scrollTo(0, 0);
    bind(name);
  }
  function bind(name) {
    const v = $("#view");
    $$("[data-open]", v).forEach(el => el.onclick = () => openLead(el.dataset.open));
    if (name === "heute") $("#btn-autoleads").onclick = loadAutoLeads;
    if (name === "anschreiben") bindAnschreiben(v);
    if (name === "finden") bindFinden(v);
    if (name === "leads") {
      $("#btn-add").onclick = openNewLead;
      $("#lead-q").oninput = e => { leadFilter.q = e.target.value; const pos = e.target.selectionStart; render(); const i = $("#lead-q"); i.focus(); i.setSelectionRange(pos, pos); };
      $$("[data-status]", v).forEach(b => b.onclick = () => { leadFilter.status = b.dataset.status; render(); });
      $("#btn-import").onclick = () => $("#file-import").click();
      $("#file-import").onchange = e => e.target.files[0] && importCSV(e.target.files[0]);
      $("#btn-export").onclick = exportCSV;
    }
    if (name === "anruf") {
      const l = leads.find(x => x.id === callState.leadId); if (!l) return;
      $$("[data-phase]", v).forEach(b => b.onclick = () => { callState.phase = +b.dataset.phase; render(); });
      $("#c-prev").onclick = () => { callState.phase--; render(); };
      $("#c-next").onclick = () => { callState.phase++; render(); };
      $("#c-edit").onclick = () => openLead(l.id);
      $("#c-skip").onclick = () => { const n = nextLead(l.id); if (n) location.hash = "#/anruf/" + n.id; else toast("Kein weiterer Lead"); };
      $$("[data-outcome]", v).forEach(b => b.onclick = () => recordOutcome(l, OUTCOMES.find(o => o.id === b.dataset.outcome), $("#c-note").value.trim()));
    }
    if (name === "vorlagen") {
      $$("[data-tab]", v).forEach(b => b.onclick = () => { tplState.tab = b.dataset.tab; render(); });
      $("#t-lead").onchange = e => { tplState.leadId = e.target.value; render(); };
      $("#t-lang").onchange = e => { tplState.lang = e.target.value; render(); };
      const l = leads.find(x => x.id === tplState.leadId);
      const EM = (l ? langOf(l) : tplState.lang) === "en" ? EMAILS_EN : EMAILS;
      $$("[data-copy]", v).forEach(b => b.onclick = () => { const e = EM.find(x => x.id === b.dataset.copy); copy(fill(e.betreff, l) + "\n\n" + fill(e.text, l)); if (l) logContact(l, "email", e.id, e.titel); });
      $$("[data-mail]", v).forEach(a => a.onclick = () => { if (l) logContact(l, "email", a.dataset.mail, EM.find(x => x.id === a.dataset.mail).titel); });
    }
  }

  $("#btn-settings").onclick = openSettings;
  window.addEventListener("hashchange", () => { closeModal(); render(); });
  render();
})();
