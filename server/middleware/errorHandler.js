const { sendError, HttpError } = require("../lib/apiResponse");
const { ZodError } = require("zod");

function notFound(req, res) { sendError(res, `Route ${req.method} ${req.path} nicht gefunden`, 404); }

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) return sendError(res, "Validierung fehlgeschlagen", 422, err.issues.map(i => ({ path: i.path.join("."), message: i.message })));
  if (err instanceof HttpError) return sendError(res, err.message, err.code, err.errors);
  if (err.type === "entity.parse.failed") return sendError(res, "Ungültiges JSON", 400);
  if (err.type === "entity.too.large") return sendError(res, "Anfrage zu groß", 413);
  console.error(err);
  return sendError(res, "Interner Fehler", 500);
}
// Validator-Helfer: Schema anwenden, validierte Daten unter req.valid ablegen.
const validate = (schema, source = "body") => (req, res, next) => {
  try { req.valid = schema.parse(req[source]); next(); } catch (e) { next(e); }
};
module.exports = { notFound, errorHandler, validate };
