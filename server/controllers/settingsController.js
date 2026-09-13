const { sendSuccess } = require("../lib/apiResponse");
const settingsController = svc => ({
  get: (req, res) => sendSuccess(res, svc.get()),
  update: (req, res) => sendSuccess(res, svc.update(req.valid), "Einstellungen gespeichert")
});
module.exports = { settingsController };
