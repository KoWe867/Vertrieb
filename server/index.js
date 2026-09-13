const config = require("./lib/config");
const { createApp } = require("./app");

const app = createApp({ dbFile: config.dbPath, config, staticRoot: config.ROOT });
app.listen(config.port, "127.0.0.1", () => {
  console.log(`Alwine Vertrieb: http://localhost:${config.port}/desktop/  (Handy-App: http://localhost:${config.port}/, API: /api/ping)`);
  console.log(`Datenbank: ${config.dbPath}${config.appToken ? "" : "  · Zugriff nur von localhost (APP_TOKEN leer)"}`);
});
