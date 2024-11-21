---
title: Contract Management
description: >-
  A description of the updated contract management system for Unlock Protocol "Lock"
  contracts.
sidebar_position: 5
---

# Contract Management

## Definitions

First, let's define the elements of our Contract Management system for the purposes of this document.

### Roles

We use the term "Role" to refer to a collection of permissions which may be added to (or renounced by) a user. Roles are implemented at the Lock level using the pattern described [here](https://docs.openzeppelin.com/contracts/2.x/access-control#role-based-access-control). Multiple users may have a given role simultaneously. The Lock contract has 2 Roles associated with each Lock:

#### _LockManager_

The creator of a Lock becomes the only **LockManager** by default, granting them the highest level of permissions for their lock (More or less equivalent to the former "Owner"). Additional **LockManager**s may be added as needed (only by an existing **LockManager**), and a **LockManager** may also renounce the role. There is a new modifier `onlyLockManager()`, as well as the new functions `isLockManager()`, `addLockManager()`& `renounceLockManager()`.

#### _KeyGranter_

The lock creator is also the default KeyGranter. The primary reason for this role is to support additional purchase mechanisms beyond direct key purchases (think credit-card purchases, where a user pays Unlock with a credit card, Unlock buys the key from the lock, and then grants it to the user). There is a new modifier `onlyKeyGranter()`, as well as the new functions `isKeyGranter()`, `addKeyGranter()`& `renounceKeyGranter()`.

### Titles

Unlike a Role, a Title is implemented at the Key level and confers some of the rights for a given key on its holder. As of v7, we've decoupled the ownership rights from the transfer rights to enable new use-cases. Only one user may hold a title at a time for a given key. The 2 Titles associated with each key are:

#### _KeyOwner_

The owner of a given key (an NFT distinguished by its unique _tokenID)._ The key will appear in this person's wallet( if it supports the erc721 standard), and grants them access to the lock from which the key was purchased. The keyOwner may not transfer, share or cancel their key, unless they are also the keyManager for this key.

#### _KeyManager_

Only the key manager is authorized to transfer, share or cancel keys, and may or may not be the same entity as the key owner depending on how the key was originally acquired. This enables new use cases, such as the ability to "loan" your key to someone temporarily, while retaining the right to take it back when/if needed, or possibly putting keys (NFTs) inside of a vault contract as collateral by retaining ownership, but transferring the keyManager role to the vault itself!

To help understand the keyManager assignment in different scenarios, the following table is provided. It specifies how the keyManager is assigned for each relevant function in each of the 3 key states: **New Key creation, Valid Key extension,** or **Expired Key renewal.**

![Lock Permission Roles Chart](/img/developers/lock-permissions-roles.png)
