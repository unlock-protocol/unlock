# Unlock

This is our "factory" contract **(Unlock.sol)** and has several roles.

**Deploying Locks**: Locks are deployed through the Unlock smart contract. This is important because the Locks will actually invoke the Unlock smart contract when keys are sold and the Unlock smart contract will check that the invoking lock has been deployed through it.

**Keeping Track of the Unlock Discount Tokens**. [Unlock Discount Tokens](../../governance/unlock-dao-tokens) are ERC20 tokens that implement the Unlock network referral program to let users of the protocol govern it. The Discount Tokens are granted when keys (NFTs) are purchased.

### Contract Ownership

As of summer 2021, the unlock contract is **owned** by a multi-sig wallet managed by Unlock Inc. Our goal is to move toward decentralization by transferring ownership of the Unlock contact to [the Unlock DAO](../../governance/unlock-dao/).

This contract is upgradable using OpenZeppelin's upgradability framework. As of now, the ProxyAdmin is **owned** by a multi-sig wallet managed by Unlock Inc. Our goal is to move toward decentralization by transferring ownership of the Unlock contact to the [Unlock DAO](../../governance/unlock-dao/). Each implementation is versioned. The method `unlockVersion()` will yield the current version.

# Changelog

## Version 13

**Released**: Feb 2024

The main novelty in the version 13 of Unlock is a “swap and burn” feature that allow fees collected by the protocol to directly decrease the supply of UDT in circulation.

### **How it works**

- Fees are collected by the Unlock contract when a membership or subscription key is purchased or extended
- Fees are kept by the main Unlock contract, and can be denominated in any native or ERC20 currencies
- By calling the `swapAndBurn` function, the collected fees are sent from the Unlock contract to a contract that will 1) convert the tokens for the collected protocol fees to UDT (using Uniswap) and 2) send those UDT tokens to a burn address

In earlier versions of the protocol, UDT governance tokens were distributed by the Unlock contract using a developer reward. This is now deprecated and should be replaced by the protocol fee. The protocol fee is not enabled by default, and it will be up to the DAO to enable it now that the tools are in place.
