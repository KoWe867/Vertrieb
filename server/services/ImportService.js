// Übernimmt ein Backup der App (⚙︎ → Backup) oder einen Sync-Stand der Oberflächen.
class ImportService {
  constructor(leadService, accountService, settingsService) { this.leads = leadService; this.accounts = accountService; this.settings = settingsService; }
  run(payload) {
    const leads = this.leads.importMany(payload.leads, payload.mode === "replace" && payload.replaceLeads ? "replace" : "merge");
    const accounts = this.accounts.importMany(payload.accounts, payload.mode === "replace" && payload.accounts.length !== undefined && payload.replaceAccounts ? "replace" : "merge");
    this.settings.update({ settings: payload.settings, profil: payload.profil, searches: payload.searches });
    return { leads, accounts };
  }
}
module.exports = { ImportService };
