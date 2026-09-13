const path = require("node:path");
const dotenv = require("dotenv");

const ROOT = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(ROOT, ".env"), quiet: true });
dotenv.config({ path: path.join(__dirname, "..", ".env"), quiet: true });

module.exports = {
  ROOT,
  port: Number(process.env.PORT) || 3000,
  appToken: process.env.APP_TOKEN || "",
  dbPath: path.resolve(ROOT, process.env.DB_PATH || "data/alwine.db"),
  anthropicModel: process.env.ANTHROPIC_MODEL || "claude-sonnet-5"
};
