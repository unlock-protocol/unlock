---
title: Recurring Memberships
subTitle: The Unlock Protocol supports recurring memberships!
authorName: Julien Genestoux
publishDate: July 3, 2020
description: Leveraring the ERC20 approach to allowances lets creators easily create a recurring membership!
image: /images/blog/protocol-for-memberships.png
---

The most exciting aspects of Ethereum is its composability. For example, locks can use stable coins such as DAI or USDc for their pricing. These coins are both using the ERC20 token standard. Today we're showing how we leverage another characteristic of the ERC20 specification to make recurring memberships.

# Introducing the Key Purchaser contract

Locks have a pretty simple mechanism to "purchase" memberships, which has one handy characteristic: **the sender of the transaction can specify the recipient of the membership**. It means that someone can buy a key
(membership) for themselves or, for someone else. We already use this mechanism for [our credit card support](/blog/unlock-with-credit-cards), for example.

We created a new contract, called the **Key Purchaser**, whose sole purpose is to purchase keys to a specific lock. This contract enables recurring memberships!

# How does it work?

1. The lock owner **deploys a Key Purchaser** contract dedicated to their lock. When they do so, they define some characteristics for the recurring memberships:

   - the frequency at which keys can be renewed,
   - the earliest an existing key can be renewed (before it expires),
   - the maximum price to pay per key (in case the lock's key price was increased)
   - a reward for the transaction sender (see below!)

2. Rather than buying keys immediately, prospective members use the ERC20 allowance mechanism to **allow the Key Purchaser** contract to spend some of their ERC20 tokens. The amount that they approve should cover multiple renewals, based on the use case.

3. A third party application should monitor these approvals, and, for each of them, if the approver does not have a valid key to the lock, it should call the Key Purchaser contract to **perform a purchase**. That transaction will only succeed if all of the following pre-requisites are met:

   - The approver has approved an amount that is large enough
   - The approver has enough ERC20 to perform the purchase
   - The key price has changed significantly
   - The approver does not have a key or has a key which is soon to be expired

4. If the transaction succeeds, the member will see their ERC20 being spent. Some of the tokens are used to purchase the key and the balancer to provide a reward to the 3rd party application, which sends the transaction. The reward's goal is to cover for the gas spent to perform the transaction.

# A full example

A lock priced in DAI was deployed at this address: [`0x72ef8d4a4...`](https://etherscan.io/address/0x72ef8d4a46c94fe739f880b690bff2a825113abf). The lock's name is _v7 DAI Lock_. The key price is 1 DAI, and the duration is 1 day.

A Key Purchaser was deployed at this address: [`0xa1c718312fd0...`](https://etherscan.io/address/0xa1c718312fd0252540e5ecf6b4cd83fdbfa06acb). This Key Purchaser allows for a maximum price of 1 DAI (in other words, all renewals would fail if the price was increased). The Key Purchaser enables for renewals every 20 hours (72000 seconds) and would only succeed if it was mined at most 1 hour (3600 seconds) before the expiration of a previous key. Finally, there is a reward of 0.1 DAI for the address which sent the transaction.

A user [approved the key purchaser](https://etherscan.io/tx/0x5d3fb6902a3272651460d1ada2abe3b2ab8433f24c9378853b6a4095afc127ce) to spend up to 10 DAI to cover multiple renewals.

Another user then [sent a transaction to the key purchaser](https://etherscan.io/tx/0xfd5f8dd28cd9f20da00435a562eda0171ecdfa21c8cb0f2367d888f407465aed) to perform the actual purchase. The Etherscan UI provides a good understanding of what happened.

![key purchase](/images/blog/recurring-memberships/transaction.png)

We can see 1.1 DAI transferred from the member's address, 1 DAI sent to the lock, 0.1 DAI sent to the sender.
Additionally, a new NFT for the lock was minted and granted to the members!

Easter egg: The membership has now expired, which means it can be renewed... and there is a 0.1 DAI reward to whoever sends it!

## Next steps

We are [working](https://github.com/unlock-protocol/unlock/issues/6736) on running a 3rd party service that would issue transactions to execute key purchases. This service will monitor deployments of new key purchasers and the corresponding ERC20 approvals. For each of these, it will check whether the user should get a new key and issue a transaction on that case. This service will only execute transactions where the reward covers the gas we would spend.

Another next step is to update our paywall application to support recurring memberships.
