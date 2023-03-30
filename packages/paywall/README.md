# The paywall

The paywall is an application that can be added to any website to check if a visitor is a member.
It also offers the ability to open a "checkout" UI which lets the user purchase a key to any of the locks configured for that page.

## CDN version

You can also [load the library from our CDN](https://paywall.unlock-protocol.com/static/unlock.latest.min.js) and embed it in your applications.

[See details in our docs](https://docs.unlock-protocol.com/tools/paywall).

### The Paywall Object

The `@unlock-protocol/paywall` module exports an object called `Paywall` that may be used to lock a page. It shares 99% of its code with [the script you can add to your markup](https://docs.unlock-protocol.com/getting-started/locking-page#embedding-the-paywall), but rather than instantiating immediately based on a `window.unlockProtocolConfig` variable, it allows you to control when and how the paywall loads.

Usage is simple:

```javascript
import { Paywall } from '@unlock-protocol/paywall'

// See https://docs.unlock-protocol.com/getting-started/locking-page#configure-the-paywall
const paywallConfig = {}

// Configure networks to use
// You can also use @unlock-protocol/networks for convenience...
const networkConfigs = {
  1: {
    provider: 'HTTP PROVIDER',
  },
  100: {
    // configuration for gnosis chain... etc
  },
  // etc
}

// Pass a provider. You can also use a provider from a library such as Magic.link or privy.io
// If no provider is set, the library uses window.ethereum
const provider = window.ethereum

const paywall = new Paywall(paywallConfig, networkConfigs, provider)

// Loads the checkout UI
paywall.loadCheckoutModal()
```
