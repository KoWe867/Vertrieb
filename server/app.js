const express = require("express");
const path = require("node:path");
const { openDb } = require("./lib/db");
const { auth } = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { buildRouter } = require("./routes");
const { LeadRepo } = require("./repositories/leadRepo");
const { AccountRepo } = require("./repositories/accountRepo");
const { SettingsRepo } = require("./repositories/settingsRepo");
const { LeadService } = require("./services/LeadService");
const { AccountService } = require("./services/AccountService");
const { SettingsService } = require("./services/SettingsService");
const { ImportService } = require("./services/ImportService");
const { ReportService } = require("./services/ReportService");

// Baut die App. dbFile ":memory:" für Tests. Statische Dateien: Repo-Root (Handy-App unter /, Desktop unter /desktop/).
function createApp({ dbFile = ":memory:", config = {}, staticRoot = null } = {}) {
  const db = openDb(dbFile);
  const leadRepo = new LeadRepo(db), accountRepo = new AccountRepo(db), settingsRepo = new SettingsRepo(db);
  const leadService = new LeadService(leadRepo), accountService = new AccountService(accountRepo), settingsService = new SettingsService(settingsRepo);
  const services = { leadService, accountService, settingsService, importService: new ImportService(leadService, accountService, settingsService), reportService: new ReportService(leadRepo, accountRepo) };

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", false);
  app.use(express.json({ limit: "20mb" }));
  app.use("/api", buildRouter(services, auth(config)));
  app.use("/api", notFound);
  if (staticRoot) app.use(express.static(staticRoot, { extensions: ["html"], index: "index.html" }));
  app.use(errorHandler);
  app.locals.db = db; app.locals.services = services;
  return app;
}
module.exports = { createApp };
