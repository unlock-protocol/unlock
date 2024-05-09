---
title: Paywall
description: >-
  Guide to the Paywall JavaScript library.
---

# Paywall

The Paywall is a simple JavaScript library which can track state and emits events based on ownership of keys to specified locks. It can be used to display a Checkout for purchasing keys.

The Paywall is [available on npm](https://www.npmjs.com/package/@unlock-protocol/paywall) as `@unlock-protocol/paywall`. Its README contains usage examples.

## Configuration

The Paywall shares a configuration object with the Checkout and you can find everything you need to know in [Checkout / Configuration](/tools/checkout/configuration#the-paywallconfig-object) about how to build out the JSON object you're going use.

## Loading from a CDN

You can also easily add it to any webpage with the following:

```javascript
<script>
(function(d, s) {
  var js = d.createElement(s),
    sc = d.getElementsByTagName(s)[0];
  js.src="https://paywall.unlock-protocol.com/static/unlock.latest.min.js";
  sc.parentNode.insertBefore(js, sc); }(document, "script"));
</script>
```

Then assign a configiration to a global variable `unlockProtocolConfig` to configure it:

```javascript
<script>
  var unlockProtocolConfig =
  {
    // paywallConfig object
  }
</script>
```

### Events

When loaded asOnce loaded the script will trigger events on the page’s ​window​ object.

Registering event listeners.

```javascript
window.addEventListener('unlockProtocol.eventName', handler)
```

#### Status

**event** `unlockProtocol.status`

Triggered when unlockProtocol status changes.

**handler**

Handler event object properties.

| name  | Description                                                       | values                      |
| ----- | ----------------------------------------------------------------- | --------------------------- |
| state | Representing whether or not the connected wallet has a valid key. | locked or unlocked _string_ |

#### User info

**event** `unlockProtocol.authenticated`

Triggered when a user authenticates.

| name          | Description                                                                            | values   |
| ------------- | -------------------------------------------------------------------------------------- | -------- |
| address       | Ethereum address of the connected user                                                 | _string_ |
| signedMessage | the signature perform by the user if your configuration includes a messageToSignoption | _string_ |

Note: if the event is triggered without any payload, please consider that the user has "logged out".

#### Transaction status

**event** `unlockProtocol.transactionSent`

| name | Description                      | values   |
| ---- | -------------------------------- | -------- |
| hash | the Ethereum transaction         | _string_ |
| lock | the Ethereum address of the lock | _string_ |

#### User metadata

**event** `unlockProtocol.metadata`

Sent collected metadata about all the recipients. This is triggered on confirmation of the transaction.

### Pessimistic Unlocking

One of the features of the paywall application is that it [optimistically unlocks the page](https://unlock-protocol.com/blog/hello-optimistic-unlocking/). This feature improves the customer experience by immediately emitting the `unlocked` event when a transaction is sent, as long as the transaction is likely enough to eventually succeed.

In some cases, your application may want to _not_ unlock until the transaction is fully confirmed. For this you should add `pessimistic: true` to the paywall configuration.

When doing this, you should ensure that your application handles the events such as `unlockProtocol.authenticated` and `unlockProtocol.transactionSent` to show valuable feedback to the user. See the ["Events"](#events) section on this page.
