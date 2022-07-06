---
title: Hooks
subTitle: The "callback" pattern is a very good way to customize a lock's behavior!
authorName: Julien Genestoux
publishDate: May 27, 2020
description: Our Public Lock contracts implements a hook pattern to let lock owners customize the behavior of their lock upon key purchases and key cancellations.
image: /images/blog/hooks/settings-hooks.png
---

Locks are primitives which manage access control. When a creator deploys a lock, they can integrate it with other primitives on the Ethereum chain, [such as any ERC20](https://unlock-protocol.com/blog/erc20-locks) (including stable coins or personal tokens).

When deploying them, a creator can customize their parameters (price and duration of the keys, maximum number of keys... etc). At a lower level, they are also _programmable_ through the use callbacks.

Any lock manager (learn more about roles for locks) can point to a 3rd party contract which would implement the `ILockKeyPurchaseHook` [interface](https://github.com/unlock-protocol/unlock/blob/master/smart-contracts/contracts/interfaces/hooks/ILockKeyPurchaseHook.sol) and/or the `ILockKeyCancelHook` [interface](https://github.com/unlock-protocol/unlock/blob/master/smart-contracts/contracts/interfaces/hooks/ILockKeyCancelHook.sol). The first one is invoked when a key purchase is performed, while the second would be called when a key has been cancelled.

![Setting hooks](/images/blog/hooks/settings-hooks.png)

# Key Purchase Hook

The Key purchase hook actually has 2 entry points:

- `keyPurchasePrice` which is invoked _before_ the key purchase itself
- `onKeyPurchase` which is invoked _after_ the key purchase.

The first hook `keyPurchasePrice` can be used to alter the price which is actually paid by the member to purchase a membership, or even prevent it completely. For example, you would use this hook to apply a discount code, or even prevent someone from buying a membership unless they are, say an accredited investor.

One of the thing that excites us the most about this is the ability to "chain" memberships. For example, someone would pay less for a membership if they already have a membership to another lock.

The second hook, `onKeyPurchase`, should be used to update the state of the system, as it will not alter the actual key purchase transaction. This is useful for example, if you want to create a bonding curve for the key price of a lock. The hook can then be invoked to change the lock's key price for every purchase... etc.

# Key Cancel Hook

This hook only has a single entry point, `onKeyCancel`, which is invoked when a member cancels (burns) their key. Even though it could revert to prevent refunds, we recommend that it is only used to alter state as the cancellation parameters (including the amount to be refunded can be altered using other mechanisms)

# Examples

Our docs provide 2 examples for how to use callback hooks. The first one shows how to create a discount code for key purchases on a hook. This hook is quite interesting because it solves the challenge of keeping the discount code secret (it is not submitted when performing the purchase!). The second example shows an example where key purchases are restricted to people who have a special access code.

With Ethereum, smart contracts are all running in the same "computer" which opens the door for very deep integrations between different components which provide different features.
