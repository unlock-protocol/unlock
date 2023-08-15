---
title: Unlock Protocol Supports Gasless Minting
authorName: Christopher Carfi
publishDate: July 15, 2023
description: Unlock supports gasless minting on a number of EVM-compatible networks.
image: /images/blog/gasless-minting/gasless-minting.png
---

![gasless minting image](/images/blog/gasless-minting/gasless-minting.png)

Gas fees in blockchain transactions refer to the cost associated with performing operations or executing smart contracts on a blockchain network. Blockchain networks, such as Ethereum, are decentralized and rely on a consensus mechanism to validate and execute transactions. To prevent spam and ensure that the network resources are used efficiently, a small fee in the form of cryptocurrency (usually in the native currency of the blockchain) must be paid for each transaction.

The term "gas" in this context refers to the unit used to measure the computational effort required to execute a specific operation or smart contract. Each operation on the blockchain network consumes a certain amount of gas, and the gas fee is calculated based on the complexity and resource requirements of the transaction.

When users initiate a transaction on the blockchain, they specify the gas price they are willing to pay for each unit of gas. Miners or validators on the network then choose transactions to include in the next block based on the gas price provided. Transactions with higher gas prices are prioritized because miners are incentivized to include them to maximize their rewards.

If the gas fee specified by the user is too low, the transaction may take longer to be processed or may even get stuck, as miners might prioritize higher-paying transactions. On the other hand, if the gas fee is set too high, users may end up overpaying for the transaction.

Gas fees play a vital role in the security and stability of blockchain networks, as they ensure that the network operates efficiently and that users pay a fair price for the resources they consume when interacting with the blockchain.

## The problems with gas fees on Ethereum mainnet

High gas fees on the Ethereum mainnet can lead to several significant problems for users and developers. Some of the main issues caused by high gas fees include:

- **Transaction costs:** High gas fees increase the cost of executing transactions on the Ethereum network. For users who are making simple transfers or interacting with decentralized applications, gas fees can become prohibitively expensive, discouraging everyday use of the network.
- **Economic barriers:** High gas fees create economic barriers for smaller users or those from economically disadvantaged regions. It can prevent individuals from participating in certain protocols, memberships, or events, limiting their access to opportunities and online mintable services.
- **Reduced adoption:** High gas fees can discourage developers from building or migrating their applications to the Ethereum mainnet.

To address these issues, the Ethereum community has been actively working on scaling solutions (such as EVM-compatible layer 2 blockchains) that have lower gas fees. These improvements are crucial for Ethereum's long-term sustainability and continued growth as a leading blockchain ecosystem.

## What is “gasless” or “gas-free” minting?

Gasless or gas-free minting refers to a mechanism that allows users to create or mint new tokens on a blockchain without having to pay the high gas fees associated with transaction execution.

To address this issue, various solutions have been developed to enable gasless or gas-free minting. Some common approaches include:

- **Gas subsidies:** Some projects or platforms offer gas subsidies to their users. They cover the gas fees for specific transactions, including minting new tokens, to encourage adoption and eliminate the burden of gas fees.
- **Sponsored transactions:** In this model, a sponsor pays the gas fees on behalf of users for specific operations, like minting tokens.

Gasless or gas-free minting solutions are beneficial as they can make blockchain interactions more accessible to a broader range of users and reduce friction for newcomers.

## How Unlock Protocol supports gas-free minting

Gas fees are often exorbitant on Ethereum mainnet. However, as an open, EVM-compatible protocol, Unlock Protocol runs on a number of EVM-compatible networks where Unlock can support gas-free minting of memberships, event tickets, certifications, and other mintable memberships and subscriptions.

Currently, Unlock supports gasless minting on Polygon and Gnosis Chain, and additionally may support gasless minting on other chains in the future. 

To see our full guide to implementing gasless minting, check out the [*How To Set Up Gas-free NFT Minting with Unlock Protocol*](https://unlock-protocol.com/guides/gas-free-nft-minting/) guide in Unlock Guides.
