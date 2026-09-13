// Lead-Finder: Firmen weltweit aus OpenStreetMap (kostenlos, ohne API-Key).
// Geocoding über Nominatim, Firmendaten über Overpass. Beide erlauben Browser-Zugriff (CORS).
window.ALWINE_SOURCES = (function () {
  const MARKETS = [
    { id: "de", name: "Deutschland", land: "Deutschland", sprache: "de", kanal: "anruf", cc: "DE", tel: "+49" },
    { id: "at", name: "Österreich", land: "Österreich", sprache: "de", kanal: "anruf", cc: "AT", tel: "+43" },
    { id: "ch", name: "Schweiz", land: "Schweiz", sprache: "de", kanal: "anruf", cc: "CH", tel: "+41" },
    { id: "us", name: "USA", land: "USA", sprache: "en", kanal: "email", cc: "US", tel: "+1" },
    { id: "ca", name: "Kanada", land: "Kanada", sprache: "en", kanal: "email", cc: "CA", tel: "+1" },
    { id: "uk", name: "Großbritannien", land: "United Kingdom", sprache: "en", kanal: "email", cc: "GB", tel: "+44" },
    { id: "ie", name: "Irland", land: "Ireland", sprache: "en", kanal: "email", cc: "IE", tel: "+353" },
    { id: "au", name: "Australien", land: "Australia", sprache: "en", kanal: "email", cc: "AU", tel: "+61" },
    { id: "nz", name: "Neuseeland", land: "New Zealand", sprache: "en", kanal: "email", cc: "NZ", tel: "+64" },
    { id: "intl", name: "Andere (Welt, Englisch)", land: "", sprache: "en", kanal: "email", cc: "", tel: "" }
  ];

  // Branche → OSM-Tags. Jede Zeile ein Overpass-Filter.
  const TAGS = {
    handwerk: ['["craft"~"electrician|plumber|carpenter|painter|hvac|roofer|tiler|joiner|metal_construction|window_construction|builder"]', '["shop"="hardware"]'],
    gastro: ['["amenity"~"restaurant|cafe|bar|pub|biergarten"]', '["tourism"~"hotel|guest_house"]'],
    praxis: ['["amenity"~"dentist|doctors|clinic"]', '["healthcare"~"physiotherapist|dentist|doctor|psychotherapist|alternative"]'],
    einzelhandel: ['["shop"~"clothes|shoes|jewelry|florist|bakery|butcher|furniture|bicycle|sports|books|gift|optician|pet|toys|garden_centre|interior_decoration"]'],
    immobilien: ['["office"~"estate_agent|property_management"]'],
    dienstleister: ['["office"~"lawyer|accountant|tax_advisor|consulting|architect|advertising_agency|financial_advisor|insurance|it|company"]'],
    autohaus: ['["shop"~"car|car_repair|car_parts|motorcycle|tyres"]']
  };

  const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
  const NOMINATIM = "https://nominatim.openstreetmap.org/search";

  async function geocode(ort, land) {
    const q = [ort, land].filter(Boolean).join(", ");
    const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!r.ok) throw new Error("Geocoding fehlgeschlagen (" + r.status + ")");
    const j = await r.json();
    if (!j.length) throw new Error("Ort nicht gefunden: " + q);
    const bb = j[0].boundingbox.map(Number); // [south, north, west, east]
    return { lat: +j[0].lat, lon: +j[0].lon, bbox: { s: bb[0], n: bb[1], w: bb[2], e: bb[3] }, name: j[0].display_name };
  }

  function bboxAround(lat, lon, km) {
    const dLat = km / 111, dLon = km / (111 * Math.cos(lat * Math.PI / 180));
    return { s: lat - dLat, n: lat + dLat, w: lon - dLon, e: lon + dLon };
  }

  function buildQuery(branche, bbox, limit) {
    const b = `${bbox.s},${bbox.w},${bbox.n},${bbox.e}`;
    const filters = (TAGS[branche] || TAGS.dienstleister).map(f => `nwr${f}["name"](${b});`).join("\n");
    return `[out:json][timeout:40];(\n${filters}\n);out tags center ${limit};`;
  }

  async function overpass(query) {
    let lastErr;
    for (const url of OVERPASS) {
      try {
        const r = await fetch(url, { method: "POST", body: "data=" + encodeURIComponent(query), headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        if (!r.ok) throw new Error("Overpass " + r.status);
        return await r.json();
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error("Overpass nicht erreichbar");
  }

  const pick = (t, ...keys) => { for (const k of keys) if (t[k]) return String(t[k]).split(";")[0].trim(); return ""; };
  function normalize(el, market, branche, ort) {
    const t = el.tags || {};
    const phone = pick(t, "phone", "contact:phone", "contact:mobile", "mobile");
    const website = pick(t, "website", "contact:website", "url");
    const email = pick(t, "email", "contact:email");
    const stadt = pick(t, "addr:city") || ort;
    const strasse = [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" ");
    const typ = pick(t, "craft", "amenity", "healthcare", "shop", "office", "tourism");
    const beobachtung = !website ? (market.sprache === "en" ? "No website listed – likely no or weak online presence" : "Keine Webseite hinterlegt – vermutlich kein oder schwacher Online-Auftritt")
      : !email ? (market.sprache === "en" ? "Website but no public email – check site on mobile" : "Webseite vorhanden, keine E-Mail – Seite auf dem Handy prüfen") : "";
    return {
      firma: t.name, telefon: phone, email, website, branche, markt: market.id, land: market.land, stadt, strasse,
      sprache: market.sprache, kanal: market.kanal, quelle: "osm:" + el.type + "/" + el.id, typ,
      notizen: [beobachtung, typ ? "Typ: " + typ : "", strasse ? "Adresse: " + strasse + ", " + stadt : ""].filter(Boolean).join("\n"),
      lat: el.lat ?? el.center?.lat, lon: el.lon ?? el.center?.lon
    };
  }

  // Hauptfunktion: findet Firmen für Branche + Ort + Markt. Liefert normalisierte Leads (noch nicht gespeichert).
  async function find({ marktId, ort, branche, radiusKm = 15, limit = 200, onStatus }) {
    const market = MARKETS.find(m => m.id === marktId) || MARKETS[0];
    onStatus && onStatus("Suche Ort …");
    const g = await geocode(ort, market.land);
    const bbox = radiusKm ? bboxAround(g.lat, g.lon, radiusKm) : g.bbox;
    onStatus && onStatus("Suche Firmen in " + g.name.split(",")[0] + " …");
    const data = await overpass(buildQuery(branche, bbox, limit));
    const seen = new Set();
    return (data.elements || []).map(el => normalize(el, market, branche, ort))
      .filter(l => l.firma && !seen.has(l.firma.toLowerCase()) && seen.add(l.firma.toLowerCase()));
  }

  return { MARKETS, TAGS, find, geocode, buildQuery, normalize };
})();
