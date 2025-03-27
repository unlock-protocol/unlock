---
title: Unlock Accounts
description: A guide to what are Unlock Accounts and how do they work.
---

# Unlock Accounts

We recognize that not every web user currently owns a crypto wallet. For that reason, our locks [can be connected to a Credit Card processor](https://unlock-protocol.com/guides/enabling-credit-cards/). In that situation, Unlock also offers "Unlock Accounts" to users who do not own their own wallet, powered by [Privy](https://privy.io/).

For security reasons, Unlock accounts are _not_ available when using the [embedded paywall](/tools/checkout/paywall). When using the embedded paywall, you should pass an EIP 1193 provider, and most wallet providers (Privy, Magic, Dynamic... ) expose one to your application. You can also use frameworks such as Wagmi.

Here is a basic example:

```javascript
import { Paywall } from '@unlock-protocol/paywall'
import { networks } from '@unlock-protocol/networks'

const paywall = new Paywall(networks)
paywall.connect(provider) // EIP 1193 provider
paywall.loadCheckoutModal({...})
```

You can find more details in the [tutorials](../../tutorials/front-end/locking-page.md).
