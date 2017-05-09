const debug = require('debug')('kuso:index')
    , fs = require('fs')

    , express = require('express')
    , google = require('googleapis')
    , GoogleAuth = require('google-auth-library')

    , config = require('../config')
    , router = express.Router()

    // If modifying these scopes, delete your previously saved credentials
    // at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
    , SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
    , TOKEN_DIR = (
        process.env.HOME ||
        process.env.USERPROFILE ||
        process.env.HOMEPATH
      ) + '/.credentials/'
    , TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json'
    ;

exports.check_auth = (req, res, next) => {
  let clientSecret = config.google_apis.client_secret
    , clientId = config.google_apis.client_id
    , redirectUrl = config.google_apis.redirect_uris[0]
    , auth = new GoogleAuth()
    , oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)
    ;

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    res.locals.auth = oauth2Client;
    if (req.path == "/auth")
      return next();

    if (err)
      return res.redirect("/auth");

    oauth2Client.credentials = JSON.parse(token);
    next();
  });
};

exports.router = router;
router.route('/')
  .get((req, res, next) => {
    let auth_url = res.locals.auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    res.json({
      meta: {
        status: 'success',
        message: "Please visit the auth_url to retrieve an auth code"
      },
      data: {
        auth_url: auth_url,
      }
    });
  })
  .post((req, res, next) => {
    let handle_token = (err, token) => {
      if (err)
        return res.status(500)
          .json({
            meta: {
              status: 'error',
              message: "Error while trying to retrieve access token",
            },
            error: err
          });

      store_token(token);
      res.json({
        meta: {
          status: 'success',
          message: "Token cached on file system",
        },
      });
    };

    res.locals.auth.getToken(req.body.code, handle_token);
  });

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function store_token(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  debug('Token stored to ' + TOKEN_PATH);
}