# dashboards-stripe-charges

A [Stripe](https://stripe.com) [charges](https://github.com/segmentio/stripe-charges) plugin for [segmentio/dashboards](https://github.com/segmentio/dashboards).

Use this plugin to visualize Stripe charges over time.

![](https://f.cloud.github.com/assets/658544/2361169/09325510-a62e-11e3-8f49-e327e89595cd.png)

## Installation

    $ npm install dashboards-stripe-charges

## Example

```js
var Dashboards = require('dashboards');
var charges = require('dashboards-stripe-charges');

new Dashboards()
  .use(charges('stripe-key'))
  .run();
```


#### Filter Customers

You can further `filter` customers using [stripe-charges](https://github.com/segmentio/stripe-chages) filters:

```js
new Dashboards()
  .use(charges('stripe-key', { filter: filter }))
  .run();

function filter (charge) {
  return charge.customer !== 'cus_8239d2jd9j'; // filter enterprise customer X
}
```

## Metrics

The metrics exposed by this plugin are divided by date granularity.

Daily:
- `stripe.charges today`
- `stripe.total charged today` 
- `stripe.charges yesterday`
- `stripe.total charged yesterday`
- `stripe.charges 2 days ago`
- `stripe.total charged 2 days ago`

Weekly:
- `stripe.charges 0-1 weeks ago`
- `stripe.total charged 0-1 weeks ago`
- `stripe.charges 1-2 weeks ago`
- `stripe.total charged 1-2 weeks ago`

Monthly:
- `stripe.charges 0-1 months ago`
- `stripe.active new charges 0-1 months ago`
- `stripe.charges 1-2 months ago`
- `stripe.total charged 1-2 months ago`

Total: 
- `stripe.charges`
- `stripe.total charged`

Weekly Sparkline: 
- `stripe.charges for the last week`
- `stripe.charge amounts for the last week`

## Quickstart

Here's a full example of a [Geckoboard](https://github.com/segmentio/geckoboard) dashboard showing Stripe subscription dashboards:

```js
var Dashboards = require('dashboards');
var charges = require('dashboards-stripe-charges');
var pipe = require('parallel-ware-pipe');
var geckoboard = require('geckoboard')('api-key');

new Dashboards()
  .use(charges('stripe-key'))
  .use(pipe('stripe.total charged 0-1 months ago', 'stripe.total charged 1-2 months ago', widget('widget-id').percentageChange))
  .run();
```

## License

MIT
