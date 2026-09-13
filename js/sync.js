/* Sync-Schicht: Wenn der lokale Server (server/) läuft, sind die API-Daten führend.
   Beim Start werden Leads, Konten und Einstellungen in den localStorage gespiegelt; jede Änderung
   wird verzögert zurückgeschrieben. Ohne Server bleibt alles im Browser wie bisher. */
window.AlwineSync = (function () {
  const K = { leads: "alwine.leads.v1", settings: "alwine.settings.v1", searches: "alwine.searches.v1", accounts: "alwine.accounts.v1", profil: "alwine.profil.v1" };
  const base = (document.querySelector('meta[name="alwine-api"]')?.content || (location.pathname.includes("/desktop/") ? "../api" : "api"));
  const token = (() => { try { const t = new URLSearchParams(location.search).get("token"); if (t) localStorage.setItem("alwine.token", t); return localStorage.getItem("alwine.token") || ""; } catch { return ""; } })();
  const headers = () => Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: "Bearer " + token } : {});
  const state = { online: false, lastError: "", pulled: false };
  const timers = {};
  let pausePush = false;

  async function api(method, path, body) {
    const r = await fetch(base + path, { method, headers: headers(), body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.success === false) throw new Error(j.message || ("HTTP " + r.status));
    return j.data;
  }
  async function pull() {
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 2000);
      const p = await fetch(base + "/ping", { signal: ctrl.signal }).then(r => r.json()).catch(() => null); clearTimeout(t);
      if (!p?.success) { state.online = false; return false; }
      const [leads, accounts, s] = await Promise.all([api("GET", "/leads?limit=5000"), api("GET", "/accounts"), api("GET", "/settings")]);
      pausePush = true;
      localStorage.setItem(K.leads, JSON.stringify(leads));
      localStorage.setItem(K.accounts, JSON.stringify(accounts));
      if (s.settings && Object.keys(s.settings).length) localStorage.setItem(K.settings, JSON.stringify(s.settings));
      if (s.profil && Object.keys(s.profil).length) localStorage.setItem(K.profil, JSON.stringify(s.profil));
      if (Array.isArray(s.searches)) localStorage.setItem(K.searches, JSON.stringify(s.searches));
      pausePush = false;
      state.online = true; state.pulled = true; state.lastError = "";
      window.dispatchEvent(new CustomEvent("alwine:synced", { detail: { leads: leads.length, accounts: accounts.length } }));
      return true;
    } catch (e) { pausePush = false; state.online = false; state.lastError = e.message; return false; }
  }
  // Wird von den Speicherfunktionen der Oberflächen aufgerufen. Verzögert, damit Tipp-Eingaben nicht jede Taste senden.
  function push(key, value) {
    if (!state.online || pausePush) return;
    clearTimeout(timers[key]);
    timers[key] = setTimeout(async () => {
      try {
        if (key === K.leads) await api("POST", "/import", { leads: value, mode: "replace", replaceLeads: true });
        else if (key === K.accounts) await api("POST", "/import", { accounts: value, mode: "replace", replaceAccounts: true, replaceLeads: false });
        else if (key === K.settings) await api("PUT", "/settings", { settings: value });
        else if (key === K.profil) await api("PUT", "/settings", { profil: value });
        else if (key === K.searches) await api("PUT", "/settings", { searches: value });
        state.lastError = "";
      } catch (e) { state.lastError = e.message; console.warn("Sync fehlgeschlagen:", e.message); }
    }, 700);
  }
  // Einmal-Migration: bestehende Browser-Daten auf einen leeren Server übertragen.
  async function migrateLocalToServer() {
    const get = k => { try { return JSON.parse(localStorage.getItem(k)) || undefined; } catch { return undefined; } };
    return api("POST", "/import", { leads: get(K.leads) || [], accounts: get(K.accounts) || [], settings: get(K.settings), profil: get(K.profil), searches: get(K.searches), mode: "merge" });
  }
  const ready = pull();
  return { state, api, pull, push, ready, migrateLocalToServer, K };
})();
