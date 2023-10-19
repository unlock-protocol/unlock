---
title: Implementing Cross-Chain DAO Governance with Unlock Protocol, Connext and Gnosis Guild
authorName: Clément Renaud
publishDate: October 16, 2023
description: Unlock Labs partnered with Connext and Gnosis Guild to create this first-of-its-kind architecture that passes not only tokens between networks. It passes code changes across bridges.
image: /images/blog/crosschain/cross-chain-share.png
---

![cross-chain-share.png](/images/blog/crosschain/cross-chain-share.png)

In service to the Unlock DAO, the Unlock Labs team has been working on [an ambitious project to implement cross-chain DAO governance](https://unlock-protocol.com/blog/crosschain) to ensure consistent protocol behavior across variety of EVM-compatible networks where Unlock Protocol has been deployed. 

When the Unlock DAO approves a proposal that affects the operation of the core Unlock Protocol, those changes are propagated via bridges across the various chains to keep the protocol’s behavior consistent, regardless of which chain is being used to deploy an Unlock Protocol smart contract. 

Unlock Labs partnered with [Connext](https://www.connext.network/) and [Gnosis Guild](https://gnosisguild.org/) to create this first-of-its-kind architecture that passes not only tokens between networks. *It passes code changes across bridges*. 

Here’s a quick FAQ on why this matters and how it works.

### How does this integration simplify the governance process across different blockchain networks?

The cross-chain process makes the overall DAO management process more straightforward, as the Governor contract on the Ethereum mainnet becomes the single source of truth for Unlock Protocol. Once a proposal for a change is ratified there, the change will propagate to other chains directly.

Previously, each proposal had to be sent separately to a different multisig on each network to reflect changes, which was a detailed, cumbersome, and manual process.

### How does this integration impact the overall maintenance and workflow of cross-chain governance?

The maintenance of the protocol is simplified as steps to propagate a DAO decision from mainnet to other chains is now automated. Before, the manual steps could lead to errors or mistakes.

A single DAO proposal can now lead to a version upgrade in protocol contracts or a change in protocol settings that cascades across multiple chains directly. This previously required separate manual intervention to implement a change, for each and every network.

As part of this project, Unlock Labs also developed and improved tools to write, test, and submit DAO proposals. DAO proposals can now be written in the form of a full js script, allowing for different kinds of interactions (e.g. interactions with 3rd party libraries, contract deployments, and more) as part of the [proposal](https://github.com/unlock-protocol/unlock/pull/12790).

### How does the implementation benefit the members of the Unlock DAO?

For members of the DAO, the cross-chain process allows them to gain more control and insight about what is happening across the entire protocol. Before this upgrade, the “upgrade” part of the protocol was partially centralized with Unlock Labs team. In the spirit — and action — of progressive decentralization, any Unlock DAO member can write and submit a proposal that can be reflected across the many chains where the protocol has been deployed.

### Does this implementation enhance security or efficiency in cross-chain DAO governance?

This new implementation helps the Unlock Protocol ecosystem execute more efficiently, since approved proposals will propagate more quickly across the various networks with reduced overhead. 

Security, as usual, is a double-edged sword. On one side, a single proposal can apply changes across multiple chains making audit and tracking of calls easier, and the protocol more consistent (for instance in case of an upgrade, which in the past could result in different protocol versions across different chains). 

Of course, the converse is also true — a potential error will propagate more quickly to the other chains. This upgrade includes multiple safeguards, including a cooldown process for transactions when they arrive on destination chains with the ability to cancel a malicious transaction during that cooldown period. A timelock allows quarantining a call after it has crossed the bridge. 

The main concern is to have a mechanism to prevent the execution of a malicious call in case the bridge itself is ever compromised.

### How does this implementation contribute to the broader goal of decentralization in web3?

Unlock Protocol's DAO (with a D as in “Decentralized”) aims at building tools for the community of Unlock Protocol developers, users and stakeholders to manage the protocol themselves, without intervention from the Unlock Labs core team. 

This cross-chain governance process puts management of contracts previously only managed by Unlock’s team multisig in the hands of the Unlock DAO. By doing so, Unlock also stands at the forefront of experiments in protocol governance by proposing a complete, auditable, and transparent way to make changes in the protocol when necessary.

### What was the role of Connext in this architecture?

Connext provides the bridge technology that is necessary for taking the calls contained in the DAO proposal from mainnet to the other chains. The Connext bridge effectively conveys the instructions to execute across chains.

### What was the role of Safe in this architecture?

Safe provides the receiving end of DAO proposals on destination chains. When a call is sent from the DAO’s Governor contract, it crosses the bridge towards a Safe that receives it.

Gnosis Guild’s Zodiac suite of modules allows for a Safe to 1) receive calls properly from the bridge and 2) put a call in quarantine for a cooldown period once it is received.

Unlock Protocol has historically relied on Safe for the management of the protocol contracts. By reusing and building on the same tech, the changes required for the protocol governance are kept to a minimum to avoid potential security issues.

### Things we learned along the way

There were multiple challenges along the way, as we were in radically unexplored technical territory. When we started [working on this idea earlier this summer](https://unlock-protocol.com/blog/crosschain), Connext had recently been launched. At that time, each call took more than 5 hours to cross a bridge, making things a bit tedious to test sometimes. Also, the lack of some tooling on testnets made for some development challenges.

In the time since the first iteration of this architecture, Connext developed integration with the *extremely* helpful Zodiac module solution, which was audited and maintained by their own team.

We discovered a few issues integrating with the contracts during the process, and were able to work very closely with the Gnosis Guild team, who were incredibly responsive when issues arose during the development. 

### The bottom line: This is complex stuff!

As an industry, it’s clear that we are just at the beginning of this journey. There is still a long road ahead for DAO tools and lots to build, and projects like this require coordination and collaborative effort across many parts of the ecosystem.

Work on governance is hard, as tools are still in a very early stage. 

**Unlock Labs wants to give a big shout out to the teams at [Connext](https://www.connext.network/) and [Gnosis Guild](https://gnosisguild.org/), who are not only at the top of their technical game, but who are also a blast to work with!**
