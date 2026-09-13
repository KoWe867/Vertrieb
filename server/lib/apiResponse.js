// Einzige Antwortform der API. Controller benutzen nur diese beiden Funktionen.
function sendSuccess(res, data, message = "OK", code = 200) {
  return res.status(code).json({ success: true, message, data });
}
function sendError(res, message, code = 400, errors = null) {
  return res.status(code).json({ success: false, message, errors });
}
class HttpError extends Error {
  constructor(code, message, errors = null) { super(message); this.code = code; this.errors = errors; }
}
module.exports = { sendSuccess, sendError, HttpError };
