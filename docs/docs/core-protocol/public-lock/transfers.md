---
title: Transfers
description: The Public Lock contract implements the ERC721 specification, including transfer functions, but their behavior can be customized!
sidebar_position: 4
---

The Public Lock smart contract implements the [ERC721 specification](https://docs.openzeppelin.com/contracts/2.x/api/token/erc721), including transfer functions (`transferFrom`, `safeTransferFrom`, and the related `approve` and `setApprovalForAll`), but their behavior can be customized.

:::info
Expired keys **can not** be transferred.
:::

## Key Managers

Each NFT (called a key in the Unlock Protocol) has an `owner`. Additionally, it may have a `key manager`. The `key manager`, if set, is the address that **has the transfer rights** over this specific key. This should not be confused with the `lock manager` (see the [contract management](./access-control.md) section for a summary of the role on a lock contract)

The key manager can be set at the time of [minting](./minting-keys.md), either on purchases or on airdrops. Lock managers can also change the key manager for any key.

You can read more about the roles in the [contract management section](./access-control.md).

By setting a custom key manager on a key, the lock manager can disable transfers for this key (or at least make them only possible by the key manager).

:::info
When a transfer happens using `transferFrom` or `safeTransferFrom`, the lock manager is reset.
:::

## Fees on Transfers

Many NFTs have the concept of **royalties**. Lock managers can apply royalties to their locks, especially using a [royalties registry like that one](https://royaltyregistry.xyz/lookup). It is important to note that these royalties **cannot be systematically enforced** and rely on the adoption by the platforms and exchanges on which NFTs are traded.

However, inside Unlock Keys, the contract includes a unique feature to monetize secondary market transactions. The contract includes the ability to "burn" time upon transfers.

Let's take an example. A user, Jane, owns an NFT membership valid for ten more days. The contract includes a 10% fee on each transfer. If Jane transfers her NFT to Claire, Claire will receive the key, but when she receives it, the expiration will have been reduced to 9 days.

This mechanism is fully on-chain, and there is no way to bypass it.

### Disabling Transfers

The lock also has a mechanism to fully disable transfers for _any_ key, regardless of any other consideration, by setting a transfer fee of 100%. (you can use the lock's settings page on the [Unlock Dashboard](https://app.unlock-protocol.com/) or any block explorer.)

This means that the membership NFT becomes a **Soul Bound Token** (SBT). Importantly, a lock manager can always bypass this by transferring a key to another address, which is a handy feature when a user loses access to their wallet.

## Advanced

The Public Lock contract also includes some advanced mechanisms that applications can use to provide custom experiences.

### Lending

By decoupling the key's "owner" and the "manager", the contract includes the ability to _lend_ a key with the `lendKey` function. When lending a key, its manager is able to change the owner to a different address. Of course, the new owner does **not** have transfer rights, and the key manager can easily retrieve the key using the `unlendKey`.

This can be useful in several contexts, including collateralization, where a key owner could borrow against one of their NFTs by assigning the key manager role to a 3rd party contract. Of course, if the owner does not repay their debt in time, the NFT can be transferred away by the contract who is acting as key manager.

### Sharing

Another unique feature of the Public Lock contract is the ability to _share_ a given membership. This feature works by transferring time from a given membership NFT to another membership NFT, rather than transferring the NFT itself.

This is subject to the transfer fees detailed above.

One of the core applications of this feature is to incentivize members to share previews of a membership.

### Hooks

Transfers are one of the most critical aspects of the Public Lock contract, and the base set of features supported by the contract covers the most frequent user interactions. However, the smart contract also includes [hooks](./hooks.md) that can be used to alter its behavior.

Using the `onKeyTransferHook`, a third-party contract can be triggered to perform custom actions when a transfer happens. For example, you can use this hook to implement custom logic on whether transfers should be enabled.
