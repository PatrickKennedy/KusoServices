const debug = require('debug')('kuso:server')
    , http = require('http')
    , app = require('./app')
    , config = require('./config')
    ;

startExpress();

function startExpress() {
  app.set('port', process.env.PORT || config.express.port || '3000');

  server = http.createServer(app)
    .listen(app.get('port'))
    .on('error', onError)
    .on('listening', onListening)
  ;
}

/*
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe '+ port : 'Port '+ port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/*
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe '+ addr : 'port '+ addr.port;
  debug('Listening on ' + bind);
}
