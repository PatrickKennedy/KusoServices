const body_parser = require('body-parser')
    , express = require('express')
    , logger = require('morgan')

    , app = express()
    , api = require('./src/api')
    , auth = require('./src/auth')
    ;

module.exports = app;

app.use(logger('dev'));
app.use(body_parser.json());

// authentication
app.use(auth.check_auth);

// routes
app.get('/', (req, res) => {res.json({hello: "world"});});
app.use('/auth', auth.router);
app.use('/api/v1', api);

// error handling middleware
app.use(handle404);

if (app.get('env') === 'development')
  app.use(handleDevError);
else
  app.use(handleDevError);

/*
 * Page-not-found middleware
 * catch 404 and forward to error handler
 */
function handle404(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}

/*
 * Development error handler
 * Will print stacktrace
 */
function handleDevError(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    meta: { message: err.message, },
    data: {},
    error: err.stack,
  });
}

/*
 * Production error handler
 * No stacktraces leaked to user
 */
function handleError(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    meta: { message: err.message, },
    data: {},
    error: {}
  });
}
