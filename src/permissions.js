let auth = require('./auth');

exports.protected = [auth.init_auth_client, auth.check_auth];
exports.unprotected = [];