var debug = require('debug')('kuso:api')
  , express = require('express')
  , router = express.Router()

  , sheets = require('./sheets')
  ;

module.exports = router;

/*
 * All API routes prefixed by /api/v1/
 */
router
  /*
   * API Documentation
   */
  .get('/', function(req, res, next) {
    sheets.get_daily_schedule(res.locals.auth)
      .then((results) => {
        res.json(results);
      });
  })
;
