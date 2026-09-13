// Formt DB-Zeilen in die Form, die die Oberflächen kennen (identisch zum localStorage-Modell).
function serializeLead(r) {
  if (!r) return null;
  return {
    id: r.id, firma: r.firma, ansprechpartner: r.ansprechpartner, telefon: r.telefon, email: r.email, website: r.website,
    branche: r.branche, markt: r.markt, sprache: r.sprache, kanal: r.kanal, stadt: r.stadt, status: r.status, naechster: r.naechster,
    notizen: r.notizen, quelle: r.quelle || "", score: r.score, klasse: r.klasse, lat: r.lat, lon: r.lon, erstellt: r.erstellt, aktualisiert: r.aktualisiert,
    kontakte: (r.kontakte || []).map(k => ({ ts: k.ts, typ: k.typ, ergebnis: k.ergebnis, notiz: k.notiz, account: k.account || null }))
  };
}
module.exports = { serializeLead, serializeLeads: rows => rows.map(serializeLead) };
