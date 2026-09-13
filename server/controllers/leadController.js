const { sendSuccess } = require("../lib/apiResponse");
const { serializeLead, serializeLeads } = require("../serializers/leadSerializer");
const leadController = svc => ({
  list: (req, res) => sendSuccess(res, serializeLeads(svc.list(req.valid))),
  get: (req, res) => sendSuccess(res, serializeLead(svc.get(req.params.id))),
  create: (req, res) => sendSuccess(res, serializeLead(svc.create(req.valid)), "Lead angelegt", 201),
  update: (req, res) => sendSuccess(res, serializeLead(svc.update(req.params.id, req.valid)), "Lead gespeichert"),
  remove: (req, res) => { svc.remove(req.params.id); sendSuccess(res, null, "Lead gelöscht"); },
  addKontakt: (req, res) => sendSuccess(res, serializeLead(svc.addKontakt(req.params.id, req.valid)), "Kontakt geloggt", 201)
});
module.exports = { leadController };
