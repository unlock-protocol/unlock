---
title: Proposed Upgrade of the Unlock DAO Governor Contract 
publishDate: June 28, 2023
authorName: Clément Renaud
image: /images/blog/ballot-box-image.png
---

# **Proposed Upgrade of the Unlock DAO Governor Contract to the Most Recent Version**

The Unlock DAO deployed its governance contracts in 2021 using the then-current [version](https://blog.openzeppelin.com/governor-smart-contract) of the Open Zeppelin Governor contracts. The Unlock DAO was part of the first batch of Open Zeppelin adopters with [its DAO voting system](https://unlock-protocol.com/blog/unlock-dao).

## **A shiny new version**

Two years have passed and what was an initial release has evolved to include more features (including the ability to cancel a proposal, have consistent timestamps on different chains, support a time-based quorum, ERC721 support, etc.) as well as a few bug fixes. To take advantage of these recent evolutions in the state-of-the-art, we believe now is the time for the Unlock DAO to benefit from these improvements.

We have redeployed [a new version](https://etherscan.io/address/0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591#code) of the governor contract and bumped from Open Zeppelin 4.4.2 to 4.9.0. This new contract will now be upgradeable so we can follow future releases without having to change its address.

## **The king is dead, long live the king!**

For the DAO, a change in governor requires two actions: canonize the new one and retire the old one. The vehicle for that process will be [a proposal](https://www.tally.xyz/gov/unlock/proposal/36208249270120864100503453462134662510103434369621143761091232235939585571890) containing the instructions to make the change. Once executed, this DAO popemobile will transport the voting system to its new location.

As a user/voter, there won’t be any change in delegations or voting process. The only apparent change is that the previous proposals will no longer appear in the Tally UI or be visible from the new governor contract.

## **What to do now**

-  If you own any amount of UDT, the Unlock protocol's governance tokens, [delegate your votes](https://unlock-protocol.com/guides/delegation/) (you **must** delegate to participate in onchain votes, including self-delegation)
- Head to [the proposal](https://www.tally.xyz/gov/unlock/proposal/36208249270120864100503453462134662510103434369621143761091232235939585571890)
- Cast your vote!

The voting period ends on **July 11th 2023**. At the end of the voting period, and if the proposal to upgrade passes, the proposal will be queued and executed and the change will become effective.
