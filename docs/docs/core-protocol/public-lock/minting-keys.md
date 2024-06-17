---
title: Minting Keys
description: Membership NFTs are called keys and they can be minted from the Lock contract using two different methods.
sidebar_position: 2
---

In the Unlock Protocol ecosystem, Membership Non Fungible Tokens are called [Keys](https://unlock-protocol.com/guides/locksmith-lingo/). Keys are minted from the Lock contract.

There are two methods that can be used to mint Keys. Keys can either be **purchased** or **granted**. Keys can be minted one-by-one or in batches (multiple Keys minted at one time) using either method.

### Purchasing Keys

Let's start by noting that this flow uses the function [`purchase`](/core-protocol/smart-contracts-api/PublicLock#purchase) from the lock even if the keys are free. The best way to describe this flow is that it is _self-served_, which means that anyone can call this function to mint an NFT, whether these keys are free or paid.

:::info
To disable purchases completely, the best approach is to set the maximum number of keys available for sale to be `0`.
:::

The `purchase` function can be used to purchase multiple keys at once, and the function takes arguments which are all `arrays` in order to accommodate this. Each of these arrays needs to be of the same size.

One of the arguments is an array of recipients, which means that the wallet sending the transaction can be _different_ from the one who will receive the NFT memberships. This can be very useful when, for example, the application is buying on behalf of users or when a payment happens "off-chain" (using credit card or other mechanism) and the payment provider then wants to mint the NFT membership to the user.

Another argument is an array of key managers. The [key manager](/core-protocol/public-lock/access-control#keymanager) is the address that has the transfer and cancellation rights over the NFT being minted. For credit card purchases where the transaction cannot be considered final, we strongly advise this key manager to be controlled by the entity that triggered the card payment so that if the transaction is reversed, the NFT membership can also be cancelled.

### Granting Keys

The Lock contract also has a [`grantKeys`](/core-protocol/smart-contracts-api/PublicLock#grantkeys) method. This method can _only_ be called by [lock managers](/core-protocol/public-lock/access-control#lockmanager) or [key granters](/core-protocol/public-lock/access-control#keygranter) and can be used to mint/grant keys _for free_. This function does **not require** a payment and is not limited by the maximum number of keys for sale.

Contrary to the previous method, the granter can also customize the expiration of each membership minted using this mechanism, which makes it a convenient method to grant _previews_ or free trials. However, there again, it is critical to set the [key manager](/core-protocol/public-lock/access-control#keymanager) accordingly in order to avoid abuses. For example, if the contract allows for refunds upon cancellation, a malicious recipient of an airdropped key could then claim a refund if they have also been set as _key manager_.

### Protocol Fee

As for version 13, the protocol includes a fee switch. The **fee is initially set to 0**. On May 28th 2024, [a proposal was sent to the DAO](https://www.tally.xyz/gov/unlock/proposal/72110981722145472193202862106710876303006911465748904597113931014096574827698) to change that fee to 1%. As of June 14th 2024, the proposal was approved and the fee is now applied! You can [see on the Networks page](../unlock/networks.mdx) the fee for each network. The [DAO community](../../governance/unlock-dao) can decide to change this at any point, for all networks or just a subset of networks.

This protocol fee aims at making the protocol economically sustainable by providing a budget to the DAO.
