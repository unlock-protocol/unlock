---
title: Unlock adds support for fiat NFT subscriptions
authorName: searchableguy
publishDate: September 27, 2022
description: Unlock adds support for fiat NFT subscriptions
image: /images/blog/unlock-fiat-subscription/main.png
---

![Fiat subscription confirmation page](/images/blog/unlock-fiat-subscription/main.png)

We recently launched support for [crypto based NFT subscriptions](./recurring-subscription-nft.md) which allowed people to pre-approve an amount in erc20 to be charged at a regular interval set in the membership contract.

Today, we are extending the same support to fiat payment options we provide (including Credit card, [Apple and Google Pay](/blog/support-for-google-and-apple-pay)). Creators can now add `recurringPayments: number` to the `paywallConfig` when building their checkout URL in order to charge their users on a regular frequency.

## How does it work?

Unlock's approach to recurring payment has two distinct elements:

1. Smart Contracts
   We added support for `grantKeyExtension` method on our contracts which allows creators and anyone who is a [`keyGranter`](https://docs.unlock-protocol.com/core-protocol/public-lock/access-control#keygranter) to extend the NFT duration.
   This is available in all locks starting with v11. We use this internally to renew memberships of users who have subscribed via fiat payment options.

2. Locksmith
   When a user goes through a recurring purchase, we create a subscription object on the backend to keep track of how many times the user wishes to renew it and store all the details surrounding the purchase. Due to the volatile nature of many crypto-currencies, fiat prices can swing drastically between two payments. To avoid this and protect the users, we lock in the fiat price at the time of subscription for further renewals. This means if the user purchased an NFT for 0.1 tokens valued at $10 at the time of purchase, further renewals would only cost that $10, even if the price of the token is now much higher or much lower. We use the subscription object to renew keys when they expire. 

An example of a lock with 5 minute renewal time below getting extended every 5 minutes.

![Etherscan](/images/blog/unlock-fiat-subscription/etherscan.png)

### Documentation and demo

- Community & Support: [Join the Unlock Discord](https://discord.com/invite/Ah6ZEJyTDp)

- Developer documentation: [Recurring Memberships](https://docs.unlock-protocol.com/unlock/creators/recurring-memberships)
