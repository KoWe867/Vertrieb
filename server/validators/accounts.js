const { z, str } = require("./common");
const accountBody = z.object({
  id: z.string().trim().min(1).max(64).optional(),
  email: z.string().trim().email("Ungültige E-Mail").max(200),
  name: str(120), limit: z.coerce.number().int().min(1).max(2000).default(300),
  warmup: z.coerce.boolean().default(true), start: str(20),
  status: z.enum(["nicht verbunden", "verbunden", "pausiert"]).default("nicht verbunden"), signature: str(2000)
});
module.exports = { accountBody, accountUpdate: accountBody.partial().omit({ id: true }) };
