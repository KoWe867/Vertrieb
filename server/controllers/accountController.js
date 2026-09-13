const { sendSuccess } = require("../lib/apiResponse");
const { serializeAccount, serializeAccounts } = require("../serializers/accountSerializer");
const accountController = svc => ({
  list: (req, res) => sendSuccess(res, serializeAccounts(svc.list())),
  create: (req, res) => sendSuccess(res, serializeAccount(svc.create(req.valid)), "Konto angelegt", 201),
  update: (req, res) => sendSuccess(res, serializeAccount(svc.update(req.params.id, req.valid)), "Konto gespeichert"),
  remove: (req, res) => { svc.remove(req.params.id); sendSuccess(res, null, "Konto gelöscht"); }
});
module.exports = { accountController };
