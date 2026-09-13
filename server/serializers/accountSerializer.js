// oauth_json bleibt IMMER im Server.
function serializeAccount(r) {
  if (!r) return null;
  return { id: r.id, email: r.email, name: r.name, limit: r.limit_tag, warmup: !!r.warmup, start: r.start, status: r.status, signature: r.signature, verbunden: !!r.oauth_json };
}
module.exports = { serializeAccount, serializeAccounts: rows => rows.map(serializeAccount) };
