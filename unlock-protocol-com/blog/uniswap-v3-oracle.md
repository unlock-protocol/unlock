---
title: Using the Uniswap v3 Oracle in the Unlock Contract
subTitle: Unlock upgrades Uniswap Oracle to v3 for more accurate calculations of Unlock Gross Network Product
description: Unlock upgrades its price oracle to Uniswap v3 to increase accuracy and coverage when calculating the total value of sales on each network.
author: Clément Renaud
publishDate: November 4, 2022
image: /images/blog/??.png
---

In the Unlock Protocol, every time a key is purchased for any lock, a small transaction is sent back to the core Unlock factory contract to keep track of all existing sales on the network. For each network (Ethereum mainnet, Polygon, etc.), we calculate what we call a Gross Network Product (GNP) that consolidates the value of all sales into a single amount of native currency (ETH for mainnet, MATIC for Polygon, etc). The GNP is a useful indicator to track the evolution of the protocol’s activity across chains.

Unlock has upgraded its price oracle to Uniswap v3 to increase accuracy and coverage when calculating the total value of sales on each network.

## The Oracle Problem

Locks across networks can be priced in a variety of ERC20-compatible tokens. Therefore, we need to convert the amount of ERC20 tokens to native currency before adding it to the GNP. In blockchain ecosystems, the system that allows you to retrieve information from a 3rd party service (such as retrieving the price of a token) is called an [oracle](https://en.wikipedia.org/wiki/Blockchain_oracle). 

The main issue with smart contracts is that they can’t interact properly outside of the chain, and therefore require “oracles” to tell them what is happening outside, in the off-chain world. The famous [oracle problem](https://chain.link/education/blockchain-oracles) states that contracts on one hand can’t access data outside of the chain, but on the other hand shouldn’t rely to a single source of trust to provide data as this nullify the advantages of a decentralised security model. To mitigate this inherent risk, models of decentralised oracles have been developed. 

## Using Uniswap v3’s Decentralized  Oracle

Uniswap is one of the most famous decentralised exchanges operating on EVM chains. The new version (Uniswap v3) provides a neat way to query exchange data through an oracle in the form of a simple contract. To date, the Unlock Protocol has been using the prior version of the Uniswap Oracle (v2), which required us to maintain a dedicated oracle. As of today, the Unlock Protocol will be upgraded to use the latest Uniswap v3, providing a more reliable and comprehensive coverage of various token prices. In this new implementation, GNP calculations will be simplified and cover a wider variety of possible tokens. 

You can see the details of the changes in [this pull request](https://github.com/unlock-protocol/unlock/pull/10030), as well as use the oracle for your own needs by querying directly the deployed contract on each network.
