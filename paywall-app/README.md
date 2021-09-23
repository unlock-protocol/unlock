# The paywall

The paywall is an application which can be added to any website to check if a visitor is a member.
It also offers the ability to open a "checkout" UI which lets the user purchase a key to any of the locks configured for that page.

## Module

A npm module `@unlock-protocol/paywall` is offered for convenience to export and easily add an Unlock paywall to any site without "hotloading" the code from the unlock servers.

### The Paywall Object

The `@unlock-protocol/paywall` module exports an object called `Paywall` that may be used to lock a page. It shares 99% of its code with [the script you can add to your markup](https://docs.unlock-protocol.com/getting-started/locking-page#embedding-the-paywall), but rather than instantiating immediately based on a `window.unlockProtocolConfig` variable, it allows you to control when and how the paywall loads.

Usage is simple:

```javascript
import { Paywall } from '@unlock-protocol/paywall';

// See https://docs.unlock-protocol.com/getting-started/locking-page#configure-the-paywall
const paywallConfig = {};

// Configure networks to use
const networkConfigs = {
  1: {
    readOnlyProvider: 'HTTP PROVIDER',
    locksmithUri: 'https://locksmith.unlock-protocol.com',
    unlockAppUrl: 'https://app.unlock-protocol.com'
  },
  100: {
    // configuration for xdai... etc
  },
  // etc
}

new Paywall(paywallConfig, networkConfigs);
// from this point onward, it behaves exactly as if you had loaded the script in the <head> of your page.
```
