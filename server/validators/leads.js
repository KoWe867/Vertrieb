const { z, str, STATUS, MARKETS } = require("./common");

const leadBody = z.object({
  id: z.string().trim().min(1).max(64).optional(),
  firma: z.string().trim().min(1, "Firma fehlt").max(200),
  ansprechpartner: str(200), telefon: str(60), email: str(200), website: str(500), branche: str(40),
  markt: z.enum(MARKETS).default("de"), sprache: z.enum(["de", "en"]).optional(),
  kanal: z.enum(["", "anruf", "email"]).default(""), stadt: str(120),
  status: z.enum(STATUS).default("neu"), naechster: str(30), notizen: str(5000),
  quelle: str(120), score: z.coerce.number().int().min(0).max(100).default(0), klasse: z.enum(["", "hot", "warm", "cold", "unbekannt"]).default(""),
  lat: z.coerce.number().nullable().optional(), lon: z.coerce.number().nullable().optional(),
  erstellt: str(40), kontakte: z.array(z.any()).optional()
});
const leadUpdate = leadBody.partial().omit({ id: true, kontakte: true });
const leadQuery = z.object({
  status: z.enum(STATUS).optional(), markt: z.enum(MARKETS).optional(), klasse: z.enum(["hot", "warm", "cold", "unbekannt"]).optional(),
  kanal: z.enum(["anruf", "email"]).optional(), faellig: z.enum(["1", "true"]).optional(), q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(5000).default(1000)
});
const kontaktBody = z.object({
  typ: z.enum(["anruf", "email", "notiz"]), ergebnis: str(60), notiz: str(2000), account_id: z.string().trim().max(64).nullable().optional(),
  naechster: str(30).optional(), status: z.enum(STATUS).optional()
});
module.exports = { leadBody, leadUpdate, leadQuery, kontaktBody };
