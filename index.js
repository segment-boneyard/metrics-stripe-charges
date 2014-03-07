
var Charges = require('stripe-charges');
var Dates = require('date-math');

/**
 * Expose `StripeCharges`.
 */

module.exports = StripeCharges;

/**
 * Return a Stripe dashboards data function.
 * @param {String} key
 * @param {Object} options
 */
function StripeCharges (key, options) {
  if (!(this instanceof StripeCharges)) return new StripeCharges(key, options);
  this.charges = Charges(key);
  this.options = options || {};
  var self = this;
  return function () { return self.stripe.apply(self, arguments); };
}

/**
 * Generate a Stripe data function.
 *
 * @param {String} key
 * @param {Object} options
 *
 * @returns {Function}
 */

StripeCharges.prototype.stripe = function (data, callback) {
  var self = this;
  var results = data.stripe = (data.stripe || {});
  // select all the charges
  this.charges(new Date(0), new Date(), function (err, charges) {
    if (err) return callback(err);
    self.last2Days(charges, results);
    self.daily(charges, results);
    self.weekly(charges, results);
    self.monthly(charges, results);
    self.total(charges, results);
    callback();
  });
};

/**
 * Calculate active subscriptions and charges for the last two days.
 *
 * @param {Customers} charges
 * @param {Object} results
 */

StripeCharges.prototype.last2Days = function (charges, results) {
  var today = new Date();

  var todayCharges = this.paidCharges(charges, today, today);
  results['charges today'] = todayCharges.count();
  results['total charged today'] = todayCharges.total();

  var yesterday = Dates.day.shift(new Date(), -1);
  var yesterdayCharges = this.paidCharges(charges, yesterday, yesterday);
  results['charges yesterday'] = yesterdayCharges.count();
  results['total charged yesterday'] = yesterdayCharges.total();

  var twoDaysAgo = Dates.day.shift(yesterday, -1);
  var twoDaysAgoCharges = this.paidCharges(charges, twoDaysAgo, twoDaysAgo);
  results['charges 2 days ago'] = twoDaysAgoCharges.count();
  results['total charged 2 days ago'] = twoDaysAgoCharges.total();
};

/**
 * Calculate active subscriptions for the past week.
 *
 * @param {Customers} charges
 * @param {Object} results
 */

StripeCharges.prototype.daily = function (charges, results) {
  var today = new Date();

  var numbers = [];
  var amounts = [];

  for (var ago = 7; ago >= 0; ago -= 1) {
    var current = Dates.day.shift(today, -ago);
    var filtered = this.paidCharges(charges, current, current);
    numbers.push(filtered.count());
    amounts.push(filtered.total());
  }

  results['charges for the last week'] = numbers;
  results['charge amounts for the last week'] = amounts;
};

/**
 * Calculate the weekly active subscriptions and charges.
 *
 * @param {Customers} charges
 * @param {Object} results
 */

StripeCharges.prototype.weekly = function (charges, results) {
  var yesterday = Dates.day.shift(new Date(), -1);

  var oneWeekAgo = Dates.day.shift(yesterday, -7);
  var oneWeekAgoCharges =  this.paidCharges(charges, oneWeekAgo, yesterday);
  results['charges 0-1 weeks ago'] = oneWeekAgoCharges.count();
  results['total charged 0-1 weeks ago'] = oneWeekAgoCharges.total();

  var twoWeeksAgo = Dates.day.shift(oneWeekAgo, -7);
  var twoWeeksAgoCharges = this.paidCharges(charges, twoWeeksAgo, oneWeekAgo);
  results['charges 1-2 weeks ago'] = twoWeeksAgoCharges.count();
  results['total charged 1-2 weeks ago'] = twoWeeksAgoCharges.total();
};

/**
 * Calculate the monthly active subscriptions and charges.
 *
 * @param {Customers} charges
 * @param {Object} results
 */

StripeCharges.prototype.monthly = function (charges, results) {
  var yesterday = Dates.day.shift(new Date(), -1);

  var oneMonthAgo = Dates.month.shift(yesterday, -1);
  var oneMonthAgoCharges =  this.paidCharges(charges, oneMonthAgo, yesterday);
  results['charges 0-1 months ago'] = oneMonthAgoCharges.count();
  results['total charged 0-1 months ago'] = oneMonthAgoCharges.total();

  var twoMonthsAgo = Dates.month.shift(oneMonthAgo, -1);
  var twoMonthsAgoCharges = this.paidCharges(charges, twoMonthsAgo, oneMonthAgo);
  results['charges 1-2 months ago'] = twoMonthsAgoCharges.count();
  results['total charged 1-2 months ago'] = twoMonthsAgoCharges.total();
};

/**
 * Calculate the total active charges.
 *
 * @param {Customers} charges
 * @param {Object} results
 */

StripeCharges.prototype.total = function (charges, results) {
  charges = this.paidCharges(charges);
  results['charges'] = charges.count();
  results['total charged'] = charges.total();
};

/**
 * Filter by active, paid charges.
 *
 * @param {Customers} charges
 * @param {Date} start
 * @param {Date} end
 * @return {Charges}
 */

StripeCharges.prototype.paidCharges = function (charges, start, end) {
  if (this.options.filter) charges = charges.filter(this.options.filter);
  if (start && end) charges = charges.created(floor(start), ceil(end));
  charges = charges.paid(true).refunded(false);
  return charges;
};

/**
 * Floor the `date` to the nearest day,
 * while keeping in the same locale
 * (unlike UTC'ing like Dates.day.floor).
 */

function floor (date) {
  date = new Date(date);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
}

/**
 * Floor the `date` to the nearest day,
 * while keeping in the same locale
 * (unlike UTC'ing like Dates.day.floor).
 */

function ceil (date) {
  date = new Date(date);
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  return date;
}