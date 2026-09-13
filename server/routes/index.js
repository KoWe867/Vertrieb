const express = require("express");
const { validate } = require("../middleware/errorHandler");
const { leadBody, leadUpdate, leadQuery, kontaktBody } = require("../validators/leads");
const { accountBody, accountUpdate } = require("../validators/accounts");
const { settingsBody } = require("../validators/settings");
const { importBody } = require("../validators/import");
const { z } = require("../validators/common");
const { leadController } = require("../controllers/leadController");
const { accountController } = require("../controllers/accountController");
const { settingsController } = require("../controllers/settingsController");
const { systemController } = require("../controllers/systemController");

const settingsUpdate = z.object({ settings: settingsBody.optional(), profil: settingsBody.optional(), searches: z.array(z.any()).optional() });

function buildRouter(services, authMw) {
  const r = express.Router();
  const leads = leadController(services.leadService), accounts = accountController(services.accountService),
        settings = settingsController(services.settingsService), system = systemController(services);
  r.get("/ping", system.ping);
  r.use(authMw);
  r.get("/leads", validate(leadQuery, "query"), leads.list);
  r.post("/leads", validate(leadBody), leads.create);
  r.get("/leads/:id", leads.get);
  r.put("/leads/:id", validate(leadUpdate), leads.update);
  r.delete("/leads/:id", leads.remove);
  r.post("/leads/:id/kontakte", validate(kontaktBody), leads.addKontakt);
  r.get("/accounts", accounts.list);
  r.post("/accounts", validate(accountBody), accounts.create);
  r.put("/accounts/:id", validate(accountUpdate), accounts.update);
  r.delete("/accounts/:id", accounts.remove);
  r.get("/settings", settings.get);
  r.put("/settings", validate(settingsUpdate), settings.update);
  r.post("/import", validate(importBody), system.import);
  r.get("/report/heute", system.reportHeute);
  return r;
}
module.exports = { buildRouter };
