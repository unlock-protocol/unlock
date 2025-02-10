---

title: Public Lock  
description: >-  
  Explanation of the Unlock Protocol "Lock" contract PublicLock.sol.  

---  

# Public Lock  

A "Lock" (`PublicLock.sol`) is a customized smart contract for minting (creating) ERC-721 NFTs. It is the Unlock Protocol version of a "minting contract." These contracts are created with the [Unlock](../../core-protocol/unlock/) smart contract, which acts as a "factory" contract. That factory contract uses the [Public Lock](../../core-protocol/public-lock/) template contract along with the configuration options you choose to deploy a new customized smart contract to the blockchain [network](../../core-protocol/unlock/networks) of your choice.

Each lock is a standalone contract with its own deployment, address, and storage.

- Each lock contract is an [ERC-721](https://eips.ethereum.org/EIPS/eip-721) compliant contract capable of creating and managing NFTs (non-fungible tokens, which we call "Keys"), as well as restricting access based on the user's possession (or lack thereof) of one of these keys.
- Keys for one lock are valid only for the lock that created them.
- A given user may own only one key (NFT) at a time by default, but this can be changed using the `setMaxKeysPerAddress` function.

Additionally, the Lock smart contract has multiple capabilities:

- _Administrative_: These are the functions that change rights (see [access control](./access-control/)) associated with the lock or individual parameters such as its name or, of course, its price. Finally, there is a method to withdraw funds from the lock contract itself.
- _Transferring key ownership_: Keys can be purchased from the lock smart contract itself or from another user who purchased one previously. Additionally, keys can be purchased on behalf of another person (this is important because it allows someone to pay gas fees on behalf of someone else).
- _Changing key attributes_: The keys have an expiration date that can be changed (by the lock owner to an earlier date), as well as data attributes, which can be updated to something else.

## Interacting with Protocol Contracts

Here are some popular JavaScript libraries that can be used to interact with blockchain smart contracts, including [Unlock.sol](../../core-protocol/unlock/). You should be able to use _any_ library as long as it lets you import the Unlock Protocol's [contracts ABI](../../core-protocol/).

- [Viem](https://viem.sh/)
- [Ethers](https://docs.ethers.io/)
- [web3.js](https://web3js.readthedocs.io/)

Tools we've built and maintain can be found in the ["Tools"](../../tools/) section of the docs. The following tools can be used for deploying locks:

- [Unlock.js](../../tools/unlock.js) is our JavaScript library for interacting with the protocol. It can be used with node.js on the back-end or on the front-end in the browser. This is the library used by our Dashboard and front-end applications.
- [Unlock Hardhat Plugin](../../tutorials/smart-contracts/deploying-locally) can be used to deploy locally. The plugin includes both tasks that can be added to your own Hardhat script or a CLI.

You can call and inspect the Lock contracts directly using block explorers as well.

## Upgrades and Customization

All locks deployed (version 10 and later) are upgradable by their lock manager through the Unlock contract.

Lock managers can also alter the behavior of their locks through the use of [hooks](./hooks/).

## Changelog

Changelogs can be found here for the last two versions.

### Version 14

**Released**: Jan 2024

Version 14 introduces several changes in user-facing features:

- Introduces `setKeyExpiration` to allow a lock manager to freely update the timestamp of any existing keys.
- Modifies `getHasValidKey` so a hook has the final say in determining the validity of a key.
- Allows a lock manager to always transfer keys, even when transfers are disabled.
- Disables fees for lock managers when transferring or sharing a key.

For advanced users and developers, the lower-level changes below are noteworthy:

- Replaces `UnlockUtils` dependencies with an optimized OpenZeppelin implementation.
- Removes dev reward/cut when purchasing a key.
- Adds unchecked scopes on math operations (gas optimization).
- New Solidity version 0.8.21 (creating issues on some chains that won't support the new `PUSH0` EVM opcode).
- Fixes potential overflow when merging keys.

### Version 13

**Released**: April 2023

This new version improved gas consumption of most functions (by using Solidity custom errors instead of require statements). It also solves issues that appeared when canceling or burning membership keys.

The helper functions `addKeyGranter` and `isKeyGranter` have been removed to reduce the size of the contract. The features are still accessible by calling `grantRole` and `hasRole` with `keccak256('KEY_GRANTER_ROLE')` as the role.

The following feature has been introduced:

#### `isRenewable`

Easily check if a key is ready for renewal.

### Version 12

**Released**: October 2022

The following are the significant changes, and a full list of commits, including bug fixes, can be found [here](https://github.com/unlock-protocol/unlock/issues?q=+label%3A%22publicLock+v12%22+).

#### `onGrantKeyHook` and `onKeyExtendHook`

This allows for registration of custom functionality when keys are granted and when keys are renewed or extended.

#### `setLockMetadata`

The various features to set metadata (name, symbol, and tokenURIs) have been regrouped into this single function.

#### `updateLockConfig`

The configuration for a key’s default duration and available quantity (both per user and in aggregate) has also been grouped into this single function.

#### `expirationTimestamp`

This adds the expiration timestamp on the ExpirationDuration event emitted by the time machine when time gets added or subtracted to/from a key.

#### Events and Schema Changes

- Added a new event `LockConfig`.
- Added `maxNumberOfKeys` and `maxKeysPerAddress` to the lock schema.
- Added `expirationTimestamp` to the `ExpirationChanged` event.

### Version 11

**Released**: August 2022

This new version brings a lot of gas savings as well as a few minor bug fixes. It also introduces the following features:

#### `referrerFees` and `setReferrerFee`

This is the most important addition to the protocol in this version. `referrerFees` allow a lock manager to share their income with the `referrer` when a purchase is made (when calling `purchase`, `renewMembershipFor`, or `extend`). The fee is set as a percentage in basis points (e.g., `1000` is 10%).

A lock manager can call `setReferrerFee` to set specific fees for different referrers. It is possible to set a _default_ fee for _any_ referrer by passing the zero address as the referrer when calling `setReferrerFee`.

The function `referrerFees(address)` can be used to retrieve the fees set for a specific address.

#### `lendKey` and `unlendKey`

These two functions can be used by a key manager to lend a key or recover it. They can only be called by the key manager or the current owner of the key if no manager is set. `lendKey(from, recipient, tokenId)` will set the caller as the new key manager (see [roles](./access-control.md)) and transfer ownership of the key to the `recipient` address. `unlendKey(recipient, tokenId)` will transfer the key to the recipient.

#### `grantKeyExtension`

This new function extends what `grantKeys` is to the `purchase` function: it lets a key granter (see roles) or lock manager change the expiration of a specific key. Unlock Labs uses this function to perform renewals on keys purchased via credit cards.

#### `onKeyTransferHook`

This version introduces a new [hook](./hooks.md) that is invoked when a key is transferred. The hook is called with the following parameters:  
The hook is the final step in the transfer function.

- Address of the lock
- Token ID to be transferred
- Operator (address of the caller)
- Previous owner address
- New owner address
- Expiration timestamp of the key

#### `totalKeys`

This function returns the total number of keys on the lock for a specific address.  
Note: `balanceOf` will return only the number of _valid_ (non-expired) keys in order to stay compatible with token gating tools.

#### Commits:

```sh
14a3eaf29 updated docs for setEventHooks
84f674962 chore(contracts): updated docs (#9339)
cdf9ec219 adding param details for approveBeneficiary (#9333)
7e736ba49 feat(contracts): PublicLock v11 with latest changes (#9229)
59f00d543 add custom duration to `grantKeyExtension` (#9220)
97e134005 feat(smart-contracts): introduces `unlendKey` (#9036)
90dd41950 feat(smart-contracts): add `lendKey`  (#9013)
32c50cb84 fix(smart-contracts): allow to share key with self (#9037)
bd010c0c4 chore(smart-contracts): Remove some statements that were not rendered correctly in docs (#9043)
fa724f1b5 Revert "allow to share key with self"
bfeb8e8f1 allow to share key with self
3d0801c17 feat(smart-contracts): add support for custom referrer fee (#9017)
544e3b6e6 add `_recordKeyPurchase` in `extend` (#9028)
46c3890da fix(smart-contracts): reset original price when a key is cancelled (#9003)
92d582e2b feat(smart-contracts): prevent `transferFrom` from being used when a key manager is set (#9011)
107e1131c feat(smart-contracts): allow `extend`  to update stored keyPrice (#8983)
39bcefc20 fix(smart-contracts): `balanceOf` counts only valid keys (#8999)
a636eae09 feat(smart-contracts): `onKeyTransfer` hook (#8993)
586768d39 fix(smart-contracts): takes into account number of purchases when evaluating sold out (#8982)
4c966ff07 feat(smart-contracts): add `grantKeyExtension` (#8984)
fbc3907af replace unwanted `transferFrom` in erc20 gas refund (#8985)
aa24f9d88 chore(smart-contracts): bump oz libs to latest 4.6.0 (#8948)
0af4e3417 feat(smart-contracts): `purchase` and `grantKeys` return token ids (#8981)
a617fdac8 dedupe zero address check (#8964)
3121df420 feat(smart-contracts): replace revert strings by error codes (#8867)
6bbd5ed58 feat(smart-contracts): bump PublicLock solc version to 0.8.13 (#8945)
305d5bb57 fix(smart-contracts): remove unused logic from PublicLock contract (#8861)
266e183d3 feat(smart-contracts): bump version for Publiclock v11 (#8864)
```  