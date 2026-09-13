#!/usr/bin/env python3
"""Nächtliche automatische Lead-Suche.

Liest suchauftraege.json, fragt OpenStreetMap (Nominatim + Overpass) ab und schreibt
neue Firmen nach data/leads-auto.json. Bereits bekannte Firmen (data/leads-seen.json)
werden übersprungen, so dass jede Nacht nur wirklich neue Leads dazukommen.
Die App importiert die Datei über „Heute → Automatische Leads laden“.

Keine Abhängigkeiten außer der Python-Standardbibliothek.
"""
import json, math, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = "AlwineVertrieb/1.0 (lead research; github.com/KoWe867/Vertrieb)"
NOMINATIM = "https://nominatim.openstreetmap.org/search"
OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"]

MARKETS = {
    "de": ("Deutschland", "de", "DE"), "at": ("Österreich", "de", "AT"), "ch": ("Schweiz", "de", "CH"),
    "us": ("USA", "en", "US"), "ca": ("Kanada", "en", "CA"), "uk": ("United Kingdom", "en", "GB"),
    "ie": ("Ireland", "en", "IE"), "au": ("Australia", "en", "AU"), "nz": ("New Zealand", "en", "NZ"), "intl": ("", "en", ""),
}
TAGS = {
    "handwerk": ['["craft"~"electrician|plumber|carpenter|painter|hvac|roofer|tiler|joiner|metal_construction|window_construction|builder"]', '["shop"="hardware"]'],
    "gastro": ['["amenity"~"restaurant|cafe|bar|pub|biergarten"]', '["tourism"~"hotel|guest_house"]'],
    "praxis": ['["amenity"~"dentist|doctors|clinic"]', '["healthcare"~"physiotherapist|dentist|doctor|psychotherapist|alternative"]'],
    "einzelhandel": ['["shop"~"clothes|shoes|jewelry|florist|bakery|butcher|furniture|bicycle|sports|books|gift|optician|pet|toys|garden_centre|interior_decoration"]'],
    "immobilien": ['["office"~"estate_agent|property_management"]'],
    "dienstleister": ['["office"~"lawyer|accountant|tax_advisor|consulting|architect|advertising_agency|financial_advisor|insurance|it|company"]'],
    "autohaus": ['["shop"~"car|car_repair|car_parts|motorcycle|tyres"]'],
}


