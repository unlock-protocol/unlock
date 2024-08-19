# Unlock

This is our "factory" contract **(Unlock.sol)** and has several roles.

**Deploying Locks**: Locks are deployed through the Unlock smart contract. This is important because the Locks will actually invoke the Unlock smart contract when keys are sold and the Unlock smart contract will check that the invoking lock has been deployed through it.

**Distribute Governance Tokens**. [Unlock DAO Tokens](../../governance/unlock-dao-tokens) are ERC20 tokens that let users of the protocol govern it. The Governance Tokens are granted when membership tokens (NFTs) are purchased, renewed or extended.

### Contract Ownership

As of summer 2024, on the most active networks, the Unlock contract is **owned** by [the Unlock Protocol DAO](../../governance/unlock-dao/).

The `Unlock.sol` contract is upgradable using OpenZeppelin's upgradability framework. Each implementation is versioned. The method `unlockVersion()` will yield the current version.

# Changelog

## Version 13

**Released**: Feb 2024

The main novelty in version 13 of Unlock is a “swap and burn” feature that allows fees collected by the protocol to directly decrease the supply of UDT in circulation.

### **How it works**

- Fees are collected by the Unlock contract when a membership or subscription key is purchased or extended
- Fees are kept by the main Unlock contract, and can be denominated in any native or ERC20 currencies
- By calling the `swapAndBurn` function, the collected fees are sent from the Unlock contract to a contract that will 1) convert the tokens for the collected protocol fees to UDT (using Uniswap) and 2) send those UDT tokens to a burn address

In earlier versions of the protocol, UDT governance tokens were distributed by the Unlock contract using a developer reward. This is now deprecated and should be replaced by the protocol fee. The protocol fee is not enabled by default, and it will be up to the DAO to enable it now that the tools are in place.
