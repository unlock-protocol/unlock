---
title: Unlocking Smart Contracts
subTitle: Integrating Unlock-Protocol into your Smart Contracts
authorName: Nick Mancuso
description: Unlock value-added features directly in your smart contract. Trivial to implement with endless opportunities. We show you how and discuss some reasons why this might be interesting to you.
image: /static/images/blog/TBD/hero.jpg
---

To date we’ve been talking about using Unlock-Protocol to monetize content such as your blog posts or to sell tickets to an event. But you can also use Unlock for value-add features inside your smart contract!

# How it works

1. Create a [Lock](https://unlock-protocol.com/). (If this is your first lock, follow [this step by step](https://unlock-protocol.com/blog/create-first-lock/).)

Your users can purchase a Key to this Lock in order to gain access to some feature or benefit. Sell Keys on your website, we publish a Javascript API to make integration easy. For example, here is [how to integrate with React](https://unlock-protocol.com/blog/integratating-unlock-react/).

But, you could also very well integrate with your smart contract too by simply checking if the user’s account owns a valid key.

## Use cases:

* Unlock a paid-only feature
* Unlock a discount on future transactions (or free transactions). Yes, BNB, the most valuable ERC20 actually does exactly that ;)
* Unlock better odds, e.g. :
  - opening card packs, key owners get 1 epic or better vs the usual 1 rare or better when rolling a DnD die, get +x bonus on the roll
* Unlock usage limits, such as free trial enables 1 tx per day, Unlock unlimited per-day.
* instant-unfreezing for a standard freeze / unfreeze contract which usually requires 24 hours to defrost

# How-to (for developers)

All of our examples are [on Github](https://github.com/HardlyDifficult/unlock-contracts) (from easy to hard):

* PaidOnlyFeature: a function which can only be called by key owners
* DiceRoleModifier: a function which gives key owners an advantage over non-owners
* FreeTrial: a function that can only be called once per day unless you purchase a key
* MutableLock: an example of how you can support changing the Lock in the future

Each example has a Solidity contract in the `contracts` directory and a Truffle test in the `test` folder.

In order to test during development of your smart-contract - you’ll need to deploy the lock locally. The tests show how this is done.

Run the following in your project folder to install:

```
npm hardlydifficult-test-helpers
```

Check out our example tests for how to get started.

Going further: (figure we can mention these at the end but not go into detail)
Using multiple Locks in a single contract. E.g. with the dice example, maybe you can buy a +1 modifier and/or a +2 modifier (for a total of +3 with both keys maybe).
Making the Lock address mutable.  Unlock is under active development, you may want to ensure the Lock used can be changed in the future in case we release a new feature you want to leverage.

Want to do this for your smart contract? Get in touch we’d love to help you set it up: hello@unlock-protocol.com
