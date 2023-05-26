---
title: How the Unlock DAO Implemented Cross-chain Governance
authorName: Clément Renaud
publishDate: May 30, 2023
description: This cross-chain governance design relies on a straightforward idea. The DAO on Ethereum mainnet is the authority that all contracts should listen to. When a proposal is executed, the DAO should send instructions, pass contract calls, and send data across a bridge to all other instances of the DAO on other chains.
image: /images/blog/alphatweet/alphatweet-share.png
---

![alphatweet-share.png](/images/blog/alphatweet/alphatweet-share.png)

## What is cross-chain governance?

The Unlock Protocol moved its governance to a [DAO](https://docs.unlock-protocol.com/governance/unlock-dao) almost two years ago. The protocol has since grown and now supports more than 10 different chains, leading to more complex ways to enforce decisions taken by the community. When all the votes are happening on Ethereum mainnet, how can we make sure that all DAO decisions are reflected correctly across all of the chains where Unlock Protocol is supported? That’s why our team has been working a cross-chain governance toolkit, in order to maintain and upgrade the protocol in a decentralized and automated fashion.

## Life across multiple chains

Technology derived from the original Ethereum experiment has gained momentum and lead to a vast arrays of new chains being deployed, each with their own characteristics. Under the hood, many of these chains have added the ability to execute contract calls by following the original Ethereum Virtual Machine implementation (EVM). The EVM provides a blueprint and ensures compatibility of the code that can be deployed across different chains.

At Unlock Labs, we have long thought that we need to meet our community where they are, and that meant deploying the protocol on [multiple chains](https://docs.unlock-protocol.com/core-protocol/unlock/networks). Our role is not to choose which chain/L2 on which developers choose to deploy their membership contracts. As an open protocol, that decision should be up to the community, and that decision should be permissionless. At the same time, it is also critical that the protocol acts the same across the board, regardless of what chain it is being run on.

## Why cross-chain governance?

While a simple upgrade or change in protocol settings on one network may require just a single call, living across 10+ disparate networks means that even a simple settings tweak quickly become quite a tedious process to manage and deploy. We decided to work towards the automation of a cross-chain solution for a number of reasons:

1. **Consistency**: We need to make sure that any change that happens somewhere is replicated everywhere, so the experience of using the protocol is consistent across chains
2. **Reduce risk of deployment errors**: On each chain, the set of contracts are deployed at [different addresses](https://www.npmjs.com/package/@unlock-protocol/networks). To make all upgrades manually introduces the possibility of errors. Even if to err is human, we love to avoid it as much as we can.
3. **Transparency**: While changes in the protocol are [voted on in the Unlock DAO](https://unlock-protocol.com/guides/delegation/), the execution and enforcement of these changes is left entirely to human discretion. We pursue the goal of making Unlock a decentralised organization and therefore like to transfer that burden to auditable contracts.

## How it works: the Unlock Owner

Our design relies on a straightforward idea: the DAO on Ethereum mainnet is the authority that all contracts should listen to. When a proposal is executed, the DAO should send instructions across the bridge to all other instances of Unlock. To enable the cross chain governance process, we have to pass contract calls and data across chains. For that we rely on the [Connext Bridge](https://www.connext.network/).

A new contract called `UnlockOwner` acts as a relay in this process, receiving the calls from the DAO across the bridge (or directly on mainnet) and passing it down to the correct contract in the protocol. It has mainly two functions: 1) upgrade the Unlock contract (core of the protocol) and 2) change settings of the Unlock contract itself (e.g. add a new template or tweak a parameter).

In technical terms, `UnlockOwner` is deployed on each network. It owns (as in owner of an [Ownable contract](https://docs.openzeppelin.com/contracts/4.x/access-control#ownership-and-ownable)) both the Unlock contract instance and the ProxyAdmin (that controls the proxy upgrades).

![IMG_1257.HEIC](How%20the%20Unlock%20DAO%20Implemented%20Cross-chain%20Governa%209898c687d4eb4948b14b5a2df959e40d/IMG_1257.heic)

*Schematics of how calls circulate across the bridge and through Unlock Manager on multiple chains*

## Risks and safeguards

Automating the governance process facilitates the propagation of decisions. This also means a bad actor could introduce malicious actions that then spread faster to the entire protocol. We set up all relevant origin and destination checks within the contracts themselves, but we also took extra precautions.

To mitigate the risks of a protocol-wide attack, we set up two main tools:

1. **A safety delay**: Every contract call arriving from the DAO across the bridge will be quarantined for a duration of at least two days. That leaves some room to act if any malicious calls were to be sent. Note that this time period comes *after* the delay introduced by the DAO itself. For that, we rely on [OpenZeppelin's Timelock contract](https://docs.openzeppelin.com/contracts/4.x/governance#timelock) that has been audited multiple times.
2. **Multisigs**: On each chain, a multisig owned by our team and trusted members of the Unlock community retains the ability to trigger actions through the `UnlockOwner` contract. We believe this is still a requirement at this stage as a safeguard. Protocol-wide upgrade across chains is a radically new approach. As such processes of governance are maturing, we hope multisigs could become obsolete and we have built a way in the `UnlockOwner` to remove them. We believe this will happen in due time.

## Try it now !

As of today, the cross-chain governance process is already deployed on ETH Goerli and Polygon Mumbai testnets. We redeployed a DAO on Goerli (which acts as a "mainnet" for testnets) and are still testing how various calls behave and how our current approach could be improved. 

We encourage you to check proposals on our [Unlock Test DAO](https://www.tally.xyz/gov/unlock-test-dao). Any feedback will be warmly welcome!

Below the addresses of deployed test instances (nb: these may change over time as we redeploy the contracts).

**Goerli**

| Unlock  | https://goerli.etherscan.io/address/0x7fA9F695856269E1415b2d373b35037159E2F94C |
| --- | --- |
| UDT | https://goerli.etherscan.io/address/0xaB82D702A4e0cD165072C005dc504A21c019718F#readProxyContract |
| Gov | https://goerli.etherscan.io/address/0xDcDE260Df00ba86889e8B112DfBe1A4945B35CA9 |
| Timelock | https://goerli.etherscan.io/address/0xD7477B7c0CdA4204Cf860e4c27486061b15a5AC3 |
| Unlock Owner | https://goerli.etherscan.io/address/0x6E74DC46EbF2cDB75B72Ab1dCAe3C98c7E9d28a1 |
| Dashboard | https://www.tally.xyz/gov/unlock-test-dao |

**Mumbai**

| Unlock | https://mumbai.polygonscan.com/address/0x8db6eE991C6C3CB2b6228b558c1b3D6EA474cB42#writeProxyContract |
| --- | --- |
| Unlock Owner | https://mumbai.polygonscan.com/address/0xdc230F9A08918FaA5ae48B8E13647789A8B6dD46 |
