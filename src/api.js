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
  .get('/', (req, res, next) => { res.redirect('/api-docs.json'); })

  /**
   * @swagger
   * /upcoming:
   *  get:
   *    description: Return a list of races for the next upcoming event
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: successfully processed spreadsheet
   */
  .get('/upcoming', (req, res, next) => {
    sheets.get_daily_schedule(res.locals.auth, 'Upcoming Matches')
      .then(
        (results) => { res.json(results); },
        (err) => { console.log(err); }
      );
  })

  /**
   * @swagger
   * /past:
   *  get:
   *    description: Return a list of races for all past events
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: successfully processed spreadsheet
   */
  .get('/past', (req, res, next) => {
    sheets.get_daily_schedule(res.locals.auth, 'Past Matches')
      .then(
        (results) => { res.json(results); },
        (err) => { console.log(err); }
      );
  })

;
