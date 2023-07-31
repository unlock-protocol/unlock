---
title: Token-gating Express.js
description: >-
  Express.js is a popular HTTP server framework for Node.js. In this tutorial,
  we will see to use the unlock-express plugin for Express.js in order to add
  locked routes in an Express application.
---

# Token-gating Express.js

The first step is to install the `@unlock-protocol/unlock-express`, either with `npm i @unlock-protocol/unlock-express` or `yarn add @unlock-protocol/unlock-express`.

Once installed, the plugin is readily usable:

```javascript
const configureUnlock = require("@unlock-protocol/unlock-express");
```

The plugin is based on the popular [Passport](https://www.passportjs.org/docs/) library and implements a custom strategy.

## Example

An example application exists in the [source code's directory](https://github.com/unlock-protocol/unlock/tree/master/packages/unlock-express/example).

### Configuration

The plugin works by adding a middleware that can be used to ensure that the current visitor owns a valid membership, but before that it needs to be configured.

The configuration step is required but has many good defaults. The `configureUnlock` has 3 arguments.

The first one is the `paywallConfiguration`. It is a JSON object that will be used to customize which contracts the user should have a membership to, as well as the checkout experience. For more details about its syntax, [check this section](../../tools/checkout/configuration/).&#x20;

The second one is the `passport` instance for your application.&#x20;

The 3rd one is completely optional and includes more advanced configuration:

1. `providers` By default, the plugin uses a set of default providers by network. You may want to customize them in order to not be subject to the rate limiters. Use the following format:

```javascript
providers: {
<network id: number>: <rpc endpoint url: string>
}
```

1. `baseUrl` This string is the base URL for your application. By default it is set to be the same as the one used by the route for which the middleware will be called.
