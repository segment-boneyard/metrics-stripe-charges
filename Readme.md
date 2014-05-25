
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
    metrics.on('stripe charged today', geckoboard('widget-id').number);
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

The metrics exposed by this plugin are divided by date granularity.

Daily:
- `stripe charges today` - the number of charges today
- `stripe charged today` - the amount charged today
- `stripe charges yesterday` - the number of charges yesterday
- `stripe charged yesterday` - the amount charged yesterday
- `stripe charges 2 days ago` - the number of charges 2 days ago
- `stripe charged 2 days ago` - the amount charged 2 days ago

Weekly:
- `stripe charges past week` - the number of charges last week
- `stripe charged past week` - total charged last week
- `stripe charges 2 weeks ago` - the number of charges 2 weeks ago
- `stripe charged 2 weeks ago` - total charged 2 weeks ago
- 
Monthly:
- `stripe charges past month` - the number of charges last month
- `stripe charged past month` - total charged last month
- `stripe charges 2 months ago` - the number of charges 2 months ago
- `stripe charged 2 months ago` - total charged 2 months ago

Total: 
- `stripe charges` - total amount of Stripe charges
- `stripe charged` - total amount charged

Weekly Sparkline: 
- `stripe charges last week` - an array of charges in the past 7 days
- `stripe charged last week` - an array of charge amounts in the past 7 days

## License

MIT