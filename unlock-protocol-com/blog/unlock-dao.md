---
title: Unlock DAO
subTitle: Marching toward full decentralization
authorName: Julien Genestoux
publishDate: Sep 28, 2021
description: As of today, our community can submit and vote on proposals, as well as spend some of the UDT treasury!
image: /static/images/blog/launching-unlock-discount-tokens/decentralized-unlock.jpg
---

From the beginning, our goal has been to build a **shared infrastructure**. The protocol itself should belong to its users and implementers, not to Unlock Inc. A few months ago, we released our governance token, [the Unlock Tokens](/blog/unlock-tokens-launched).

In the same way that new airline miles are created for every flight, new UDT are minted for every Unlock transaction (but contrary to airline miles, fewer and fewer are created). ([read more about the tokenomics there](https://docs.unlock-protocol.com/governance/the-unlock-token))

The purpose of these tokens is to **give control and power to the developers, creators and users** of the protocol. Today, we're announcing that we launched the Unlock DAO.

![kale nixon](/static/images/blog/launching-unlock-discount-tokens/decentralized-unlock.jpg)

## What is the Unlock DAO?

There are many ways to think about Decentralized Autonomous Organizations. One way to think of it is as a system are working together toward a shared goal, by leveraging the internet and its networks as their main collaboration tool.

For the Unlock DAO, the participants are anyone who owns our governance token (or, as anyone who uses the protocol can earn some, anyone who used the protocol, even only once)

Similarly, the goal is the development of the protocol. This includes the technical aspects (writing new features in the core contracts), but also the marketing aspects (promoting the protocol), or even operational ones around the DAO itself.

The tools we use are the UDT tokens to get started, as the way to establish voting, but also a [brand new Governance contract](https://etherscan.io/address/0x7757f7f21f5fa9b1fd168642b79416051cd0bb94). The Governance Contract uses OpenZeppelin's libraries ([see our code](https://github.com/unlock-protocol/unlock/blob/master/smart-contracts/contracts/UnlockProtocolGovernor.sol)) and sets the process through which the DAO makes decision. To get started, we set a few defaults for these rules, but they can be altered by the community.

## Making decisions

The Governance process includes 4 steps.

### 1. Delegating tokens

This is the first step and maybe the most important one. For many reasons, we don't expect all the UDT holders to vote on all propositions. For this, token holders can delegate their votes to anyone, and letting that address vote "on their behalf" for all proposals. Delegation can be changed at any point.

I want to insist on the fact that this is a crucial point as it ensures that voting is done a representative way: the more people delegate, the more "legit" a decision is! If you own any UDT, [you should delegate NOW](https://unlock.community/t/start-delegating-now/125/2).

### 2. Making a proposal

We decided that any token holder can make proposals. A proposal is basically a decision that gets executed "on chain". An example of proposal may be "send X Ether to Address Y", or "Swap X UDT to Ether", or "Deploy this contract which pays out delegates who have voted in the last 5 votes"... etc.

It's important to realize that Unlock Inc. has no way to force a decision to be executed or one to NOT be executed, and no way of limiting what users will submit as proposals.

### 3. Voting

Once a proposal has been submitted, it becomes available for voting in the next block (almost instantly). All delegates are invited to vote for 8 days. They can vote for (yes) or against (no) any proposal and the weight of their vote is based on the number of tokens that is collectively owned by all of the addresses who have delegated to them, at the time of the proposal. (it is useless to buy votes once a proposal has been submitted).

At the end of the period, the smart contract looks at the number of votes (quorum) and the proportion of approvals. We picked a quorum of _15,000 votes_. If quorum is not reached, the proposal has failed and nothing happens. Similarly, if the majority has not approved, the proposal has failed and nothing happens.

### 4. Execution

However, if the proposal is approved (majority of votes in favor), then the proposal gets sent to a time-lock contract. This contract is where the transaction will sit for 1 week, before being finally executed!


## Collaborating

The pre-requisite to any proposal is that all (or at least a majority of) token holders have delegated their votes. It is a critical step because _without it, no proposal can ever reach quorum_.

Additionally, we believe that it is critical for the community to discuss ideas prior to their submissions as proposals, as this helps delegates make informed decisions about their votes and helps prepare for consensus.

A few months ago, we launched the Unlock [Community forums](https://unlock.community/). We believe they are a good place for discussions to happen and we welcome them there! Of course, discussions can also happen anywhere online if the community adopts it.

Finally, we collaborated with the Tally team to make sure their front-end for DAOs was working well for our Governance contracts. It provides a [good interface](https://www.withtally.com/governance/unlock) for people to delegate their votes as well as submit proposals.

## Token Allocation

As part of the DAO launch, the Unlock Inc. team has allocated 10% of the pre-mine to the DAO. This first allocation provides a budget to the community who can already start to use the funds as they want. The allocation has been done through 2 mechanisms:

- 5,000 UDT immediately available. [first 'test' transaction](https://etherscan.io/tx/0x8d726c90d70817d8b865c13a38b85689f22fc9ab030db3a1742bdb5eefee3a92) and [second transaction](https://etherscan.io/tx/0xb220c3a5adfb633635ab056a65f83083847f0dc5c94eba26c84207270106807d),
- 95,000 UDT [distributed through a Sablier stream for 1 year](https://app.sablier.finance/stream/100400).

It is important for us to make sure that the DAO gets funding with vesting to ensure that not all tokens are spent immediately.

Additionally, we are transferring ownership of the LP tokens for the Uniswap V2 pool ([tx1](https://etherscan.io/tx/0x91d19da260fae927a2eb28fa6655838e1a32e226da6d82144753af2517042b9c) and [tx2](https://etherscan.io/tx/0x3733c7f6bdd42f3aa1e3478b661c32a214180be10d24e188f857d8f4ef3a2a88)) which was created at launch time in order to have a public price (as it is used to determine how many UDT are minted for the referrer on key purchases).

This is a _first_ allocation. We hope the community uses these funds to foster adoption of the protocol and we're excited to see the first few proposals!

## What is next?

Unlock Inc. has a few more important announcements to make in the next few weeks, especially around rewarding our early users and adopters, as well as around delegation. Our goal is to eventually fully decentralize the protocol by giving full control of the protocol to its community of users and developers. Please stay tuned!