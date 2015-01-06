
# metrics-stripe-charges

A [Stripe](https://stripe.com) [charges](https://github.com/stripe-charges) plugin for [segmentio/metrics](https://github.com/segmentio/metrics).

Use this plugin to visualize Stripe charges over time.

![](https://f.cloud.github.com/assets/658544/2361169/09325510-a62e-11e3-8f49-e327e89595cd.png)

## Installation

    $ npm install metrics-stripe-charges

## Quickstart

Here's a full example of a [Geckoboard](https://github.com/segmentio/geckoboard) dashboard showing Stripe charge metrics:

```js
var Metrics = require('metrics');
var charges = require('metrics-stripe-charges');
var geckoboard = require('geckoboard')('api-key');

new Metrics()
  .every('10m', charges('stripe-key'))
  .use(function (metrics) {
    metrics.on('stripe charged', function (metric) {
      geckoboard('widget-id').number(metric.latest());
    });
  });
```

#### Filter Customers

You can further `filter` customers using [stripe-charges](https://github.com/segmentio/stripe-chages) filters:

```js
new Metrics()
  .every('10m', charges('stripe-key', { filter: filter }));

function filter (charge) {
  return charge.customer !== 'cus_8239d2jd9j'; // filter enterprise customer X
}
```

## Metrics

The metrics exposed by this plugin are:

- `stripe charges` - the number of charges today
- `stripe charged` - the amount charged today

and are calculated for the last 30 days, last 52 weeks, and last 10 years.

## License

MIT