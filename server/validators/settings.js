const { z } = require("./common");
// Einstellungen sind ein flaches Objekt aus Strings/Zahlen/Booleans. Unbekannte Schlüssel erlaubt, aber keine Objekte.
const settingsBody = z.record(z.string().max(60), z.union([z.string().max(2000), z.number(), z.boolean()]));
module.exports = { settingsBody };
