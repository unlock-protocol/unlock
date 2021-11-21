---
title: 'Smart Contract Upgrade: Version 7'
subTitle: Improvements to the Unlock-Protocol
authorName: Nick Furfaro
publishDate: April 1, 2020
description: V7 focuses on adding new features, revamping our access-control system, & general improvements to the codebase.
image: /images/blog/v7.jpg
---

Some of you may have noticed a huge leap in our version numbers; the last release was v1.3 and now we've jumped to v7. Let me explain the reasoning for this. Since our first release, we've been using 2 different version numbering systems. We've followed semver standards in our published modules, but our smart-contracts (which can be queried for their current version) have used the type `uint` to store this value for simplicity. We've decided to make things more straightforward by using the `uint`-style versioning consistently, which means we don't need to map between 2 different systems internally. Moving forward, version numbers will simply increment each version. The name of the npm-module and the version number returned when querying our contracts for their version will be identical. We've just released v7 of our contracts, and so the newly published module has been cleverly named "unlock-abi-7".

## What's Changed

### Hooks

A feature common to many areas of programming, code hooks give us a way to extend the functionality of a smart contract to meet changing needs & new use-cases. We're adding 2 hooks with v7: A `KeyPurchaseHook` and a `KeyCancelHook`. These are included in the new npm module (`unlock-abi-7`) as interfaces, allowing a vast amount of flexibility in how they're implemented. A couple of example use-cases include adding custom cancellation logic, and adding support for discount codes!

### Support for direct ETH tips

We've modified the fallback function in the PublicLock contract to allow for tips (paid in ETH) to be sent directly to a Lock's address. This was previously not something we allowed. Before v7, `PublicLock.sol` contained a `destroyLock(...)` function which would invoke the built-in `selfdestruct` functionality. The decision to include this function was based on our desire to be good citizens of the ethereum ecosystem, allowing deprecated locks to be destroyed and free up space on the blockchain. Under these conditions, we didn't want anyone to be able to send eth to a Lock which had been self-destructed as these funds would be unrecoverable.
However, it is now generally considered somewhat of an antipattern to use `selfdestruct` in a contract. This is not to say there are no valid use-cases, but for us, the security concerns outweighed the potential benefits and we made the call to remove `selfdestruct` from v7. With this change, there is no reason to block direct eth transfers to a lock anymore, so feel free to tip your creators and show your appreciation!

### Access-Control

We've been using the Ownable pattern for access control since the beginning of the project. If you're not familiar with this, it is often implemented by inheriting from openzeppelin's `Ownable.sol` contract, which gives us some basic functionality to control who may access certain functionality in the derived contract. It works and is probably the simplest way to get started when beginning a project (which is why it's used so often).
As is often the case with the simplest solution, it has its limitations. The main one for us at Unlock is that the Ownable pattern doesn't provide granular control of access. For this reason, we've migrated to using a more role-based access control system (RBAC), based on another openzeppelin contract `Roles.sol`. We're introducing LockManagers, KeyGranters and KeyManagers with v7. We'll be updating our docs in more detail around these changes, but here's an overview.

- LockManagers: This is a new role we've added to replace `owner`. The lock creator becomes the only LockManager by default, granting them the highest level of permissions for their lock. Unlike `owner`, there may be more than 1 LockManager.

* KeyGranters: Also implemented as a role, the lock creator is also the default KeyGranter.The primary reason for this role is to support additional purchase mechanisms beyond direct key purchases (think credit-card purchases, where a user pays Unlock with a credit card, Unlock buys the key from the lock, and then grants it to the user).

- KeyManagers: This is not a role in the same way the previous 2 are. It is more of an internal "title" assigned to a user, and there can only be 1 key manager per key. Only the key manager is authorized to transfer, share or cancel keys, and may or may not be the same entity as the key owner depending on how the key was originally acquired. This enables new use cases, such as the ability to "loan" your key to someone temporarily, while retaining the right to take it back when/if needed, or possibly putting keys (NFTs) inside of a vault contract as collateral by retaining ownership, but transfering the keyManager role to the vault itself!

### General Improvements

One of the underlying themes for this release has been to simplify where possible. On this front, we've moved to Solidity 0.5.17, fixed some minor bugs & compiler warnings, merged similar functions, updated & extended documentation, merged a couple of sub-contracts(Mixins), and added, fixed and refactored several tests.

Overall we think it's a great release with many improvements for internal developers, lock creators and external developers wanting to integrate locks onto their products. We hope you like it and feel free to check out the [code](https://github.com/unlock-protocol/unlock/) anytime!