def http(url, data=None, timeout=60):
    req = urllib.request.Request(url, data=data, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def geocode(ort, land):
    q = ", ".join(x for x in (ort, land) if x)
    j = http(f"{NOMINATIM}?format=json&limit=1&q={urllib.parse.quote(q)}")
    if not j:
        raise RuntimeError(f"Ort nicht gefunden: {q}")
    return float(j[0]["lat"]), float(j[0]["lon"])


def bbox(lat, lon, km):
    dlat = km / 111.0
    dlon = km / (111.0 * math.cos(math.radians(lat)))
    return lat - dlat, lon - dlon, lat + dlat, lon + dlon


def overpass(branche, bb, limit):
    b = ",".join(f"{x:.5f}" for x in bb)
    filters = "\n".join(f'nwr{f}["name"]({b});' for f in TAGS.get(branche, TAGS["dienstleister"]))
    q = f"[out:json][timeout:60];(\n{filters}\n);out tags center {limit};"
    last = None
    for url in OVERPASS:
        try:
            return http(url, data=("data=" + urllib.parse.quote(q)).encode(), timeout=90)
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(3)
    raise RuntimeError(f"Overpass nicht erreichbar: {last}")


def pick(t, *keys):
    for k in keys:
        if t.get(k):
            return str(t[k]).split(";")[0].strip()
    return ""


def normalize(el, markt, branche, ort):
    t = el.get("tags", {})
    land, sprache, _ = MARKETS[markt]
    website = pick(t, "website", "contact:website", "url")
    email = pick(t, "email", "contact:email")
    stadt = pick(t, "addr:city") or ort
    strasse = " ".join(x for x in (t.get("addr:street"), t.get("addr:housenumber")) if x)
    typ = pick(t, "craft", "amenity", "healthcare", "shop", "office", "tourism")
    if not website:
        beob = "No website listed – likely no or weak online presence" if sprache == "en" else "Keine Webseite hinterlegt – vermutlich kein oder schwacher Online-Auftritt"
    elif not email:
        beob = "Website but no public email – check site on mobile" if sprache == "en" else "Webseite vorhanden, keine E-Mail – Seite auf dem Handy prüfen"
    else:
        beob = ""
    start = pick(t, "start_date", "opening_date")
    neu = False
    if start:
        try:
            y, m, d = (start.split("-") + ["06", "15"])[:3]
            neu = (datetime.now(timezone.utc) - datetime(int(y), int(m), int(d), tzinfo=timezone.utc)).days < 366
        except ValueError:
            neu = False
    if neu:
        beob = "\n".join(x for x in (beob, ("New opening" if sprache == "en" else "Neueröffnung") + f" (start_date {start})") if x)
    center = el.get("center", {})
    return {
        "firma": t.get("name", ""), "telefon": pick(t, "phone", "contact:phone", "contact:mobile", "mobile"),
        "email": email, "website": website, "branche": branche, "markt": markt, "land": land, "stadt": stadt,
        "sprache": sprache, "quelle": f"osm:{el['type']}/{el['id']}", "typ": typ, "neu": neu,
        "notizen": "\n".join(x for x in (beob, f"Typ: {typ}" if typ else "", f"Adresse: {strasse}, {stadt}" if strasse else "") if x),
        "lat": el.get("lat", center.get("lat")), "lon": el.get("lon", center.get("lon")),
    }


def main():
    cfg = json.loads((ROOT / "suchauftraege.json").read_text("utf-8"))
    seen_path = ROOT / "data" / "leads-seen.json"
    out_path = ROOT / "data" / "leads-auto.json"
    seen = set(json.loads(seen_path.read_text("utf-8"))) if seen_path.exists() else set()
    previous = json.loads(out_path.read_text("utf-8"))["leads"] if out_path.exists() else []
    new_leads, log = [], []
    for a in cfg["auftraege"]:
        markt, ort, branche = a["markt"], a["ort"], a["branche"]
        try:
            lat, lon = geocode(ort, MARKETS[markt][0])
            time.sleep(1.2)  # Nominatim: max. 1 Anfrage/Sekunde
            data = overpass(branche, bbox(lat, lon, a.get("radius_km", 15)), 400)
            found = 0
            for el in data.get("elements", []):
                l = normalize(el, markt, branche, ort)
                if not l["firma"] or l["quelle"] in seen or not (l["telefon"] or l["email"]):
                    continue
                seen.add(l["quelle"]); new_leads.append(l); found += 1
                if found >= a.get("max", 15):
                    break
            log.append(f"{markt} {ort} {branche}: {found} neu")
            time.sleep(2)
        except Exception as e:  # noqa: BLE001
            log.append(f"{markt} {ort} {branche}: FEHLER {e}")
    # Leads der letzten 14 Tage behalten, damit die App sie noch abholen kann
    cutoff = datetime.now(timezone.utc).timestamp() - 14 * 86400
    keep = [l for l in previous if l.get("_ts", 0) > cutoff]
    ts = datetime.now(timezone.utc).timestamp()
    for l in new_leads:
        l["_ts"] = ts
    out = {"generated": datetime.now(timezone.utc).isoformat(), "log": log, "leads": keep + new_leads}
    (ROOT / "data").mkdir(exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=1), "utf-8")
    seen_path.write_text(json.dumps(sorted(seen)), "utf-8")
    print("\n".join(log)); print(f"{len(new_leads)} neue Leads, {len(out['leads'])} insgesamt in {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
