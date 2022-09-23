---
title: Unlock adds support for fiat NFT subscriptions
authorName: searchableguy
publishDate: September 27, 2022
description: Unlock adds support for fiat NFT subscriptions
image: /images/blog/unlock-fiat-subscription/main.png
---

![Fiat subscription confirmation page](/images/blog/unlock-fiat-subscription/main.png)

We recently launched support for [crypto based NFT subscriptions](./recurring-subscription-nft.md) which allowed people to pre-approve an amount in erc20 to be charged at a regular interval decided by the creator.

Today, we are extending the same support to fiat payment options we provide. Creators can now add `recurringPayments: number` to their locks in paywallConfig to charge their users on a regular frequency.

## How does it work?

Unlock's approach to recurring payment has two distinct elements:

1. Smart Contracts
   We added support for `grantKeyExtension` method on our contracts which allow creators and anyone who is a keyGranter to extend the NFT duration.
   This is avaiable in all locks starting with v11. We use this internally to renew keys of people who have subscribed to a NFT via fiat payment options.

2. Locksmith
   When a user goes through a recurring purchase, we create a subscription object on the backend to keep track of how many times the user wishes to renew and store details surrounding the purchase. Due to volatile nature of crypto, fiat prices swing drastically between days. To avoid this and protect the users, we lock in the fiat price at the time of subscription for further renewals. This means if user purchased a NFT for 0.1 token which was valued at $10 at the time of purchase, further renewals will only cost that + normal fees associated with using the fiat option. We use the subscription object to renew keys when they expire. We don't depend on stripe subscriptions which allow us to provide flexible schedule to creators for charging their users.

### Documentation and demo

- Community & Support: [Join the Unlock Discord](https://discord.com/invite/Ah6ZEJyTDp)

- Developer documentation: [Recurring Memberships](https://docs.unlock-protocol.com/unlock/creators/recurring-memberships)
