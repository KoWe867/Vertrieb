class SettingsService {
  constructor(repo) { this.repo = repo; }
  get() { return { settings: this.repo.getAll("settings."), profil: this.repo.getAll("profil."), searches: this.repo.getAll("misc.").searches || [] }; }
  update({ settings, profil, searches }) {
    if (settings) this.repo.setMany(settings, "settings.");
    if (profil) this.repo.setMany(profil, "profil.");
    if (searches) this.repo.setMany({ searches }, "misc.");
    return this.get();
  }
}
module.exports = { SettingsService };
