const { z } = require("zod");
const str = (max = 500) => z.string().trim().max(max).default("");
const STATUS = ["neu", "in_arbeit", "rueckruf", "termin", "angebot", "kunde", "kein_interesse", "nicht_anrufen"];
const MARKETS = ["de", "at", "ch", "us", "ca", "uk", "ie", "au", "nz", "intl"];
module.exports = { z, str, STATUS, MARKETS };
