---
title: Unlock Protocol Upgrade Introduces Swap and Burn Mechanic
subTitle: Improved mechanics for UDT token governance, improvements in existing features, gas optimisations and bug fixes
authorName: Clément Renaud
publishDate: Jan 9, 2024
image: /images/blog/protocol-upgrade-unlock-v13/swap-burn-share.png
---

We are releasing a new version of the core Unlock Protocol smart contracts. This upgrade includes improved mechanics for UDT token governance, several improvements in existing features, gas optimisations and bug fixes.

The main novelty is the new “swap and burn” feature that will allow fees collected by the protocol to be directly decrease the supply of UDT in circulation.

The new Unlock Version (v13) and PublicLock version (v14) will be released using a cross-chain DAO proposal that, once passed, will deploy the upgrade on multiple chains at once.

![UDT Swap and Burn](/images/blog/protocol-upgrade-unlock-v13/swap-burn-share.png)

## Swap and Burn: Linking governance tokens and protocol fees

The previous version of Unlock allowed for the collection of a fee by the protocol itself during the purchase of keys. This update introduces a way to use the collected fee to decrease the supply of UDT governance tokens that are in circulation - see https://github.com/unlock-protocol/unlock/issues/11677 ).

### **How it works**

- Fees are collected by the Unlock contract when a membership or subscription key is purchased or extended
- Fees are kept by the main Unlock contract, and can be denominated in any native or ERC20 currencies
- By calling the `swapAndBurn` function, the collected fees are sent from the Unlock contract to a contract that will 1) convert the tokens for the collected protocol fees to UDT and 2) send those UDT tokens to a burn address

In order to use this new Unlock feature, a [proposal](https://www.tally.xyz/gov/unlock/proposal/100059804931848205636207929448466054900176756075596411717092086523182317853614?chart=0) was initiated to migrate the DAO’s UDT liquidity from the existing Uniswap V2 pool to a new V3 pool.

In earlier versions of the protocol, UDT governance tokens were distributed by the Unlock contract using a developer reward that is now deprecated and should be replaced by the protocol fee. The protocol fee is not enabled by default, and it will be up to the DAO to enable it now that the tools are in place.

## Other protocol changes in this protocol update

Several other changes and improvements have been implemented in this set of updates.

### Minor changes in features

These changes are user-facing and affect what Lock Managers can do.

- Introduces `setKeyExpiration` to allow a lock manager to update the timestamp of any existing keys freely ‣
- Modifies `getHasValidKey` so a hook has a final say while determining the validity of a key https://github.com/unlock-protocol/unlock/pull/12543
- Allows a lock manager to always transfer keys, even when transfers are disabled ‣
- Disables fees for lock managers when transferring or sharing a key https://github.com/unlock-protocol/unlock/pull/13087

### Fixes, gas optimisations and refactoring

These changes are lower level and are noteworthy for advanced users and developers.

- Split code into a `governance` folder that contains all tools related to the maintenance of the protocol (deployments, contract verification, DAO proposals tooling, Uniswap tools, etc)
- Replace `UnlockUtils` dependencies by optimized Open Zeppelin implementation - https://github.com/unlock-protocol/unlock/pull/12852
- Upgrade dev tooling (looking for more help on this, there is an open bounty !)
- Remove dev reward/cut when purchasing a key https://github.com/unlock-protocol/unlock/pull/12700
- Add unchecked scopes on math operations (gas optimisation) https://github.com/unlock-protocol/unlock/pull/12542
- New Solidity version 0.8.21 (creating issues on some chains that wont support new `PUSH0` evm opcode -see [https://www.zaryabs.com/push0-opcode/](https://www.zaryabs.com/push0-opcode/) ) https://github.com/unlock-protocol/unlock/pull/12703
- Fix potential overflow when merging keys https://github.com/unlock-protocol/unlock/issues/12553

## Upgrading across chains: The DAO proposal

The upgrade will be sent using a cross-chain proposal, following the [pattern recently introduced and tested](https://www.tally.xyz/gov/unlock/proposal/1926572528290918174819693611122933562560576845671089759587616947457423587439?chart=0) for Unlock Protocol governance across chains. Through a single proposal, the protocol upgrade will be carried on six different networks : Optimism, Gnosis, Polygon, Arbitrum, BNB Chain, and mainnet. The remaining chains will be upgraded through the secondary workflow using Unlock Labs multisigs.

### How the DAO proposal for a protocol upgrade works

The DAO proposal will contain all calls necessary to be executed on the supported chains. Before sending the proposal, we will deploy the implementation contracts for `Unlock` version 13 and `PublicLock` version 14, as well as the new `UnlockSwapBurner`contract. Then the DAO proposal contains 4 calls for each chain:

- Upgrade Unlock contract to the latest version (through `ProxyAdmin` contract)
- Call `addLockTemplate` to set v14 template
- Call `setLockTemplate` to update `publicLockVersion` default version to v14
- Call `setSwapBurner` to set `swapBurnerAddress` on Unlock

After/if the voting period ends successfully, the DAO proposal can be executed, sending all calls to their destination chains through Connext bridges. The call will be held for a cooldown period of 7 days. You can read more about the process in this [dedicated post](https://unlock-protocol.com/blog/crosschain-connext-safe).

### Timeline for the next steps

- Mid January 2024: Deploy protocol upgrade on the Sepolia network for testing
- Late January 2024: DAO proposal submitted for production deployment

## Upgrading your lock contract

If you are a lock manager, you will need to upgrade your lock contract to take advantage of the new features and improvements. To do so, follow the instructions provided in the [Unlock documentation](https://unlock-protocol.com/blog/lock-v12-release).

If you have any questions or issues with the upgrade process, please reach out to our support team at [support@unlock-protocol.com](mailto:support@unlock-protocol.com).
