let debug   = require('debug')('kuso:api')
  , express = require('express')
  , router  = express.Router()

  , sheets  = require('./sheets')
  , perms   = require('./permissions')
  ;

module.exports = router;

/*
 * All API routes prefixed by /api/v1/
 */
router
  /*
   * API Documentation
   */
  .get('/', perms.unprotected, (req, res, next) => { res.redirect('/api-docs.json'); })

  /**
   * @swagger
   * /api/v1/upcoming:
   *  get:
   *    description: Return a list of races for the next upcoming event
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: successfully processed spreadsheet
   */
  .get('/upcoming', perms.protected, (req, res, next) => {
    sheets.get_daily_schedule(res.locals.auth, 'Upcoming Matches')
      .then(
        (results) => { res.json(results); },
        (err) => { console.log(err); }
      );
  })

  /**
   * @swagger
   * /api/v1/past:
   *  get:
   *    description: Return a list of races for all past events
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: successfully processed spreadsheet
   */
  .get('/past', perms.protected, (req, res, next) => {
    sheets.get_daily_schedule(res.locals.auth, 'Past Matches')
      .then(
        (results) => { res.json(results); },
        (err) => { console.log(err); }
      );
  })

;
