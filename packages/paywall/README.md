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
const response = await paywall.loadCheckoutModal()

// response is set when the modal is closed. response may include hash (the transaction hash) and lock (the address of the lock to which the transaction was sent)
```

### Using unlock provider

You can use `Paywall` class to load login modal and get a provider from it.

```javascript
import { Paywall } from '@unlock-protocol/paywall'
import { networks } from '@unlock-protocol/networks'
const paywall = new Paywall(networks)
// you can now use the provider to sign messages, send transactions, etc.
const provider = paywall.getProvider('https://app.unlock-protocol.com')
await provider.connect() // this will open the login modal
```

You can find the tutorial [here](https://docs.unlock-protocol.com/tutorials/front-end/paywall/provider/) here to learn more about how to use the provider within your application using wagmi.
