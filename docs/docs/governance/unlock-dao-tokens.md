---
title: Unlock Token (UDT)
description: The Unlock Token (UDT) and its tokenomics.
sidebar_position: 1
---

The Unlock DAO Tokens — previously known as Unlock Discount Tokens — (UDT) are the governance tokens for the Unlock Protocol. Holders of UDT collectively form the [Unlock DAO](./unlock-dao.md).

:::info
UDT are perfectly _optional_. Creators can deploy lock without knowledge of UDT and their members can similarly purchase membership without knowing about UDT.
:::

UDT tokens were created on Ethereum at this address: [`0x90de74265a416e1393a450752175aed98fe11517`](https://etherscan.io/token/0x90de74265a416e1393a450752175aed98fe11517), and have also been bridged to multiple side-chains and networks such as Polygon, Gnosis Chain and others. The DAO may decide to add support for more networks.

The contract uses OpenZeppelin's ERC20 libraries. It was initally deployed to be upgradable but the proxy admin renounced its role, making the contract not upgradable anymore.

As of April 2023, the supply of UDT is fixed and no new UDT can be minted.

## Key concepts

- **Gross Network Product** This is the protocol's equivalent to a country's gross national product or income. It is the sum of all the value excchanged on a network. Since locks can be priced in any ERC20, the Unlock contract will consult local oracles (Uniswap) and convert the ERC20 price into the networks's native currency
- **Referrer** an account address that can be set on any purchase (or renewal) transaction. This address should be considered to be the "implementer's" address but can be left up to the user.

## Earning UDT

The protocol aims at being governed by its implementers and users. As such, it automatically distributes UDT tokens on every _purchase_ of a membership, on applicable networks. When making a key purchase, the application sending the transaction can optionally add a `referrer` address to its transaction. This address will receive UDT, if applicable.

> Example: Alice has deployed a lock (membership contract). Bob wants to purchase membership key from that lock. Bob uses an application created by Carol. The application will prompt Bob to submit a transaction through their wallet. This transaction has been constructed by Carol's application and Carol includes an address of hers as the `referrer`. After the transaction, Alice will receive the price of the membership paid by Bob, Bob will receive a membership NFT from Alice's contract and Carol will receive UDT tokens to join the protocol's governance.

### Reward

The amount of tokens distributed is calculated by the Unlock contract based on several factors, including the gas consumed by the purchase transaction and the contribution to the gross network product (the gross network product or GNP is the sum of the value of all transactions sent to the network).

On the most popular [networks on which the Unlock protocol](../core-protocol/unlock/networks) has been deployed the Unlock contract owns a share of the governance tokens. These have been transfered from the DAO (or allocated by the Unlock Labs team as a way to boostrap adoption). These tokens are the ones that are distributed on each transaction.

On each purchase (or renewal) transaction, the membership contract will invoke the Unlock contract. The Unlock contract will then consider the _value_ of the transaction (using an on-chain oracle if needed) relative to the sum of the values of all previous transactions (the gross network product). The Unlock contract also considers its own balance of tokens to determine exactly how many tokens should be distributed to the `referrer` address.

Formula: If `N` is the amount of tokens owned by the Unlock contract. For a GNP (gross network product) growth of `𝝙`, the reward is `N * 𝝙/(2*(1+𝝙))`. This number is between 0 and 0.5 for any `𝝙` between `0` and `Infinity`, which means that even if the GNP where to grow by an infinite amount (which is impossible of course), the Unlock contract would only distribute _half_ of its tokens...

> Example: if the Unlock contract owns 10,000 tokens, if the previously recorded gross network product is 1,000,000 and the value of the transaction is 10, then, `𝝙` is 1/100,000 and the amount of tokens distributed is about `0.05`.

One of the risks of this approach is that a malicious actor could create a lock with a very higth value and buy memberships for themselves, yielding large rewards of UDT tokens. In order to mitigate that, the amount of UDT paid by the Unlock contract is also **capped** by the gas spent by the transaction (the Unlock contract uses and Oracle to determine the price of UDT tokens).

This design achieves the following characteristics:

- Higher value transactions yield a larger amount of UDT tokens, everything else being equal,
- Earlier transactions yield a larger amount of UDT tokens, everything else being equal,
- The cost of buying UDT on a decentralized exchange is always lower than the cost of sending "fake" transactions to the network in order to collect UDT.

## Protocol Fee

As of Unlock version 13, the protocol includes a "fee switch" but the fee is currently set to be 0%. This value could be changed by [DAO members](./unlock-dao.md) through an onchain proposal and vote.

If the fee amount is larger than 0%, on every transaction for which there is a payment ([`purchase`](/core-protocol/smart-contracts-api/PublicLock#purchase), [`extend`](/core-protocol/smart-contracts-api/PublicLock#extend) or [`renewMembershipFor`](/core-protocol/smart-contracts-api/PublicLock#renewmembershipfor)), the lock contract will send a portion of the payment to the Unlock contract.

The Unlock Labs team will submit a DAO proposal to add a mechanism that lets anyone submit a transaction to the Unlock contract in order to swap some of the fees collected into UDT tokens and burn these tokens.
