
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
      set(metrics, charges, 'all time', new Date(0), today);
      set(metrics, charges, 'today', Dates.day.floor(today), today);
      set(metrics, charges, 'yesterday', Dates.day.shift(today, -1), today);
      set(metrics, charges, '2 days ago', Dates.day.shift(today, -2), today);
      set(metrics, charges, 'last week', Dates.week.shift(today, -1), today);
      set(metrics, charges, '2 weeks ago', Dates.week.shift(today, -2), Dates.week.shift(today, -1));
      set(metrics, charges, 'last month', Dates.month.shift(today, -1), today);
      set(metrics, charges, '2 months ago', Dates.month.shift(today, -2), Dates.month.shift(today, -1));

      // daily
      daily(metrics, charges);
    });
  };
}

/**
 * Set metrics for the given `key` and time interval.
 *
 * @param {Metrics} metrics
 * @param {Array|Charge} charges
 * @param {String} key
 * @param {Date} start
 * @param {Date} end
 */

function set (metrics, charges, key, start, end) {
  charges = charges.created(start, end);
  metrics.set('stripe charges ' + key, charges.count());
  metrics.set('stripe charged ' + key, charges.total());
}

/**
 * Get the daily charge counts for the last week
 *
 * @param {Array|Metric} metrics
 * @param {Array|Charge} charges
 */

function daily (metrics, charges) {
  var today = new Date();

  var numbers = [];
  var amounts = [];

  for (var ago = 7; ago >= 0; ago -= 1) {
    var start = Dates.day.shift(today, -ago);
    var end = Dates.day.shift(today, -ago+1);
    var filtered = charges.created(start, end);
    numbers.push(filtered.count());
    amounts.push(filtered.total());
  }

  metrics.set('stripe charges last week', numbers);
  metrics.set('stripe charged last week', amounts);
}