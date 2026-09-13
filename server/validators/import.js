const { z } = require("./common");
const { leadBody } = require("./leads");
const { accountBody } = require("./accounts");
const { settingsBody } = require("./settings");
const importBody = z.object({
  leads: z.array(leadBody).default([]),
  accounts: z.array(accountBody).default([]),
  settings: settingsBody.optional(),
  profil: settingsBody.optional(),
  searches: z.array(z.any()).optional(),
  mode: z.enum(["merge", "replace"]).default("merge"),
  replaceAccounts: z.boolean().default(false),
  replaceLeads: z.boolean().default(true)
});
module.exports = { importBody };
