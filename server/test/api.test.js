const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../app");

const app = () => createApp({ dbFile: ":memory:", config: { appToken: "" } });

test("ping antwortet in apiResponse-Form", async () => {
  const r = await request(app()).get("/api/ping");
  assert.equal(r.status, 200); assert.equal(r.body.success, true); assert.equal(r.body.data.pong, true);
});
test("unbekannte API-Route liefert JSON-404", async () => {
  const r = await request(app()).get("/api/gibtsnicht");
  assert.equal(r.status, 404); assert.equal(r.body.success, false); assert.equal(r.headers["content-type"].includes("json"), true);
});
test("Validierung liefert 422 mit errors", async () => {
  const r = await request(app()).post("/api/leads").send({ firma: "" });
  assert.equal(r.status, 422); assert.equal(r.body.success, false); assert.ok(Array.isArray(r.body.errors)); assert.equal(r.body.errors[0].path, "firma");
});
test("Token-Schutz greift, wenn APP_TOKEN gesetzt", async () => {
  const a = createApp({ dbFile: ":memory:", config: { appToken: "geheim" } });
  assert.equal((await request(a).get("/api/leads")).status, 401);
  assert.equal((await request(a).get("/api/leads").set("Authorization", "Bearer geheim")).status, 200);
});
test("Lead anlegen, lesen, Kontakt loggen, Regeln greifen", async () => {
  const a = app();
  const c = await request(a).post("/api/leads").send({ firma: "Elektro Krause", telefon: "+49 341 1", markt: "de", stadt: "Leipzig", quelle: "osm:node/1" });
  assert.equal(c.status, 201); const id = c.body.data.id; assert.equal(c.body.data.sprache, "de");
  assert.equal((await request(a).post("/api/leads").send({ firma: "Elektro Krause", stadt: "Leipzig" })).status, 409);
  const k = await request(a).post(`/api/leads/${id}/kontakte`).send({ typ: "anruf", ergebnis: "termin", status: "termin", naechster: "2026-09-15T10:00", notiz: "Videocall" });
  assert.equal(k.status, 201); assert.equal(k.body.data.status, "termin"); assert.equal(k.body.data.kontakte.length, 1);
  const us = await request(a).post("/api/leads").send({ firma: "Austin Roofing", markt: "us", email: "a@b.co" });
  assert.equal(us.body.data.sprache, "en");
  for (let i = 0; i < 3; i++) await request(a).post(`/api/leads/${us.body.data.id}/kontakte`).send({ typ: "email", ergebnis: "erstkontakt" });
  assert.equal((await request(a).get(`/api/leads/${us.body.data.id}`)).body.data.status, "kein_interesse");
  const list = await request(a).get("/api/leads?status=termin");
  assert.equal(list.body.data.length, 1); assert.equal(list.body.data[0].firma, "Elektro Krause");
  const del = await request(a).delete(`/api/leads/${id}`); assert.equal(del.status, 200);
  assert.equal((await request(a).get(`/api/leads/${id}`)).status, 404);
});
test("Import eines App-Backups: merge und replace, Konten ohne Tokens", async () => {
  const a = app();
  const backup = { leads: [{ id: "l1", firma: "A GmbH", stadt: "Berlin", kontakte: [{ ts: "2026-09-13T08:00:00.000Z", typ: "anruf", ergebnis: "mailbox", notiz: "" }] }, { id: "l2", firma: "B GmbH", stadt: "Hamburg" }],
    accounts: [{ id: "k1", email: "v1@gmail.com", name: "Anton", limit: 300, warmup: true, start: "2026-09-13" }], settings: { ich: "Anton", zielAnrufe: 40 }, profil: { firma: "Alwine" } };
  const r = await request(a).post("/api/import").send(backup);
  assert.equal(r.status, 200); assert.equal(r.body.data.leads.created, 2); assert.equal(r.body.data.accounts, 1);
  const again = await request(a).post("/api/import").send({ leads: [{ id: "l1", firma: "A GmbH", stadt: "Berlin", status: "kunde" }, { firma: "C GmbH" }], mode: "replace" });
  assert.equal(again.body.data.leads.updated, 1); assert.equal(again.body.data.leads.created, 1); assert.equal(again.body.data.leads.total, 2);
  const acc = await request(a).get("/api/accounts");
  assert.equal(acc.body.data[0].email, "v1@gmail.com"); assert.equal("oauth_json" in acc.body.data[0], false); assert.equal(acc.body.data[0].verbunden, false);
  const s = await request(a).get("/api/settings"); assert.equal(s.body.data.settings.ich, "Anton"); assert.equal(s.body.data.profil.firma, "Alwine");
});
test("Report heute zählt Anrufe, Mails je Konto, Kontingent mit Warm-up", async () => {
  const a = app();
  const acc = await request(a).post("/api/accounts").send({ email: "v1@gmail.com", limit: 300, warmup: true, start: new Date().toISOString().slice(0, 10) });
  const l = await request(a).post("/api/leads").send({ firma: "X", markt: "us", email: "x@y.co" });
  await request(a).post(`/api/leads/${l.body.data.id}/kontakte`).send({ typ: "email", ergebnis: "erstkontakt", account_id: acc.body.data.id });
  await request(a).post(`/api/leads/${l.body.data.id}/kontakte`).send({ typ: "notiz", ergebnis: "notiz", notiz: "Antwort erhalten" });
  const r = await request(a).get("/api/report/heute");
  assert.equal(r.body.data.mails, 1); assert.equal(r.body.data.antworten, 1); assert.equal(r.body.data.neueLeads, 1);
  assert.equal(r.body.data.konten[0].limit, 20); assert.equal(r.body.data.kontingent, 19);
});
test("Ungültiges JSON liefert 400 in apiResponse-Form", async () => {
  const r = await request(app()).post("/api/leads").set("Content-Type", "application/json").send("{oops");
  assert.equal(r.status, 400); assert.equal(r.body.success, false);
});
