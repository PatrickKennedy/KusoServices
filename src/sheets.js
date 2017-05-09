const debug = require('debug')('kuso:sheets')
    , google = require('googleapis')
    , moment = require('moment-timezone')

    , config = require('../config')
    ;

/**
 * Gather and format the scheduled events
 * https://docs.google.com/spreadsheets/d/1fLV92M8zCoGlQUb_bzPZO2tAJul1X9S4onLcnUq3d2M/edit
 *
 * @param {google.auth.OAuth2} auth - A pre-credentialed oauth client
 * @param {String} book - The name of the book in the spreadsheet
 * @param {String} range - The range of columns to load
 * @returns {Array} - An array of event Objects
 *
 */
exports.get_daily_schedule = (auth, book, range) => {
  book = (typeof book === "undefined") ? config.schedule.book : book;
  range = (typeof range === "undefined") ? 'A:J' : range;

  let sheets = google.sheets('v4')
    , options = {
      auth: auth,
      spreadsheetId: config.schedule.sheet_id,
      range: `${book}!${range}`,
    }
    ;

  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(options, (err, response) => {
      let events = []
        , event
        ;

      if (err) {
        debug('The API returned an error: ' + err);
        return reject();
      }

      response.values.forEach((row) => {
        if (!row.length) {
          events.push(event);
          event = undefined;
          return;
        }

        if (typeof event === "undefined")
          return event = {
            date: moment(row[0], config.schedule.date_format),
            races: [],
          };

        if (row[0] === "Time")
          return;

        let race = {
          start_time: moment.tz(
            row[0],
            config.schedule.time_format,
            config.schedule.timezone
          ).dayOfYear(event.date.dayOfYear()).utc(),
          racer_1:    row[1],
          racer_2:    row[3],
          length:     row[4],
          platform:   row[5],
          confirmed:  row[6],
          game:       row[7],
          vod:        row[8],
          winner:     row[9],
        };

        // skip unfilled time slots
        // may skip unconfirmed slots in the future
        if (race.racer_1 && race.racer_2)
          event.races.push(race);
      });

      resolve(events);
    });
  });
};
