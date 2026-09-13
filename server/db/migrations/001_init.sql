CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  firma TEXT NOT NULL,
  ansprechpartner TEXT NOT NULL DEFAULT '',
  telefon TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  branche TEXT NOT NULL DEFAULT '',
  markt TEXT NOT NULL DEFAULT 'de',
  sprache TEXT NOT NULL DEFAULT 'de',
  kanal TEXT NOT NULL DEFAULT '',
  stadt TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'neu',
  naechster TEXT NOT NULL DEFAULT '',
  notizen TEXT NOT NULL DEFAULT '',
  quelle TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  klasse TEXT NOT NULL DEFAULT '',
  lat REAL,
  lon REAL,
  erstellt TEXT NOT NULL,
  aktualisiert TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_leads_quelle ON leads(quelle) WHERE quelle IS NOT NULL AND quelle <> '' AND quelle <> 'csv';
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_naechster ON leads(naechster);
CREATE INDEX idx_leads_markt ON leads(markt);

CREATE TABLE kontakte (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  ts TEXT NOT NULL,
  typ TEXT NOT NULL,
  ergebnis TEXT NOT NULL DEFAULT '',
  notiz TEXT NOT NULL DEFAULT '',
  account_id TEXT
);
CREATE INDEX idx_kontakte_lead ON kontakte(lead_id);
CREATE INDEX idx_kontakte_ts ON kontakte(ts);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  limit_tag INTEGER NOT NULL DEFAULT 300,
  warmup INTEGER NOT NULL DEFAULT 1,
  start TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'nicht verbunden',
  signature TEXT NOT NULL DEFAULT '',
  oauth_json TEXT
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
