const { HttpError } = require("../lib/apiResponse");

// Ohne APP_TOKEN: nur Zugriffe von localhost erlaubt. Mit APP_TOKEN: Bearer-Token Pflicht.
function auth(config) {
  return (req, res, next) => {
    if (!config.appToken) {
      const ip = req.ip || req.socket.remoteAddress || "";
      const local = /^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/.test(ip);
      if (!local) return next(new HttpError(401, "Nur lokal erlaubt. APP_TOKEN in .env setzen für Fernzugriff."));
      return next();
    }
    const h = req.get("authorization") || "";
    if (h !== `Bearer ${config.appToken}`) return next(new HttpError(401, "Token fehlt oder ungültig"));
    next();
  };
}
module.exports = { auth };
