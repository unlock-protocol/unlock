---
title: Governance & Voting
description: >-
  The Unlock Protocol is a public good aimed at being governed by a DAO of its
  users and developers.
sidebar_position: 1
---

Collectively, [Unlock Protocol Governance Token holders](https://docs.unlock-protocol.com/governance/unlock-dao-tokens) are members of the Unlock DAO. The Unlock DAO governs the Unlock Protocol. In order to facilitate decision-making, the Unlock DAO uses OpenZeppelin's [Governor Contracts](https://blog.openzeppelin.com/governor-smart-contract/) which can be found at these addresses on [Base](https://base.org):

* [Governor Contract](https://basescan.org/address/0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9) (`0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9`): where proposals and votes are handled,  
* [Timelock Contract](https://basescan.org/address/0xB34567C4cA697b39F72e1a8478f285329A98ed1b) (0xB34567C4cA697b39F72e1a8478f285329A98ed1b): where proposals are executed and funds are managed.

Prior to being on Base, the Governor and Timelock contracts were on the Ethereum network. [The Unlock DAO migrated from Ethereum to Base in 2024](https://paragraph.xyz/@unlockprotocol/up-dao-migration-complete).

### Initial settings

The governor contract has been configured with the following characteristics:

* Anyone can submit a proposal (no ownership threshold)  
* Proposal Delay: 6 days  
* Voting period: 6 days  
* Quorum: 3M votes  
* Time-lock duration: 7 days.

All of these settings can be changed by the Unlock DAO community through an onchain proposal.

### Allocated funds

As part of the launch of the DAO, Unlock Inc. originally allocated the following to the Timelock contract on Ethereum mainnet:

* 100,000 UDT that the DAO used to pay bounties, grants or perform retro-active funding  
* 170.23 Uniswap Liquidity Provider tokens from the UDT/ETH pool  
* Unlock Inc. subsequently transferred the remainder of the first community airdrop to the DAO

In June 2023, the legacy Governor contract was upgraded from `0x7757f7f21f5fa9b1fd168642b79416051cd0bb94` to `0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591` via a [DAO proposal that the community approved and executed onchain](https://www.tally.xyz/gov/unlock-old/proposal/36208249270120864100503453462134662510103434369621143761091232235939585571890). This upgrade is the result of a vulnerability in the OpenZeppelin library and the new Governor contract is now upgradable. The above information is included for historical reference.

In September 2024, a new Governor contract was instantiated on Base as part of the [migration of the Unlock DAO to Base](https://paragraph.xyz/@unlockprotocol/up-dao-migration-complete). The UDT in the original Ethereum mainnet Timelock was migrated to Base and was [swapped for UP](https://www.tally.xyz/gov/unlock-protocol/proposal/63269785253077722766136849401328655272413685934436217551731159324075983360350), the Unlock Protocol governance token on Base. 

### Voting

The Governor can execute any transaction as long as the transaction was approved by token holders. These transactions range from transferring some of its own tokens as grants, to upgrading the core protocol, or even changing its own governance parameters.

#### Making a proposal

A proposal is code that will be executed by the Timelock smart contract if it has been approved. A proposal can then only include *onchain* actions, such as "transfer X to tokens to address A", or "upgrade contract to be using implementation X"... etc.

At this point, *anyone* can make a proposal by submitting it to the DAO contract. The [Tally UI](https://www.tally.xyz/gov/unlock-protocol) offers an easy way to make these proposals, but you are welcome to use any other relevant tool as well.

Given how much scrutiny is expected by voters, we strongly advise anyone who intends to make a proposal to advertise it *before* submitting it to raise as much awareness as possible and give enough time to make a decision. This can happen on [Discord](https://discord.unlock-protocol.com/), or any other place where community members and delegates are expected to be able to ask questions and get answers.

Finally, in the interest of transparency, you should consider submitting a Pull Request that includes the details of your proposal. This will make it easier for DAO members to test your proposal's code, as well as verify that it performs what it has been intended for. Please [check past proposals](https://github.com/unlock-protocol/unlock/tree/master/governance/proposals) to get a good idea of what is expected. You will also find helpers in this code to execute cross-chain proposals for example\!

Once the proposal has been submitted on chain, the [delegates (see below)](https://docs.unlock-protocol.com/governance/unlock-dao/#delegating) have a period to express their preferences, between voting in "favor", "against" or "abstain". Proposals have to be carefully tested by each delegate to assert what impact they will actually have, and if they are indeed desirable for the protocol. Given their *unstoppable* nature, and the fact that a rogue or buggy proposal could not be reverted, it is absolutely critical that every single vote is done thoughtfully. Additionally, some delegates might want to consult the token holders who have delegated to them before making a final decision.

#### Delegating

We expect the DAO to make frequent decisions. Voting onchain has a gas cost associated with it, although this gas cost is minimal on Base. In order to encourage active participation, the DAO has a *delegation* mechanism and only delegates are actually voting. Every token holder is invited to delegate their tokens, and only tokens that are delegated are eligible to vote. Token holders can delegate to themselves or to another address. If they delegate to themselves, they will then be expected to vote. **Note:** Self-delegation is required if you want to vote your own tokens.

Delegation is done *by address*, which means that there is no need to delegate again when the balance of tokens of an address changes.

When a delegation is submitted, the "weight" of each address's vote is based on how many tokens have been delegated to them, at the time of the proposal submission.

### Cross-chain Governance

The Unlock contract has been deployed on multiple networks. In 2023, the Unlock Labs team introduced a mechanism for the DAO to control the Unlock contract deployed on each of these networks, [enabling cross-chain governance](https://docs.unlock-protocol.com/governance/unlock-dao/cross-chain-governance). 
