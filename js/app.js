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
  let settings = Object.assign({ ich: "", telefon: "", zielAnrufe: 40, zielMails: 15, zielTermine: 1 }, load(LS_SETTINGS, {}));
  const saveLeads = () => save(LS_LEADS, leads);
  const saveSettings = () => save(LS_SETTINGS, settings);

  const SERVICES = window.ALWINE_SERVICES, INDUSTRIES = window.ALWINE_INDUSTRIES,
        SCRIPTS = window.ALWINE_SCRIPTS, EMAILS = window.ALWINE_EMAILS;

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
      aufhaenger: ind?.aufhaenger || "[Thema]",
      opener_branche: ind?.opener_variante || "Ich rufe an, weil wir Unternehmen aus Ihrer Branche helfen, mehr Anfragen über die Webseite zu bekommen und Verwaltungsarbeit zu automatisieren. Ist das bei Ihnen gerade Thema?",
      beobachtung: lead?.notizen ? lead.notizen.split("\n")[0] : "[Was ist mir auf der Webseite aufgefallen?]",
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
  function nextLead(excludeId) {
    const due = dueLeads().filter(l => l.id !== excludeId);
    if (due.length) return due[0];
    const pool = leads.filter(l => l.id !== excludeId && ["neu", "in_arbeit"].includes(l.status) && (!l.naechster || l.naechster.slice(0, 10) <= today()));
    pool.sort((a, b) => (a.kontakte?.length || 0) - (b.kontakte?.length || 0) || (a.erstellt || "").localeCompare(b.erstellt || ""));
    return pool[0] || null;
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
      <a class="btn big block" href="#/anruf">📞 Nächsten Anruf starten</a>
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
      <span class="badge ${l.status}">${STATUS[l.status] || l.status}</span></div>`;
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
      <small class="muted">CSV-Spalten: firma;ansprechpartner;telefon;email;website;branche;notizen – Vorlage: leads-vorlage.csv</small>`;
  }

  function leadForm(l = {}) {
    return `
      <label>Firma *</label><input id="f-firma" value="${esc(l.firma)}">
      <label>Ansprechpartner</label><input id="f-ap" value="${esc(l.ansprechpartner)}" placeholder="Herr/Frau Nachname">
      <label>Telefon</label><input id="f-tel" type="tel" value="${esc(l.telefon)}">
      <label>E-Mail</label><input id="f-mail" type="email" value="${esc(l.email)}">
      <label>Webseite</label><input id="f-web" value="${esc(l.website)}" placeholder="https://…">
      <label>Branche</label><select id="f-branche"><option value="">– wählen –</option>${INDUSTRIES.map(i => `<option value="${i.id}" ${l.branche === i.id ? "selected" : ""}>${esc(i.name)}</option>`).join("")}</select>
      <label>Status</label><select id="f-status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${(l.status || "neu") === k ? "selected" : ""}>${v}</option>`).join("")}</select>
      <label>Nächster Kontakt</label><input id="f-next" type="datetime-local" value="${esc(l.naechster || "")}">
      <label>Notizen (1. Zeile = Beobachtung für Opener/Mail)</label><textarea id="f-notiz">${esc(l.notizen)}</textarea>`;
  }
  function readLeadForm(c, l = {}) {
    return Object.assign(l, {
      firma: $("#f-firma", c).value.trim(), ansprechpartner: $("#f-ap", c).value.trim(), telefon: $("#f-tel", c).value.trim(),
      email: $("#f-mail", c).value.trim(), website: $("#f-web", c).value.trim(), branche: $("#f-branche", c).value,
      status: $("#f-status", c).value, naechster: $("#f-next", c).value, notizen: $("#f-notiz", c).value
    });
  }

  function openLead(id) {
    const l = leads.find(x => x.id === id); if (!l) return;
    const ind = industryOf(l);
    openModal(`
      <div class="row between"><h2 style="margin:0">${esc(l.firma)}</h2><span class="badge ${l.status}">${STATUS[l.status]}</span></div>
      <p class="muted">${esc(ind?.name || "")}</p>
      <div class="row wrap" style="margin:.6rem 0">
        ${l.telefon ? `<a class="btn sm" href="tel:${esc(l.telefon)}">📞 ${esc(l.telefon)}</a>` : ""}
        ${l.email ? `<a class="btn sm soft" href="mailto:${esc(l.email)}">✉️ Mail</a>` : ""}
        ${l.website ? `<a class="btn sm ghost" href="${esc(l.website.startsWith("http") ? l.website : "https://" + l.website)}" target="_blank">🌐 Web</a>` : ""}
        <a class="btn sm ok" href="#/anruf/${l.id}" data-close>Anruf-Modus</a>
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
        leads.push({ id: uid(), erstellt: new Date().toISOString(), kontakte: [], status: "neu", firma, ansprechpartner: r.ansprechpartner || r.kontakt || "", telefon: r.telefon || r.phone || "", email: r.email || r["e-mail"] || "", website: r.website || r.web || "", branche, notizen: r.notizen || r.notiz || "", naechster: "" });
        n++;
      }
      saveLeads(); render(); toast(`${n} Leads importiert`);
    };
    rd.readAsText(file, "utf-8");
  }
  function exportCSV() {
    const cols = ["firma", "ansprechpartner", "telefon", "email", "website", "branche", "status", "naechster", "notizen", "kontakte"];
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
    const phases = SCRIPTS.phasen;
    const ph = phases[callState.phase];
    const recommended = (ind?.empfohlene_leistungen || ["website"]).map(id => SERVICES.find(s => s.id === id)).filter(Boolean);
    return `
      <div class="card">
        <div class="row between"><div><div style="font-weight:700;font-size:1.1rem">${esc(l.firma)}</div>
        <div class="muted" style="font-size:.85rem">${esc(l.ansprechpartner || "Ansprechpartner unbekannt")} · ${esc(ind?.name.split(" (")[0] || "Branche?")} · ${(l.kontakte || []).length}. Kontakt</div></div>
        <span class="badge ${l.status}">${STATUS[l.status]}</span></div>
        ${l.notizen ? `<p style="font-size:.85rem;margin-top:.4rem">📝 ${esc(l.notizen.split("\n")[0])}</p>` : ""}
        ${ind ? `<p class="muted" style="font-size:.8rem">⏱ ${esc(ind.beste_zeit)} · 👤 ${esc(ind.entscheider)}</p>` : ""}
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
      <details><summary>Einwände (${SCRIPTS.einwaende.length})</summary>
        ${SCRIPTS.einwaende.map(e => `<details><summary>${esc(e.einwand)}</summary><p>${esc(fill(e.antwort, l))}</p><p class="tipp">${esc(e.hinweis)}</p></details>`).join("")}
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
    const tpl = mailFor && EMAILS.find(e => e.id === mailFor);
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
  let tplState = { tab: "skript", leadId: "" };
  function viewVorlagen() {
    const l = leads.find(x => x.id === tplState.leadId) || null;
    const leadSel = `<select id="t-lead"><option value="">Platzhalter allgemein</option>${leads.filter(x => !["kein_interesse", "nicht_anrufen"].includes(x.status)).map(x => `<option value="${x.id}" ${x.id === tplState.leadId ? "selected" : ""}>${esc(x.firma)}</option>`).join("")}</select>`;
    let body = "";
    if (tplState.tab === "skript") {
      body = SCRIPTS.phasen.map(p => `<details ${p.id === "opener" ? "open" : ""}><summary>${esc(p.titel)}</summary><small class="muted">Ziel: ${esc(p.ziel)}</small>${p.text.map(t => `<div class="script-line">${esc(fill(t, l))}</div>`).join("")}${(p.tipps || []).map(t => `<div class="tipp">💡 ${esc(t)}</div>`).join("")}</details>`).join("");
    } else if (tplState.tab === "einwaende") {
      body = SCRIPTS.einwaende.map(e => `<details><summary>${esc(e.einwand)}</summary><p>${esc(fill(e.antwort, l))}</p><p class="tipp">${esc(e.hinweis)}</p></details>`).join("");
    } else {
      const groups = {}; EMAILS.forEach(e => (groups[e.kategorie] = groups[e.kategorie] || []).push(e));
      body = Object.entries(groups).map(([g, es]) => `<h3>${esc(g)}</h3>` + es.map(e => `<details><summary>${esc(e.titel)}</summary>
        <p><b>Betreff:</b> ${esc(fill(e.betreff, l))}</p><pre class="mail">${esc(fill(e.text, l))}</pre>
        <div class="row"><a class="btn sm grow" href="${mailtoHref(e, l || {})}" data-mail="${e.id}">✉️ Mail-App öffnen</a><button class="btn sm ghost" data-copy="${e.id}">Kopieren</button></div></details>`).join("")).join("");
    }
    return `<h1>Vorlagen</h1>
      <div class="chips" style="margin-bottom:.6rem">${[["skript", "Gesprächsleitfaden"], ["einwaende", "Einwände"], ["emails", "E-Mails"]].map(([k, v]) => `<button class="chip ${tplState.tab === k ? "active" : ""}" data-tab="${k}">${v}</button>`).join("")}</div>
      <label>Platzhalter füllen mit Lead</label>${leadSel}
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
      <h2>Weiterführend</h2>
      <div class="card"><p>docs/01-taktiken.md – erprobte Taktiken für unsere Branche</p><p>docs/02-verkaufsgespraech.md – das komplette Verkaufsgespräch</p><p>docs/04-tagesroutine.md – Tages- und Wochenroutine</p><p>docs/05-lead-recherche.md – wo die Firmen herkommen</p></div>`;
  }

  function openSettings() {
    openModal(`<h2 style="margin:0">Einstellungen</h2>
      <label>Mein Name (für Skripte/Mails)</label><input id="s-ich" value="${esc(settings.ich)}" placeholder="Vorname Nachname">
      <label>Meine Telefonnummer</label><input id="s-tel" value="${esc(settings.telefon)}">
      <label>Tagesziel Anrufe</label><input id="s-za" type="number" value="${settings.zielAnrufe}">
      <label>Tagesziel E-Mails</label><input id="s-zm" type="number" value="${settings.zielMails}">
      <label>Tagesziel Termine</label><input id="s-zt" type="number" value="${settings.zielTermine}">
      <button class="btn block" style="margin-top:1rem" id="s-save">Speichern</button>
      <div class="row" style="margin-top:.8rem"><button class="btn ghost sm grow" id="s-backup">Backup (JSON)</button><button class="btn ghost sm grow" id="s-restore">Wiederherstellen</button></div>
      <input type="file" id="s-file" accept="application/json" hidden>
      <button class="btn ghost block" style="margin-top:.5rem" data-close>Schließen</button>`, c => {
      $("#s-save", c).onclick = () => { settings.ich = $("#s-ich", c).value.trim(); settings.telefon = $("#s-tel", c).value.trim(); settings.zielAnrufe = +$("#s-za", c).value || 40; settings.zielMails = +$("#s-zm", c).value || 15; settings.zielTermine = +$("#s-zt", c).value || 1; saveSettings(); closeModal(); render(); toast("Gespeichert"); };
      $("#s-backup", c).onclick = () => { const blob = new Blob([JSON.stringify({ leads, settings }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `alwine-backup-${today()}.json`; a.click(); };
      $("#s-restore", c).onclick = () => $("#s-file", c).click();
      $("#s-file", c).onchange = e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { const d = JSON.parse(rd.result); if (Array.isArray(d.leads)) { leads = d.leads; settings = Object.assign(settings, d.settings || {}); saveLeads(); saveSettings(); closeModal(); render(); toast("Wiederhergestellt"); } } catch { toast("Ungültige Datei"); } }; rd.readAsText(f); };
      $("[data-close]", c).onclick = closeModal;
    });
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
    const views = { heute: viewHeute, leads: viewLeads, anruf: () => viewAnruf(param), vorlagen: viewVorlagen, wissen: viewWissen };
    v.innerHTML = (views[name] || viewHeute)();
    $$("#tabbar a").forEach(a => a.classList.toggle("active", a.dataset.route === name));
    if (name !== "anruf") window.scrollTo(0, 0);
    bind(name);
  }
  function bind(name) {
    const v = $("#view");
    $$("[data-open]", v).forEach(el => el.onclick = () => openLead(el.dataset.open));
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
      const l = leads.find(x => x.id === tplState.leadId);
      $$("[data-copy]", v).forEach(b => b.onclick = () => { const e = EMAILS.find(x => x.id === b.dataset.copy); copy(fill(e.betreff, l) + "\n\n" + fill(e.text, l)); if (l) logContact(l, "email", e.id, e.titel); });
      $$("[data-mail]", v).forEach(a => a.onclick = () => { if (l) logContact(l, "email", a.dataset.mail, EMAILS.find(x => x.id === a.dataset.mail).titel); });
    }
  }

  $("#btn-settings").onclick = openSettings;
  window.addEventListener("hashchange", () => { closeModal(); render(); });
  render();
})();
