# Unlock

This is our "factory" contract **(Unlock.sol)** and has several roles.

**Deploying Locks**: Locks are deployed through the Unlock smart contract. This is important because the Locks will actually invoke the Unlock smart contract when keys are sold and the Unlock smart contract will check that the invoking lock has been deployed through it.

**Keeping Track of the Unlock Discount Tokens**. [Unlock Discount Tokens](../../governance/unlock-dao-tokens) are ERC20 tokens that implement the Unlock network referral program to let users of the protocol govern it. The Discount Tokens are granted when keys (NFTs) are purchased.

### Contract Ownership

As of summer 2021, the unlock contract is **owned** by a multi-sig wallet managed by Unlock Inc. Our goal is to move toward decentralization by transferring ownership of the Unlock contact to [the Unlock DAO](../../governance/unlock-dao/).

This contract is upgradable using OpenZeppelin's upgradability framework. As of now, the ProxyAdmin is **owned** by a multi-sig wallet managed by Unlock Inc. Our goal is to move toward decentralization by transferring ownership of the Unlock contact to the [Unlock DAO](../../governance/unlock-dao/). Each implementation is versioned. The method `unlockVersion()` will yield the current version.
