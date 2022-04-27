---
title: Moving forward with decentralization!
subTitle: As of today, the UDT contract is now fully governed by the DAO
authorName: Julien Genestoux
publishDate: April 27, 2022
description: The UDT contract ownership has been transfered to the DAO and the community is now in full control of it!
image: /images/blog/decentralize-udt.png
---

Last fall, when we [introduced the Unlock DAO](/blog/unlock-dao), we confirmed that our goal was to grant full control of the protocol to its community of users and developers. Today, we're moving forward: the DAO now has control over the UDT token contract itself.

## The UDT contract

The _Unlock Discount Token_ is the governance token of the DAO. Members of the DAO can vote on proposals and snapshots based on how many of these tokens they own, as long as they delegated these tokens. It's an ERC20 token implemented using the proven libraries from [OpenZeppelin](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20) and includes features required from governance, minting... etc.

From the beginning, we anticipated that the token would need to evolve to support new use cases, so we chose the _Upgradable_ versions.

The contracts have also been [audited by 3 independent teams](https://docs.unlock-protocol.com/unlock/developers/smart-contracts/audits).

## Upgrades through Governance

Until now, the upgrade could only be triggered by the Unlock Inc. team multi-signature wallet. As of today, we have transferred ownership to the DAO Timelock contract, which means that the only way to trigger updates is through DAO proposals: Unlock Inc. **cannot** arbitrarily do these changes anymore.

Since the contract is upgradable, the community can now decide of how the UDT control behavior should evolve. Community members are encouraged to prepare upgrades, extensively test them and submit them to the DAO for voting!

Of course, Unlock Inc. _will_ submit proposals. For example, we are considering that it could be useful to support [`L2StandardERC20`](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts/contracts/standards/L2StandardERC20.sol) in order to bridge the governance tokens to Optimism or other L2.

## UDT distribution

As of today, we are also resuming the distribution of UDT on every transaction on Polygon. In order to ensure that all users of the protocol are offered the ability to join our governance, every transaction optionnaly includes a "referrer" address. On mainnet, new UDT are minted ([example](https://etherscan.io/tx/0x8ac364bc429b20b35269393d2261892eb83239392586f7f75b9ec82b28a6acf8)), on sidechains and Layer 2 ([example](https://polygonscan.com/tx/0xcca8648a9fb265acfbfeb6f332de36b4dfa6ae9ffc834affc5701f69d9f2c96f)), some tokens have been bridged from the mainnet and are distributed from the _local_ Unlock contract.

The amount of tokens minted is capped by the actual contribution to the networks' gross network product (i.e. a free membership will not yield any UDT), as well as by the actual gas spent (using the chain's current `baseFee`).

## Onward

We're committed to transfering ownership of the core protocol to the DAO, as we believe protocols are public goods whose ownership should be shared among their adopters and users. Over the next few months, we'll keep on giving more control and ownership of the core protocol's contract until the Unlock Inc. core team is _just_ another member of the community :)
