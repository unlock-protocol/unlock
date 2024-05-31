---
title: Unlock DAO
description: >-
  The Unlock Protocol is a public good aimed at being governed by a DAO of its
  users and developers.
sidebar_position: 1
---

Collectively, [UDT holders](../unlock-dao-tokens.mdx) are members of the Unlock DAO. The Unlock DAO aims at governing the Unlock Protocol. In order to facilitate decision making, the Unlock DAO uses OpenZeppelin's [Governor Contracts](https://blog.openzeppelin.com/governor-smart-contract/) which can be found at these addresses on the [Ethereum network](https://ethereum.org/en/):

- [Governor Contract](https://etherscan.io/address/0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591) \(`0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591`\): where proposals and votes are handled,
- [TimeLock Contract](https://etherscan.io/address/0x17eedfb0a6e6e06e95b3a1f928dc4024240bc76b) \(`0x17eedfb0a6e6e06e95b3a1f928dc4024240bc76b`\): where proposals are executed and funds are managed.

### Initial settings

The governor contract has been configured with the following initial characteristics:

- Anyone can submit a proposal \(no ownership threshold\)
- Proposal Delay: 6 days
- Voting period: 6 days
- Quorum: 7,500 votes
- Time-lock duration: 7 days.

All of these settings can be changed by the Unlock DAO community through an onchain proposal.

### Allocated funds

As part of the launch of the DAO, Unlock Inc. has allocated the following to the Time Lock contract \(which manages the funds of the DAO\):

- 100,000 UDT that the DAO uses to pay bounties, grants or perform retro-active funding.
- 170.23 Uniswap Liquidity Provider tokens from the UDT/ETH pool
- We have also subsequently transfered the remainder of the first community airdrop to the DAO.

In June 2023, the Governor contract was upgraded from `0x7757f7f21f5fa9b1fd168642b79416051cd0bb94` to `0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591` via a [DAO proposal that the community approved and executed onchain](https://www.tally.xyz/gov/unlock-old/proposal/36208249270120864100503453462134662510103434369621143761091232235939585571890). This upgrade is the result of a vulnerability in the OpenZeppelin library and the new Governor contract is now upgradable.

### Voting

The Governor can execute any transaction as long as the transaction was approved by token holders. These transactions range from transferring some if its own tokens as grants, to upgrading the core protocol, or even changing its own governance parameters.

#### Making a proposal

A proposal is code that will be executed by the Timelock smart contract if it has been approved. A proposal can then only include _onchain_ actions, such as "transfer X to tokens to address A", or "upgrade contract to be using implementation X"... etc.

At this point, _anyone_ can make a proposal by submitting it to the DAO contract. The [Tally UI](https://www.tally.xyz/gov/unlock) offers and easy way to make these proposals, but you are welcome to use any other relevant tool as well.

Given how much scrutiny is expected by voters, we strongly advise anyone who intends to make a proposal to advertise it _before_ submitting it in order to raise as much awareness as possible and give enough time to make a decision. This can happen on the [Unlock forum website](https://unlock.community/), on [Discord](https://discord.unlock-protocol.com/), or any other place where community members and delegates are expected to be able to ask questions and get answers.

Similarly, we encourage proposers to first submit an offchain "temperature check" from the community before submitting onchain proposals using a tool like [Snapshot](https://snapshot.org/#/unlock-protocol.eth). Even though offchain votes are non-binding, this helps [delegates (see below)](#delegating) get a sense of whether the community wants to see a specific proposal be executed or not.

Finally in the interest of transparency, you should consider submitting a Pull-Request that includes the details of your proposal. This will make it easier for DAO members to test your proposal's code, as well as verify that it performs what it has been intended for. Please [check past proposals](https://github.com/unlock-protocol/unlock/tree/master/governance/proposals) to get a good idea of what is expected. You will also find helpers in this code to executed cross-chain proposals for example!

Once the proposal has been submitted on chain, the [delegates (see below)](#delegating) have a period to express their preferences, between voting in "favor", "against" or "abstain". Proposals have to be **carefully tested by each delegate** to assert what impact they will actually have, and if they are indeed desirable for the protocol. Given their _unstoppable_ nature, and the fact that a rogue or buggy proposal could not be reverted, it is absolutely critical that every single vote is done thoughtfuly. Additionaly, some delegates might want to consult the token holders who have delegated to them before making a final decision.

#### Delegating

We expect the DAO to make frequent decisions. Voting onchain has a gas cost associated. In order to reduce the collective cost, the DAO has a _delegation_ mechanism and only delegates are actually voting. Every token holder is invited to delegate their tokens. Token holders can delegate to themselves or to another address. If they delegate to themselves, they will then be expected to vote.

Delegation is done _by address_, which means that there is no need to delegate again when the balance of tokens of an address changes.

When a delegation was submitted, the "weight" of each address's vote is based on how many tokens have been delegated to them, at the time of the proposal submission.

##### Unlock Labs Delegation

Unlock Labs has indicated that we will not use the company's owned tokens to vote on proposals for as long as we own a majority of the governance tokens. However, in order to facilitate governance, we have delegated some of the tokens we own to multiple entities, including some of our investors, some projects that we're partnering with, as well as other DAOs and communities that the Unlock Labs team feel bring valuable diversity of opinion, culture and help promote adoption of the protocol.

As of April 2023, our delegates are the following:

- [E2C Collective](<https://www.colorado.edu/lab/medlab/2022/02/16/introducing-exit-community-collective#:~:text=The%20Exit%20to%20Community%20Collective%20(E2CC)%20is%20working%20to%20further,control%20by%20their%20closest%20stakeholders>) `0xaa77c0BF34F660598B0f255D715E06946D6068EC`
- [Mintfund](https://themint.fund/) `0xC1987f61BDCB5459Afc2C835A66D16c844fd7a54`
- [ecodao](https://eco.mirror.xyz/) `0xC7B01da0129A20Af331d9352374879A34442A51c`
- [Gitcoin](https://www.gitcoin.co/) `0x48A63097E1Ac123b1f5A8bbfFafA4afa8192FaB0`
- [Cherry Ventures](https://www.cherry.vc/) `0xCed103d8d71c8758EE2C14d761E01af1B74fFE05`
- [Betaworks](https://www.betaworks.com/) `0xe3D73DAaE939518c3853e0E8e532ae707cC1A436`
- [Maskbook](https://mask.io/) `0x172059839d80773eC8617C4CB33835175d364cEE`
- [CDTM](https://www.cdtm.de/) `0x54c40a6B6f048144F531759F84786A08f033648b`
- [Protocol Labs](https://protocol.ai/): `0x8b7f5aD25d9d2ce47217060ebDA80D74f33b4E63`
- Danny Thomx (Community member): `0xCA7632327567796e51920F6b16373e92c7823854`

If you or your team is interested in becoming a delegate, please reach out.

### Cross-chain Governance

The Unlock contract has been deployed on multiple networks. In 2023, the Unlock Labs team introduced a mechanism for the DAO on Ethereum mainnet to control the Unlock contract deployed on each of these networks, [enabling cross-chain governance](./cross-chain-governance.mdx).
