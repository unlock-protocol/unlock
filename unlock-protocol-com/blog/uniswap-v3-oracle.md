---
title: Using the Uniswap v3 Oracle in the Unlock Contract
subTitle: Unlock upgrades Uniswap Oracle to v3 for more accurate calculations of Unlock Gross Network Product
description: Unlock upgrades its price oracle to Uniswap v3 to increase accuracy and coverage when calculating the total value of sales on each network.
author: Clément Renaud
publishDate: November 4, 2022
image: /images/blog/uniswap-v3-oracle/oracle-uniswap-v3-share.png
---

In the Unlock Protocol, every time a key is purchased for any lock, a small transaction is sent back to the core Unlock factory contract to keep track of all existing sales on the network. For each network (Ethereum mainnet, Polygon, etc.), we calculate what we call a Gross Network Product (GNP) that consolidates the value of all sales into a single amount of native currency (ETH for mainnet, MATIC for Polygon, etc). The GNP is a useful indicator to track the evolution of the protocol’s activity across chains.

Unlock has upgraded its price oracle to Uniswap v3 to increase accuracy and coverage when calculating the total value of sales on each network.

## The Oracle Problem

Locks across networks can be priced in a variety of ERC20-compatible tokens. Therefore, we need to convert the amount of ERC20 tokens to native currency before adding it to the GNP. In blockchain ecosystems, the system that allows you to retrieve information from a 3rd party service (such as retrieving the price of a token) is called an [oracle](https://ethereum.org/en/developers/docs/oracles/). 

The main issue with smart contracts is that they can’t interact properly outside of the chain, and therefore require “oracles” to tell them what is happening outside, in the off-chain world. The famous [oracle problem](https://chain.link/education/blockchain-oracles) states that contracts on one hand can’t access data outside of the chain, but on the other hand shouldn’t rely to a single source of trust to provide data as this nullify the advantages of a decentralised security model. To mitigate this inherent risk, models of decentralised oracles have been developed. 

## Using Uniswap v3’s Decentralized  Oracle

Uniswap is one of the most famous decentralised exchanges operating on EVM chains. The new version (Uniswap v3) provides a neat way to query exchange data through an oracle in the form of a [simple contract](https://docs.uniswap.org/protocol/concepts/V3-overview/oracle). To date, the Unlock Protocol has been using the prior version of the Uniswap Oracle (v2), which required us to maintain a dedicated oracle. As of today, the Unlock Protocol will be upgraded to use the latest Uniswap v3, providing a more reliable and comprehensive coverage of various token prices. In this new implementation, GNP calculations will be simplified and cover a wider variety of possible tokens. 

You can see the details of the changes in [this pull request](https://github.com/unlock-protocol/unlock/pull/10030), as well as use the oracle for your own needs by querying directly the deployed contract on each network.



Here are the addresses of contracts deployed on the [various networks](https://docs.uniswap.org/protocol/reference/deployments) where Uniswap is supported:


- mainnet: [`0x951A807b523cF6e178e0ab80fBd2C9B035521931`](https://etherscan.io/address/0x951A807b523cF6e178e0ab80fBd2C9B035521931)
- polygon : [`0xE77c7F14e8EB9925ca418bF80c0a81a5B9C87683`](https://polygonscan.com/address/0xE77c7F14e8EB9925ca418bF80c0a81a5B9C87683)
- arbitrum : [`0x821d830a7b9902F83359Bf3Ac727B04b10FD461d`](https://arbiscan.io/address/0x821d830a7b9902F83359Bf3Ac727B04b10FD461d)
- optimism : [`0x1FF7e338d5E582138C46044dc238543Ce555C963`](https://optimistic.etherscan.io/address/0x1FF7e338d5E582138C46044dc238543Ce555C963#code)
- celo : [`0x5108412Dd50A6ea79d2F13D5d1A23FDD9bF532db`](https://celoscan.io/address/0x5108412Dd50A6ea79d2F13D5d1A23FDD9bF532db#code) 
- mumbai : [`0x5108412Dd50A6ea79d2F13D5d1A23FDD9bF532db`](https://mumbai.polygonscan.com/address/0x5108412Dd50A6ea79d2F13D5d1A23FDD9bF532db#code)
- goerli : [`0x25197CaCDE16500032EF4B35d60c6f7aEd4a38a5`](https://goerli.etherscan.io/address/0x25197CaCDE16500032EF4B35d60c6f7aEd4a38a5)
