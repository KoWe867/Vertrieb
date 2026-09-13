/* Alwine Vertrieb – Desktop-Dashboard (Feature 0: Shell auf localStorage, Backend folgt laut plans/). */
(function () {
  "use strict";
  const S = window.AlwineStore, SOURCES = window.ALWINE_SOURCES, INDUSTRIES = window.ALWINE_INDUSTRIES,
        EMAILS = window.ALWINE_EMAILS, EMAILS_EN = window.ALWINE_EMAILS_EN, MARKETS = S.MARKETS;
  const STATUS = { neu: "Neu", in_arbeit: "In Arbeit", rueckruf: "Rückruf", termin: "Termin", angebot: "Angebot", kunde: "Kunde", kein_interesse: "Kein Interesse", nicht_anrufen: "Nicht anrufen" };
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = iso => { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + (iso.length > 10 ? " " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : ""); };
  const toast = m => { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 2500); };
  const pct = (a, b) => Math.min(100, Math.round(100 * a / Math.max(1, b)));
  const marketOf = l => MARKETS.find(m => m.id === (l.markt || "de")) || MARKETS[0];
  const langOf = l => l.sprache || marketOf(l).sprache;
  const kanalOf = (l, st) => { const k = l.kanal || (["de", "at"].includes(l.markt || "de") ? st.kanalDe : st.kanalIntl); return k === "email" && !l.email ? "anruf" : k; };
  const fill = (text, l, st, prof) => {
    const ind = INDUSTRIES.find(i => i.id === l?.branche);
    const map = { firma: l?.firma || "[Firma]", ansprechpartner: l?.ansprechpartner || "[Name]", ich: st.ich || prof.inhaber || "[Name]", telefon: st.telefon || prof.telefon || "[Telefon]", branche: ind?.name || "[Branche]", aufhaenger: ind?.aufhaenger || "[Thema]", beobachtung: l?.notizen ? l.notizen.split("\n")[0] : "[Beobachtung]", termin: l?.naechster ? fmt(l.naechster) : "[Termin]" };
    return text.replace(/\{(\w+)\}/g, (m, k) => map[k] ?? m);
  };
  function openModal(html, mount) { const m = $("#modal"); $("#modal-card").innerHTML = html; m.hidden = false; m.onclick = e => { if (e.target === m) closeModal(); }; mount && mount($("#modal-card")); }
  function closeModal() { $("#modal").hidden = true; }

  // ---------- Übersicht ----------
  function viewUebersicht() {
    const leads = S.leads(), st = S.settings(), t = S.todayStats(leads), w = S.weekStats(leads), accs = S.accounts();
    const scored = leads.map(l => ({ l, ...S.scoreLead(l) }));
    const heute = scored.filter(x => (x.l.erstellt || "").startsWith(S.today()));
    const hot = heute.filter(x => x.klasse === "hot").length, warm = heute.filter(x => x.klasse === "warm").length;
    const faellig = leads.filter(l => l.naechster && l.naechster.slice(0, 10) <= S.today() && !["kunde", "kein_interesse", "nicht_anrufen"].includes(l.status));
    const pipe = {}; leads.forEach(l => pipe[l.status] = (pipe[l.status] || 0) + 1);
    const limitGesamt = accs.reduce((a, c) => a + S.warmupLimit(c), 0);
    return `<h1>Übersicht · ${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</h1>
      <div class="grid c4">
        <div class="card kpi"><b>${t.anrufe}</b><small>Anrufe heute / ${st.zielAnrufe}</small><div class="progress"><i style="width:${pct(t.anrufe, st.zielAnrufe)}%"></i></div></div>
        <div class="card kpi"><b>${t.termine}</b><small>Termine / ${st.zielTermine}</small><div class="progress"><i style="width:${pct(t.termine, st.zielTermine)}%"></i></div></div>
        <div class="card kpi"><b>${t.mails}</b><small>Mails gesendet / ${limitGesamt || st.zielMails} Kontingent</small><div class="progress"><i style="width:${pct(t.mails, limitGesamt || st.zielMails)}%"></i></div></div>
        <div class="card kpi"><b>${hot + warm}</b><small>Leads heute (Hot ${hot} · Warm ${warm}) / ${st.zielLeads}</small><div class="progress"><i style="width:${pct(hot + warm, st.zielLeads)}%"></i></div></div>
      </div>
      <div class="grid c2" style="margin-top:1rem">
        <div class="card"><h3 style="margin-top:0">Pipeline (${leads.length} Leads)</h3><div class="pipeline">${["neu", "in_arbeit", "rueckruf", "termin", "angebot", "kunde"].map(s => `<div><b>${pipe[s] || 0}</b>${STATUS[s]}</div>`).join("")}</div>
          <p class="small muted" style="margin-top:.6rem">Antworten heute ${t.antworten} · 7 Tage: ${w.mails} Mails, ${w.antworten} Antworten, ${w.bounces} Bounces, ${w.abmeldungen} Abmeldungen</p></div>
        <div class="card"><h3 style="margin-top:0">Heute fällig (${faellig.length})</h3>${faellig.slice(0, 6).map(l => `<div class="row between" style="padding:.3rem 0;border-bottom:1px solid var(--line)"><span>${esc(l.firma)} <span class="badge ${l.status}">${STATUS[l.status]}</span></span><span class="small muted">${fmt(l.naechster)} · ${kanalOf(l, st) === "email" ? "✉️" : "📞"}</span></div>`).join("") || "<p class='muted'>Nichts fällig.</p>"}
          <div class="row" style="margin-top:.8rem"><a class="btn" href="../#/anruf" target="_blank">📞 Anruf-Modus (Handy-App)</a><a class="btn soft" href="#/mail">✉️ Mail-Center</a></div></div>
      </div>
      <h2>Tagesablauf</h2>
      <div class="card grid c3">
        <div><b>05:30</b> Lead-Suche automatisch (30 DE-Leads, Hot/Warm)<br><b>08:30</b> Anrufblock Deutschland, Hot zuerst</div>
        <div><b>12:30</b> Mail-Center: Ausland, Bitte um Telefonat<br><b>14:00</b> Rückrufe, Nachfassen</div>
        <div><b>16:30</b> Termine bestätigen, Angebote<br><b>17:00</b> Tagesreport</div>
      </div>
      ${!accs.length ? `<div class="hint warn" style="margin-top:1rem">Noch kein Gmail-Konto angelegt. Unter „Gmail-Konten“ Adressen und Tageslimits eintragen. Echter Versand über die Gmail-API kommt mit Feature 2 (plans/feature-2-mail-center.md).</div>` : ""}`;
  }

  // ---------- Leads & Finder ----------
  let lf = { q: "", status: "", klasse: "", markt: "" };
  let fs = { marktId: "de", ort: "", branche: "handwerk", radius: 15, nurNeu: false, results: null, status: "", error: "", sel: new Set() };
  function viewLeads() {
    const st = S.settings(), leads = S.leads().map(l => ({ l, ...S.scoreLead(l) }));
    const q = lf.q.toLowerCase();
    const list = leads.filter(x => (!lf.status || x.l.status === lf.status) && (!lf.klasse || x.klasse === lf.klasse) && (!lf.markt || (x.l.markt || "de") === lf.markt) && (!q || [x.l.firma, x.l.stadt, x.l.notizen].join(" ").toLowerCase().includes(q)))
      .sort((a, b) => b.score - a.score || (b.l.erstellt || "").localeCompare(a.l.erstellt || ""));
    const f = fs, exists = r => S.leads().some(l => l.quelle === r.quelle || l.firma.toLowerCase() === r.firma.toLowerCase());
    const res = (f.results || []).map(r => ({ r, ...S.scoreLead(r) })).filter(x => !f.nurNeu || x.signale.includes("Neueröffnung")).sort((a, b) => b.score - a.score);
    return `<div class="row between"><h1>Leads &amp; Finder</h1><div class="row"><button class="btn ghost sm" id="l-export">CSV exportieren</button><button class="btn sm" id="l-new">+ Lead</button></div></div>
      <div class="card">
        <h3 style="margin-top:0">🔍 Lead-Finder <span class="small muted">· Kriterium: noch nicht erfolgreich (keine/alte Webseite, Neueröffnung, wenige Bewertungen). Ketten werden abgewertet.</span></h3>
        <div class="grid c4">
          <div><label>Markt</label><select id="f-markt">${MARKETS.map(m => `<option value="${m.id}" ${f.marktId === m.id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select></div>
          <div><label>Stadt / Region</label><input id="f-ort" value="${esc(f.ort)}" placeholder="z. B. Leipzig"></div>
          <div><label>Branche</label><select id="f-branche">${INDUSTRIES.map(i => `<option value="${i.id}" ${f.branche === i.id ? "selected" : ""}>${esc(i.name.split(" (")[0])}</option>`).join("")}</select></div>
          <div><label>Radius km</label><input id="f-radius" type="number" value="${f.radius}"></div>
        </div>
        <div class="row" style="margin-top:.8rem"><button class="btn" id="f-run">Suchen</button><label class="row" style="margin:0"><input type="checkbox" id="f-neu" ${f.nurNeu ? "checked" : ""} style="width:auto"> nur Neueröffnungen</label><span class="grow"></span>${f.status ? `<span class="spinner"></span> ${esc(f.status)}` : ""}<span class="small muted">Tagesziel ${st.zielLeads} Hot+Warm · KI-Bewertung kommt mit Feature 3</span></div>
        ${f.error ? `<div class="hint warn" style="margin-top:.6rem">${esc(f.error)}</div>` : ""}
        ${f.results ? `<div class="row between" style="margin-top:.8rem"><b>${res.length} Kandidaten</b><div class="row"><button class="btn sm ghost" id="f-all">Hot+Warm wählen</button><button class="btn sm" id="f-import">⬇ ${f.sel.size} importieren</button></div></div>
        <table style="margin-top:.4rem"><thead><tr><th></th><th>Firma</th><th>Typ · Ort</th><th>Kontakt</th><th>Signale</th><th>Score</th></tr></thead><tbody>
        ${res.map(x => `<tr><td><input type="checkbox" data-sel="${esc(x.r.quelle)}" ${f.sel.has(x.r.quelle) ? "checked" : ""} ${exists(x.r) ? "disabled" : ""} style="width:auto"></td><td>${esc(x.r.firma)} ${exists(x.r) ? '<span class="badge">schon da</span>' : ""}</td><td class="small">${esc(x.r.typ)} · ${esc(x.r.stadt)}</td><td class="small">${x.r.telefon ? "📞 " + esc(x.r.telefon) : "<s>📞</s>"} ${x.r.email ? "✉️" : ""} ${x.r.website ? "🌐" : ""}</td><td class="small">${x.signale.map(esc).join(", ")}</td><td><span class="badge ${x.klasse}">${x.klasse} ${x.score}</span></td></tr>`).join("")}</tbody></table>` : ""}
      </div>
      <div class="row wrap" style="margin:1rem 0 .6rem"><input id="l-q" value="${esc(lf.q)}" placeholder="Suchen…" style="max-width:260px">
        <div class="chips"><span class="chip ${!lf.klasse ? "active" : ""}" data-k="">Alle</span><span class="chip ${lf.klasse === "hot" ? "active" : ""}" data-k="hot">Hot</span><span class="chip ${lf.klasse === "warm" ? "active" : ""}" data-k="warm">Warm</span><span class="chip ${lf.klasse === "cold" ? "active" : ""}" data-k="cold">Cold</span></div>
        <select id="l-status" style="max-width:180px"><option value="">Alle Status</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${lf.status === k ? "selected" : ""}>${v}</option>`).join("")}</select>
        <select id="l-markt" style="max-width:180px"><option value="">Alle Märkte</option>${MARKETS.map(m => `<option value="${m.id}" ${lf.markt === m.id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select></div>
      <div class="card" style="padding:0"><table><thead><tr><th>Firma</th><th>Markt</th><th>Branche · Ort</th><th>Kanal</th><th>Status</th><th>Score</th><th>Nächster</th><th>Kontakte</th></tr></thead><tbody>
        ${list.map(x => `<tr class="click" data-open="${x.l.id}"><td><b>${esc(x.l.firma)}</b><div class="small muted">${esc((x.l.notizen || "").split("\n")[0])}</div></td><td><span class="badge ${langOf(x.l)}">${esc(marketOf(x.l).cc || "EN")}</span></td><td class="small">${esc(INDUSTRIES.find(i => i.id === x.l.branche)?.name.split(" (")[0] || "")} · ${esc(x.l.stadt || "")}</td><td>${kanalOf(x.l, st) === "email" ? "✉️" : "📞"}</td><td><span class="badge ${x.l.status}">${STATUS[x.l.status]}</span></td><td><span class="badge ${x.klasse}">${x.score}</span></td><td class="small">${fmt(x.l.naechster)}</td><td>${(x.l.kontakte || []).length}</td></tr>`).join("") || `<tr><td colspan="8" class="empty">Keine Leads. Oben suchen oder „+ Lead“.</td></tr>`}</tbody></table></div>`;
  }
  function bindLeads(v) {
    const st = S.settings();
    $("#l-q").oninput = e => { lf.q = e.target.value; const p = e.target.selectionStart; render(); $("#l-q").focus(); $("#l-q").setSelectionRange(p, p); };
    $("#l-status").onchange = e => { lf.status = e.target.value; render(); }; $("#l-markt").onchange = e => { lf.markt = e.target.value; render(); };
    $$("[data-k]", v).forEach(c => c.onclick = () => { lf.klasse = c.dataset.k; render(); });
    $$("[data-open]", v).forEach(r => r.onclick = () => openLead(r.dataset.open));
    $("#l-new").onclick = () => openLead(null);
    $("#l-export").onclick = () => { const cols = ["firma", "ansprechpartner", "telefon", "email", "website", "branche", "markt", "kanal", "stadt", "status", "naechster", "notizen"]; const e2 = x => `"${String(x ?? "").replace(/"/g, '""')}"`; const lines = [cols.join(";")].concat(S.leads().map(l => cols.map(c => e2(l[c])).join(";"))); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" })); a.download = `alwine-leads-${S.today()}.csv`; a.click(); };
    const f = fs, read = () => { f.marktId = $("#f-markt").value; f.ort = $("#f-ort").value.trim(); f.branche = $("#f-branche").value; f.radius = +$("#f-radius").value || 15; f.nurNeu = $("#f-neu").checked; };
    ["#f-markt", "#f-branche", "#f-radius", "#f-ort"].forEach(s => $(s).onchange = read); $("#f-neu").onchange = () => { read(); render(); };
    $("#f-run").onclick = async () => { read(); if (!f.ort) return toast("Stadt fehlt"); f.status = "Suche …"; f.error = ""; f.results = null; f.sel = new Set(); render();
      try { const r = await SOURCES.find({ marktId: f.marktId, ort: f.ort, branche: f.branche, radiusKm: f.radius, limit: 300, onStatus: s => { f.status = s; render(); } });
        f.results = r.map(x => Object.assign(x, { neu: /start_date|opening_date/.test(x.notizen || "") })); f.status = "";
        f.results.forEach(x => { const sc = S.scoreLead(x); if (sc.klasse !== "cold" && x.telefon) f.sel.add(x.quelle); });
      } catch (e) { f.status = ""; f.error = "Fehler: " + (e.message || e) + ". Internet prüfen oder Ort genauer angeben."; }
      render(); };
    $$("[data-sel]", v).forEach(cb => cb.onchange = () => { cb.checked ? f.sel.add(cb.dataset.sel) : f.sel.delete(cb.dataset.sel); $("#f-import").textContent = `⬇ ${f.sel.size} importieren`; });
    const all = $("#f-all"); if (all) all.onclick = () => { f.results.forEach(x => { if (S.scoreLead(x).klasse !== "cold") f.sel.add(x.quelle); }); render(); };
    const imp = $("#f-import"); if (imp) imp.onclick = () => { const leads = S.leads(); let n = 0; for (const r of f.results.filter(x => f.sel.has(x.quelle))) { if (leads.some(l => l.quelle === r.quelle || l.firma.toLowerCase() === r.firma.toLowerCase())) continue; const sc = S.scoreLead(r); leads.unshift(Object.assign({ id: S.uid(), erstellt: new Date().toISOString(), kontakte: [], status: "neu", ansprechpartner: "", naechster: "" }, r, { kanal: "", score: sc.score, klasse: sc.klasse })); n++; } S.saveLeads(leads); f.sel = new Set(); render(); toast(`${n} Leads importiert`); };
  }
  function openLead(id) {
    const leads = S.leads(); const l = leads.find(x => x.id === id) || { id: null, status: "neu", markt: "de", kontakte: [] };
    const sc = S.scoreLead(l);
    openModal(`<div class="row between"><h2 style="margin:0">${l.id ? esc(l.firma) : "Neuer Lead"}</h2>${l.id ? `<span class="badge ${sc.klasse}">${sc.klasse} ${sc.score}</span>` : ""}</div>
      <div class="grid c2">
        <div><label>Firma</label><input id="e-firma" value="${esc(l.firma)}"><label>Ansprechpartner</label><input id="e-ap" value="${esc(l.ansprechpartner)}"><label>Telefon</label><input id="e-tel" value="${esc(l.telefon)}"><label>E-Mail</label><input id="e-mail" value="${esc(l.email)}"><label>Webseite</label><input id="e-web" value="${esc(l.website)}"></div>
        <div><label>Markt</label><select id="e-markt">${MARKETS.map(m => `<option value="${m.id}" ${(l.markt || "de") === m.id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select><label>Kanal</label><select id="e-kanal"><option value="">Standard</option><option value="anruf" ${l.kanal === "anruf" ? "selected" : ""}>Anrufen</option><option value="email" ${l.kanal === "email" ? "selected" : ""}>Anschreiben</option></select><label>Branche</label><select id="e-branche"><option value="">–</option>${INDUSTRIES.map(i => `<option value="${i.id}" ${l.branche === i.id ? "selected" : ""}>${esc(i.name.split(" (")[0])}</option>`).join("")}</select><label>Stadt</label><input id="e-stadt" value="${esc(l.stadt)}"><label>Status</label><select id="e-status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${l.status === k ? "selected" : ""}>${v}</option>`).join("")}</select><label>Nächster Kontakt</label><input id="e-next" type="datetime-local" value="${esc(l.naechster || "")}"></div>
      </div>
      <label>Notizen (Zeile 1 = Beobachtung)</label><textarea id="e-notiz">${esc(l.notizen)}</textarea>
      ${l.id ? `<h3>Verlauf</h3><div style="max-height:160px;overflow:auto">${(l.kontakte || []).slice().reverse().map(k => `<div class="small" style="padding:.2rem 0;border-bottom:1px solid var(--line)"><b>${fmt(k.ts)}</b> ${k.typ === "anruf" ? "📞" : k.typ === "email" ? "✉️" : "📝"} ${esc(k.ergebnis)} ${k.notiz ? "– " + esc(k.notiz) : ""}</div>`).join("") || "<span class='muted small'>Noch kein Kontakt</span>"}</div>` : ""}
      <div class="row" style="margin-top:1rem"><button class="btn" id="e-save">Speichern</button>${l.id ? `<a class="btn soft" href="../#/anruf/${l.id}" target="_blank">📞 Anruf-Modus</a><a class="btn soft" href="../#/anschreiben/${l.id}" target="_blank">✉️ Anschreiben</a><span class="grow"></span><button class="btn danger sm" id="e-del">Löschen</button>` : ""}<button class="btn ghost" id="e-close">Schließen</button></div>`, c => {
      $("#e-save", c).onclick = () => { const o = { firma: $("#e-firma", c).value.trim(), ansprechpartner: $("#e-ap", c).value.trim(), telefon: $("#e-tel", c).value.trim(), email: $("#e-mail", c).value.trim(), website: $("#e-web", c).value.trim(), markt: $("#e-markt", c).value, kanal: $("#e-kanal", c).value, branche: $("#e-branche", c).value, stadt: $("#e-stadt", c).value.trim(), status: $("#e-status", c).value, naechster: $("#e-next", c).value, notizen: $("#e-notiz", c).value }; if (!o.firma) return toast("Firma fehlt"); o.sprache = MARKETS.find(m => m.id === o.markt).sprache; if (l.id) Object.assign(l, o); else leads.unshift(Object.assign({ id: S.uid(), erstellt: new Date().toISOString(), kontakte: [] }, o)); S.saveLeads(leads); closeModal(); render(); toast("Gespeichert"); };
      if (l.id) $("#e-del", c).onclick = () => { if (confirm("Lead löschen?")) { S.saveLeads(leads.filter(x => x.id !== l.id)); closeModal(); render(); } };
      $("#e-close", c).onclick = closeModal;
    });
  }

  // ---------- Mail-Center ----------
  let ms = { tplId: "", filter: "" };
  function viewMail() {
    const st = S.settings(), prof = S.profil(), leads = S.leads(), accs = S.accounts(), t = S.todayStats(leads), w = S.weekStats(leads);
    const queue = leads.filter(l => kanalOf(l, st) === "email" && l.email && ["neu", "in_arbeit"].includes(l.status) && (!l.naechster || l.naechster.slice(0, 10) <= S.today()));
    const kontingent = accs.filter(a => a.status !== "pausiert").reduce((a, c) => a + Math.max(0, S.warmupLimit(c) - (t.mailsJeKonto[c.id] || 0)), 0);
    const answers = leads.filter(l => (l.kontakte || []).some(k => k.typ === "notiz" && /antwort/i.test(k.notiz || "") && k.ts.slice(0, 10) === S.today()));
    return `<h1>Mail-Center</h1>
      <div class="grid c4">
        <div class="card kpi"><b>${t.mails}</b><small>Gesendet heute</small></div>
        <div class="card kpi"><b>${kontingent}</b><small>Noch frei heute (alle Konten)</small></div>
        <div class="card kpi"><b>${t.antworten}</b><small>Antworten heute · 7 Tage ${w.antworten}</small></div>
        <div class="card kpi"><b>${w.bounces}</b><small>Bounces 7 Tage · ${w.abmeldungen} Abmeldungen</small></div>
      </div>
      <h2>Konten heute</h2>
      <div class="card" style="padding:0"><table><thead><tr><th>Konto</th><th>Gesendet</th><th>Limit heute</th><th>Auslastung</th><th>Status</th></tr></thead><tbody>
        ${accs.map(a => { const lim = S.warmupLimit(a), sent = t.mailsJeKonto[a.id] || 0, p = pct(sent, lim); return `<tr><td><b>${esc(a.email)}</b><div class="small muted">${esc(a.name || "")}</div></td><td>${sent}</td><td>${lim}${a.warmup ? ` <span class="small muted">(Warm-up, Ziel ${a.limit})</span>` : ""}</td><td style="min-width:160px"><div class="progress"><i class="${p >= 100 ? "danger" : p >= 80 ? "warn" : ""}" style="width:${p}%"></i></div></td><td><span class="badge ${a.status === "verbunden" ? "termin" : a.status === "pausiert" ? "kein_interesse" : ""}">${esc(a.status || "nicht verbunden")}</span></td></tr>`; }).join("") || `<tr><td colspan="5" class="empty">Kein Konto. Unter „Gmail-Konten“ anlegen.</td></tr>`}</tbody></table></div>
      <div class="grid c2" style="margin-top:1rem">
        <div class="card"><h3 style="margin-top:0">Warteschlange (${queue.length})</h3><p class="small muted">Leads mit Kanal „Anschreiben“ und E-Mail-Adresse, heute fällig. Versand über die Gmail-API folgt mit Feature 2; bis dahin öffnet „Senden“ die Mail-App und zählt auf das Konto.</p>
          <label>Vorlage</label><select id="m-tpl"><option value="">automatisch nach Kontaktzahl</option>${[...EMAILS, ...EMAILS_EN].map(e => `<option value="${e.id}|${EMAILS.includes(e) ? "de" : "en"}" ${ms.tplId === e.id + "|" + (EMAILS.includes(e) ? "de" : "en") ? "selected" : ""}>${EMAILS.includes(e) ? "DE" : "EN"} · ${esc(e.titel)}</option>`).join("")}</select>
          <div style="max-height:380px;overflow:auto;margin-top:.6rem">${queue.map(l => { const n = (l.kontakte || []).filter(k => k.typ === "email").length; return `<div class="row between" style="padding:.4rem 0;border-bottom:1px solid var(--line)"><div><b>${esc(l.firma)}</b> <span class="badge ${langOf(l)}">${esc(marketOf(l).cc || "EN")}</span><div class="small muted">${esc(l.email)} · ${n}. Mail${langOf(l) === "de" ? ' · <span style="color:var(--warn)">DE: nur mit Einwilligung</span>' : ""}</div></div><div class="row"><button class="btn sm ghost" data-preview="${l.id}">Vorschau</button><button class="btn sm" data-send="${l.id}" ${!kontingent ? "disabled" : ""}>Senden</button></div></div>`; }).join("") || "<p class='muted'>Leer.</p>"}</div></div>
        <div class="card"><h3 style="margin-top:0">Antworten heute (${answers.length})</h3>${answers.map(l => `<div class="row between" style="padding:.4rem 0;border-bottom:1px solid var(--line)"><b>${esc(l.firma)}</b><a class="btn sm ok" href="../#/anruf/${l.id}" target="_blank">📞 anrufen</a></div>`).join("") || "<p class='muted'>Keine. Antworten werden ab Feature 2 automatisch aus Gmail gelesen; bis dahin im Lead als Notiz „Antwort erhalten“ eintragen.</p>"}
          <h3>Regeln</h3><ul class="small muted" style="padding-left:1.1rem"><li>Deutschland: keine Kalt-Mail ohne Einwilligung (§ 7 UWG). Anrufen.</li><li>Ausland: Erstmail bittet um Telefonat, Postanschrift + Abmeldung in der Signatur (CAN-SPAM).</li><li>Limit je Konto hart, Warm-up 20/Tag steigend. Realistisch zustellbar: 50–100 Kalt-Mails je Konto.</li><li>Antwort → Lead auf Rückruf, „stop“ → Nicht anrufen.</li></ul></div>
      </div>`;
  }
  function bindMail(v) {
    const st = S.settings(), prof = S.profil();
    $("#m-tpl").onchange = e => { ms.tplId = e.target.value; render(); };
    const pick = l => { const EM = langOf(l) === "en" ? EMAILS_EN : EMAILS; if (ms.tplId) { const [id, lang] = ms.tplId.split("|"); const arr = lang === "en" ? EMAILS_EN : EMAILS; return arr.find(e => e.id === id) || EM[0]; } const n = (l.kontakte || []).filter(k => k.typ === "email").length; return EM.find(e => e.id === (langOf(l) === "en" ? ["erstkontakt", "erstkontakt2", "followup3"] : ["erstkontakt", "followup2", "followup3"])[Math.min(n, 2)]) || EM[0]; };
    const nextAccount = () => { const accs = S.accounts().filter(a => a.status !== "pausiert"), t = S.todayStats(S.leads()); const free = accs.filter(a => (t.mailsJeKonto[a.id] || 0) < S.warmupLimit(a)); if (!free.length) return null; free.sort((a, b) => (t.mailsJeKonto[a.id] || 0) - (t.mailsJeKonto[b.id] || 0)); return free[0]; };
    const signature = (acc, l) => "\n\n" + (acc?.signature || prof.signatur || [prof.firma, prof.inhaber, prof.adresse, prof.plz_ort, prof.telefon, prof.web].filter(Boolean).join(" · ")) + (langOf(l) === "en" ? "\nReply \"stop\" to opt out." : "");
    $$("[data-preview]", v).forEach(b => b.onclick = () => { const l = S.leads().find(x => x.id === b.dataset.preview), tpl = pick(l), acc = nextAccount(); openModal(`<h2 style="margin:0">${esc(tpl.titel)}</h2><p class="small muted">Von: ${esc(acc?.email || "kein Konto frei")} · An: ${esc(l.email)}</p><p><b>${esc(fill(tpl.betreff, l, st, prof))}</b></p><pre class="mail">${esc(fill(tpl.text, l, st, prof) + signature(acc, l))}</pre><button class="btn ghost" id="p-close">Schließen</button>`, c => $("#p-close", c).onclick = closeModal); });
    $$("[data-send]", v).forEach(b => b.onclick = () => { const leads = S.leads(), l = leads.find(x => x.id === b.dataset.send), tpl = pick(l), acc = nextAccount(); if (!acc) return toast("Kein Konto mit freiem Kontingent"); if (langOf(l) === "de" && !/einwilligung/i.test(l.notizen || "")) { if (!confirm("Deutscher Lead ohne dokumentierte Einwilligung. Kalt-E-Mail ist in DE unzulässig. Trotzdem öffnen?")) return; }
      window.open(`mailto:${encodeURIComponent(l.email)}?subject=${encodeURIComponent(fill(tpl.betreff, l, st, prof))}&body=${encodeURIComponent(fill(tpl.text, l, st, prof) + signature(acc, l))}`);
      l.kontakte = l.kontakte || []; l.kontakte.push({ ts: new Date().toISOString(), typ: "email", ergebnis: tpl.id, notiz: tpl.titel + " via " + acc.email, account: acc.id }); l.status = "in_arbeit"; const d = new Date(); d.setDate(d.getDate() + 7); l.naechster = d.toISOString().slice(0, 16); S.saveLeads(leads); render(); toast("Gezählt auf " + acc.email); });
  }

  // ---------- Konten ----------
  function viewKonten() {
    const accs = S.accounts(), t = S.todayStats(S.leads());
    return `<div class="row between"><h1>Gmail-Konten</h1><button class="btn" id="k-new">+ Konto</button></div>
      <div class="hint" style="margin-bottom:1rem">Jedes Konto sendet maximal sein Tageslimit (Standard 300). Google erlaubt 500/Tag (frei) bzw. 2.000/Tag (Workspace); für Zustellbarkeit sind 50–100 Kalt-Mails je Konto realistisch. Verbindung über Gmail-OAuth kommt mit Feature 2; bis dahin dienen die Konten der Verteilung und Zählung.</div>
      <div class="grid c3">${accs.map(a => `<div class="card"><div class="row between"><b>${esc(a.email)}</b><span class="badge ${a.status === "verbunden" ? "termin" : a.status === "pausiert" ? "kein_interesse" : ""}">${esc(a.status || "nicht verbunden")}</span></div><div class="small muted">${esc(a.name || "")}</div>
        <p class="small">Heute ${t.mailsJeKonto[a.id] || 0} / ${S.warmupLimit(a)} · Limit ${a.limit} · ${a.warmup ? "Warm-up seit " + fmt(a.start) : "kein Warm-up"}</p>
        <div class="row"><button class="btn sm ghost" data-edit="${a.id}">Bearbeiten</button><button class="btn sm ghost" data-toggle="${a.id}">${a.status === "pausiert" ? "Aktivieren" : "Pausieren"}</button><button class="btn sm ghost" disabled title="Feature 2">Mit Gmail verbinden</button></div></div>`).join("") || `<div class="card empty">Noch kein Konto.</div>`}</div>`;
  }
  function editAccount(id) {
    const accs = S.accounts(); const a = accs.find(x => x.id === id) || { id: null, limit: 300, warmup: true, start: S.today(), status: "nicht verbunden" };
    openModal(`<h2 style="margin:0">${a.id ? "Konto bearbeiten" : "Neues Gmail-Konto"}</h2>
      <label>E-Mail-Adresse</label><input id="a-email" value="${esc(a.email)}" placeholder="name@gmail.com"><label>Anzeigename</label><input id="a-name" value="${esc(a.name)}" placeholder="Anton von Alwine">
      <div class="grid c2"><div><label>Tageslimit</label><input id="a-limit" type="number" value="${a.limit}"></div><div><label>Warm-up ab</label><input id="a-start" type="date" value="${esc(a.start)}"></div></div>
      <label class="row" style="margin-top:.6rem"><input type="checkbox" id="a-warmup" ${a.warmup ? "checked" : ""} style="width:auto"> Warm-up (Tag 1 = 20 Mails, täglich +20 bis Limit)</label>
      <label>Signatur (leer = Profil-Signatur)</label><textarea id="a-sig">${esc(a.signature)}</textarea>
      <div class="row" style="margin-top:1rem"><button class="btn" id="a-save">Speichern</button>${a.id ? `<button class="btn danger sm" id="a-del">Löschen</button>` : ""}<button class="btn ghost" id="a-close">Schließen</button></div>`, c => {
      $("#a-save", c).onclick = () => { const o = { email: $("#a-email", c).value.trim(), name: $("#a-name", c).value.trim(), limit: +$("#a-limit", c).value || 300, start: $("#a-start", c).value, warmup: $("#a-warmup", c).checked, signature: $("#a-sig", c).value }; if (!o.email) return toast("E-Mail fehlt"); if (a.id) Object.assign(a, o); else accs.push(Object.assign({ id: S.uid(), status: "nicht verbunden" }, o)); S.saveAccounts(accs); closeModal(); render(); toast("Gespeichert"); };
      if (a.id) $("#a-del", c).onclick = () => { if (confirm("Konto löschen?")) { S.saveAccounts(accs.filter(x => x.id !== a.id)); closeModal(); render(); } };
      $("#a-close", c).onclick = closeModal;
    });
  }
  function bindKonten(v) {
    $("#k-new").onclick = () => editAccount(null);
    $$("[data-edit]", v).forEach(b => b.onclick = () => editAccount(b.dataset.edit));
    $$("[data-toggle]", v).forEach(b => b.onclick = () => { const accs = S.accounts(), a = accs.find(x => x.id === b.dataset.toggle); a.status = a.status === "pausiert" ? "nicht verbunden" : "pausiert"; S.saveAccounts(accs); render(); });
  }

  // ---------- Profil & Einstellungen ----------
  function viewProfil() {
    const p = S.profil();
    return `<h1>Persönliche Infos</h1><div class="card" style="max-width:640px">
      <div class="grid c2"><div><label>Firma</label><input id="p-firma" value="${esc(p.firma)}"></div><div><label>Inhaber / Ansprechpartner</label><input id="p-inhaber" value="${esc(p.inhaber)}"></div>
      <div><label>Straße</label><input id="p-adresse" value="${esc(p.adresse)}"></div><div><label>PLZ Ort</label><input id="p-plz" value="${esc(p.plz_ort)}"></div>
      <div><label>Telefon</label><input id="p-tel" value="${esc(p.telefon)}"></div><div><label>E-Mail (Antwortadresse)</label><input id="p-email" value="${esc(p.email)}"></div>
      <div><label>Webseite</label><input id="p-web" value="${esc(p.web)}"></div><div><label>USt-IdNr.</label><input id="p-ust" value="${esc(p.ust)}"></div></div>
      <label>Signatur für alle Mails (Pflicht: Postanschrift für CAN-SPAM, Impressumsangaben in DE)</label><textarea id="p-sig">${esc(p.signatur)}</textarea>
      <button class="btn" id="p-save" style="margin-top:1rem">Speichern</button></div>`;
  }
  function bindProfil() { $("#p-save").onclick = () => { const p = { firma: $("#p-firma").value, inhaber: $("#p-inhaber").value, adresse: $("#p-adresse").value, plz_ort: $("#p-plz").value, telefon: $("#p-tel").value, email: $("#p-email").value, web: $("#p-web").value, ust: $("#p-ust").value, signatur: $("#p-sig").value }; S.saveProfil(p); const st = S.settings(); if (!st.ich) st.ich = p.inhaber; if (!st.telefon) st.telefon = p.telefon; S.saveSettings(st); toast("Gespeichert"); }; }
  function viewEinstellungen() {
    const st = S.settings();
    return `<h1>Einstellungen</h1><div class="grid c2"><div class="card">
      <h3 style="margin-top:0">Tagesziele</h3><div class="grid c2"><div><label>Anrufe</label><input id="s-za" type="number" value="${st.zielAnrufe}"></div><div><label>Termine</label><input id="s-zt" type="number" value="${st.zielTermine}"></div><div><label>Mails</label><input id="s-zm" type="number" value="${st.zielMails}"></div><div><label>Neue Leads (Hot+Warm)</label><input id="s-zl" type="number" value="${st.zielLeads}"></div></div>
      <h3>Kanäle</h3><label>Deutschland / Österreich</label><select id="s-kde"><option value="anruf" ${st.kanalDe === "anruf" ? "selected" : ""}>Anrufen</option><option value="email" ${st.kanalDe === "email" ? "selected" : ""}>Anschreiben</option></select><label>Ausland</label><select id="s-kin"><option value="email" ${st.kanalIntl === "email" ? "selected" : ""}>Anschreiben, um Telefonat bitten</option><option value="anruf" ${st.kanalIntl === "anruf" ? "selected" : ""}>Anrufen</option></select>
      <h3>Mein Name / Telefon in Skripten</h3><input id="s-ich" value="${esc(st.ich)}" placeholder="Name"><input id="s-tel" value="${esc(st.telefon)}" placeholder="Telefon" style="margin-top:.4rem">
      <button class="btn" id="s-save" style="margin-top:1rem">Speichern</button></div>
      <div class="card"><h3 style="margin-top:0">Daten</h3><p class="small muted">Alle Daten liegen im Browser dieses Rechners (localStorage) und werden mit der Handy-App geteilt, wenn sie vom selben Server geladen wird. Backend mit Datenbank: plans/feature-1.</p>
      <div class="row wrap"><button class="btn ghost" id="s-backup">Backup (JSON)</button><button class="btn ghost" id="s-restore">Wiederherstellen</button><button class="btn ghost" id="s-auto">Automatische Leads laden</button><button class="btn soft" id="s-migrate" ${window.AlwineSync?.state.online ? "" : "disabled"}>Browser-Daten auf Server übertragen</button></div><p class="small muted">Server: ${window.AlwineSync?.state.online ? "🟢 verbunden, API ist führend" : "⚪ nicht erreichbar, Daten nur im Browser (Start: ./start.sh)"}</p><input type="file" id="s-file" hidden accept="application/json">
      <h3>Suchaufträge (Automatik)</h3><p class="small muted">Nächtliche Suche steuert <code>suchauftraege.json</code> (GitHub Action). Aktuell ${S.searches().length} lokale Suchaufträge in der Handy-App.</p>
      <h3>Pläne</h3><ul class="small"><li>Feature 0 Desktop-Shell – fertig</li><li>Feature 1 Server-Grundgerüst – offen</li><li>Feature 2 Mail-Center Gmail-API – offen</li><li>Feature 3 KI-Lead-Finder DE – offen</li><li>Feature 4 Anrufe + Report – offen</li></ul></div></div>`;
  }
  function bindEinstellungen() {
    $("#s-save").onclick = () => { const st = S.settings(); Object.assign(st, { zielAnrufe: +$("#s-za").value || 40, zielTermine: +$("#s-zt").value || 1, zielMails: +$("#s-zm").value || 15, zielLeads: +$("#s-zl").value || 30, kanalDe: $("#s-kde").value, kanalIntl: $("#s-kin").value, ich: $("#s-ich").value.trim(), telefon: $("#s-tel").value.trim() }); S.saveSettings(st); toast("Gespeichert"); };
    $("#s-backup").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify({ leads: S.leads(), settings: S.settings(), searches: S.searches(), accounts: S.accounts(), profil: S.profil() }, null, 2)], { type: "application/json" })); a.download = `alwine-backup-${S.today()}.json`; a.click(); };
    $("#s-restore").onclick = () => $("#s-file").click();
    $("#s-file").onchange = e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { const d = JSON.parse(rd.result); if (Array.isArray(d.leads)) S.saveLeads(d.leads); if (d.settings) S.saveSettings(d.settings); if (d.searches) S.saveSearches(d.searches); if (d.accounts) S.saveAccounts(d.accounts); if (d.profil) S.saveProfil(d.profil); render(); toast("Wiederhergestellt"); } catch { toast("Ungültige Datei"); } }; rd.readAsText(f); };
    $("#s-migrate").onclick = async () => { try { const r = await window.AlwineSync.migrateLocalToServer(); toast(`Übertragen: ${r.leads.created} neu, ${r.leads.updated} aktualisiert, ${r.accounts} Konten`); await window.AlwineSync.pull(); } catch (e) { toast("Fehler: " + e.message); } };
    $("#s-auto").onclick = async () => { try { const r = await fetch("../data/leads-auto.json?ts=" + Date.now(), { cache: "no-store" }); if (!r.ok) throw 0; const j = await r.json(); const leads = S.leads(); let n = 0; for (const x of j.leads || []) { if (leads.some(l => l.quelle === x.quelle || l.firma.toLowerCase() === (x.firma || "").toLowerCase())) continue; const sc = S.scoreLead(x); leads.unshift(Object.assign({ id: S.uid(), erstellt: new Date().toISOString(), kontakte: [], status: "neu", ansprechpartner: "", naechster: "", kanal: "" }, x, { score: sc.score, klasse: sc.klasse })); n++; } S.saveLeads(leads); toast(n + " neue Leads"); render(); } catch { toast("data/leads-auto.json nicht vorhanden"); } };
  }

  // ---------- Router ----------
  const views = { uebersicht: [viewUebersicht, null], leads: [viewLeads, bindLeads], mail: [viewMail, bindMail], konten: [viewKonten, bindKonten], profil: [viewProfil, bindProfil], einstellungen: [viewEinstellungen, bindEinstellungen] };
  function render() {
    const name = (location.hash.replace(/^#\/?/, "") || "uebersicht").split("/")[0];
    const [view, bind] = views[name] || views.uebersicht;
    const v = $("#view"); v.innerHTML = view();
    $$("#nav a").forEach(a => a.classList.toggle("active", a.dataset.route === name));
    bind && bind(v);
    const st = S.settings(), sy = window.AlwineSync?.state; $("#side-status").textContent = (st.ich ? st.ich + " · " : "") + S.leads().length + " Leads · " + S.accounts().length + " Konten · " + (sy?.online ? "🟢 Server" : "⚪ nur Browser");
  }
  window.addEventListener("hashchange", () => { closeModal(); render(); });
  window.addEventListener("alwine:synced", render);
  render();
})();
