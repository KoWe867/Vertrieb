const { sendSuccess } = require("../lib/apiResponse");
const systemController = ({ importService, reportService }) => ({
  ping: (req, res) => sendSuccess(res, { pong: true, version: require("../package.json").version }),
  import: (req, res) => sendSuccess(res, importService.run(req.valid), "Import abgeschlossen"),
  reportHeute: (req, res) => sendSuccess(res, reportService.heute(req.query.tag && /^\d{4}-\d{2}-\d{2}$/.test(req.query.tag) ? req.query.tag : undefined))
});
module.exports = { systemController };
