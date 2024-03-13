---
title: You Can Now Do Cross-Chain Purchases with Unlock and Decent
authorName: Julien Genestoux
publishDate: October 11, 2023
description: The Unlock Labs team has released, in partnership with Decent, the ability for users to make cross-chain purchases across the Ethereum ecosystem from the Unlock checkout.
image: /images/blog/crosschaincheckout/cross-chain-checkout-share.png
---

It is now obvious that L2 (and side-chains before that) represent a required step to “scale” blockchains. All transactions will not happen on the same “virtual machine”, but across dozens of them. This is the reason why the Unlock Protocol has been deployed on 12 networks (and more to come), including [Ethereum mainnet](https://unlock-protocol.com/blog/announcing-v0), [Polygon](https://unlock-protocol.com/blog/unlock-on-polygon), [Gnosis Chain](https://unlock-protocol.com/blog/xdai) (neee xDAI), [Optimism](https://unlock-protocol.com/blog/optimism), [Arbitrum](https://unlock-protocol.com/blog/arbitrum) and more recently [Base](https://unlock-protocol.com/blog/base).

This, however, also brings a new challenge for users: their wallets need to have tokens on each and every network they wish to use to transact. This meant a lot of manual bridging and a lot of headaches.

Today, the Unlock Labs team is excited to announce, in partnership with [Decent.xyz](http://decent.xyz), a whole new feature in our “checkout” tool: the ability to make **cross-chain purchases**. 

## What is Unlock’s checkout?

The [Unlock checkout](https://docs.unlock-protocol.com/tools/checkout/) is an interface that lets developers easily add the ability to purchase memberships from their sites, without having to write too much code. It already has the following features:

- Connecting wallets (any web3 wallet)
- Handling [Unlock accounts](https://docs.unlock-protocol.com/tools/sign-in-with-ethereum/unlock-accounts) for users without a wallet
- Supporting [metadata collection](https://docs.unlock-protocol.com/tools/checkout/collecting-metadata) (like email addresses or full names)
- Enabling [recurring onchain subscriptions](https://unlock-protocol.com/guides/recurring-memberships/)
- [Credit card](https://unlock-protocol.com/guides/enabling-credit-cards/) support (through Stripe or [Crossmint](https://unlock-protocol.com/blog/crossmint-unlock-integration))
- [Swap and Pay](https://unlock-protocol.com/blog/swap-and-purchase)

and several more features that make it easy for developers to integrate memberships or subscriptions into their onchain applications.

Unlock has now partnered with the team at [Decent](https://decent.xyz) to introduce “**cross-chain checkout**”. 

## What is cross-chain checkout?

This new feature lets users send transactions from the chain of *their* choice to a different network on which a membership smart contract has been deployed. This is a major unlock (haha) to provide a better user experience. **Users do not have to bridge tokens, or even configure their wallets for that new chain**.

What to try it out by yourself on a live demo? [Use this checkout link.](https://app.unlock-protocol.com/checkout?id=cf572b45-5799-4e0d-9dce-d7f741063a5e)

![crosschain-checkout-screenshot.png](/images/blog/crosschaincheckout/cross-chain-checkout-screenshot.png)

In the example, a membership NFT smart contract has been [deployed on Optimism](https://optimistic.etherscan.io/address/0x82bc85aac5b8192d1ef835a9ae9e4bdb299a57ea#code). As a user, I want to purchase a membership, but I don’t have any tokens on Optimism. However, in my wallet, I **do** have some Ether on Arbitrum, Base and Ethereum mainnet. I also have some Matic on Polygon, but not enough to make the purchase, so this option does not show up.

Cross-chain checkout empowers me to use the tokens I do have to purchase the memberships I want, even if they are on other networks.

When I click purchase, Unlock and Decent are integrated to transparently handle all of the bridging and exchange needed to make this transaction as seamless as possible. (As you can imagine, this does have a slight gas cost and behind-the-scenes bridging time. For L2s like Arbitrum or Base, this takes less than one minute.)

At Unlock, we believe that to bring web3 to the masses, we need to remove friction wherever possible, and we’re really proud of this new feature! Please, [let us know what features](https://discord.unlock-protocol.com/) you would want to see being added to the Unlock checkout!
