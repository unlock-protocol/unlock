---
title: The Data Builder URL
subTitle: Extending Unlock Protocol’s “hook” capabilities with data
authorName: Julien Genestoux
publishDate: November 11, 2022
description: Extending Unlock Protocol’s “hook” capabilities with data.
image: /images/blog/data-hook.png
---

Today, we’re introducing a new tool that lets a developer change the behavior of deployed locks through hooks while still using the Unlock Labs checkout user interface. This is implemented by way of a data builder URL in the checkout config.

![data-hook.png](/images/blog/data-hook.png)

But first, let’s start with a bit of context!

## Giving Unlock Protocol the hook

Inside Unlock, the membership contract is called `PublicLock`. Unlock is a protocol because every membership contract (of the same protocol version) implements the same functions and features. When a creator deploys _their_ lock, they deploy a contract from a template.

Over the years, many creators have told us about the need to customize the behavior of their contracts. To maintain the “base” behavior standard, we introduced the [concept of “hooks.”](https://docs.unlock-protocol.com/core-protocol/public-lock/hooks)

Hooks introduce the ability to call third-party contracts as part of specific lock functions, while still retaining the protocol-standard functions. These hooks can be [configured by lock managers](https://docs.unlock-protocol.com/core-protocol/public-lock/access-control). For example, we introduced a few “public” hook contracts such as our [password hook](https://unlock-protocol.com/guides/password-protected-nft-memberships/), which is used for situations where a lock manager only wants the subset of individuals who know the password to be able to create a membership.

One of these hooks is called `onPurchaseHook`, and you probably understand from its name: it is called by the public lock’s `purchase` function. This `onPurchaseHook` hook includes 2 different functions:

- `keyPurchasePrice` is a function that is called with the following parameters: buyer’s address, recipient of the NFT address (they’re often the same but could be different), the referrer address, and a _mysterious `data`_ parameter (we’ll come back to this soon). The `keyPurchasePrice` function is expected to return a number, the amount the buyer is expected to pay for the membership. This can be used to make membership prices dynamic.
- `onKeyPurchase` is a function that is called with the same parameters as the function above, as well as a `tokenId` parameter for the membership being bought, and a few more items. Again, there is also a `data` parameter.

The lock’s purchase function will **first** call the `keyPurchasePrice` to determine the price to be paid (and especially if the user has approved enough!), and will finish its execution by calling `onKeyPurchase` .

Remember: hooks are proper contracts, so they can also store any data they want, and could also include other functions. A single hook can also implement multiple hook functions to be called at different points in the lock’s lifecycle.

## Introducing the Data Builder URL

In the previous section, we discussed that both `keyPurchasePrice` and `onKeyPurchase` have a `data` argument. That `data` parameter is, in fact, completely ignored by the lock itself and just passed to the hook’s function. It can be used by the front-end application to send data to the hook so the hook can change its behavior based on it.

For example, this `data` argument is what we use to pass a `secret` corresponding to the password in the context of the password hook. We could also pass some useful metadata to be stored in the hook and returned by the lock to display specific metadata.

Now, our front-end checkout application does not “know” how to build the `data` blob for the specific hooks deployed on specific contracts. For this reason, we are introducing what we call _Data Builder URLs_.

The `dataBuilder` is a new parameter you can use inside of the [paywall configuration](https://docs.unlock-protocol.com/tools/checkout/configuration) for any lock that you are configuring there. If the `dataBuilder` is set, then our front-end application will perform a GET request to it and include the following parameters: `recipient`, `lockAddress`, and `network`, so that the web application can compute a specific `data` blob to be passed as an argument for the `purchase` function.

## An example!

Our friends at [Zealous](https://zealous.app) wanted to create a new kind of membership for their platform. Anyone who has their membership NFT can access some premium features. However, they wanted to create a system where people who owned NFTs from specific collections would get a discount.

Looking up what NFTs someone owns using an on-chain script would be extremely expensive (and maybe even impossible as many contracts don’t include a way to list tokens per address), so we must do it off-chain. However, doing it solely off-chain would expose us to the possibility of someone claiming they own a special NFT (when they actually don’t) so they could grab the discount. So we’re taking a mixed approach: we look for NFTs owned by the user off-chain, but then create a `dataBuilder` to compute a “hint” that is passed as `data` to the contract.

The hook can then use the hint to confirm that indeed the user owns one of these NFTs.
