
var debug = require('debug')('metrics:stripe:charges');
var Charges = require('stripe-charges');
var Dates = require('date-math');

/**
 * Expose `charges`.
 */

module.exports = charges;

/**
 * Return a Stripe charges plugin.
 * @param {String} key
 * @param {Object} options
 */

function charges (key, options) {
  var query = Charges(key);
  options = options || {};
  // default filter function
  if (!options.filter) options.filter = function () { return true; };
  return function (metrics) {
    // select all the charges
    debug('querying stripe charges ..');
    query(new Date(0), new Date(), function (err, charges) {
      if (err) return debug('failed to get stripe charges: %s', err);

      debug('found %d stripe charges', charges.count());

      charges = charges.filter(options.filter)
        .paid(true)
        .refunded(false);

      // by time
      var today = new Date();
      var start = new Date(0);

      // last 24 hours
      for (var i = 0; i <= 24; i += 1)
        set(metrics, charges, start, Dates.hour.shift(today, -i));

      // last 30 days
      for (var i = 0; i <= 30; i += 1)
        set(metrics, charges, start, Dates.day.shift(today, -i));
      
      // last 52 weeks
      for (var i = 1; i <= 52; i += 1)
        set(metrics, charges, start, Dates.week.shift(today, -i));

      // last 10 years
      for (var i = 1; i <= 10; i += 1)
        set(metrics, charges, start, Dates.year.shift(today, -i));      
    });
  };
}

/**
 * Set charge metrics from `start` to `end`.
 *
 * @param {Metrics} metrics       the metrics instance
 * @param {Array|Charge} charges  the entire list of stripe charges
 * @param {Date} start            the day to start counting
 * @param {Date} end              the day to end the count
 */

function set (metrics, charges, start, end) {
  charges = charges.created(start, end);
  metrics.set('stripe charges', charges.count(), end);
  metrics.set('stripe charged', charges.total(), end);
}