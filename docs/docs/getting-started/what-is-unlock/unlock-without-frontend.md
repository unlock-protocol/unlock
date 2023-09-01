---
title: Unlock w/o Front-End
description: >-
  Unlock is a protocol. As such, the user interface is fully decoupled from the core protocol and it is absolutely possible to use the core protocol without using any of the front-end tools that the Unlock core team built.
sidebar_position: 3
---

Unlock is a on-chain protocol: the smart contracts are collectively governed and any application can interract with them.

The Unlock Labs team, as promoters of the protocol, have built multiple [tools](../../tools/) and applications to simplify interractions with the smart contracts, including [subgraphs](../../tools/subgraph), a [checkout UI](../../tools/checkout/), or the [credit card gateway](https://unlock-protocol.com/guides/enabling-credit-cards/). However, **these are completely optional**, and can very well skipped entirely when building applications that integrate Unlock.

For example, [this application](https://examples-wagmi.vercel.app/) uses the [Wagmi](https://wagmi.sh/) framework to let users deploy new lock contracts, or purchase memberships from existing contracts without using any of the Unlock tools.

The [Core Protocol](../../core-protocol/) section includes all documentation needed to build applications without using any of the tools built by the Unlock Labs team. We also provide a tutorial on how to use the [Ethers.js](../../tutorials/smart-contracts/ethers.md) library to interract with the contracts directly, and similar libraries in JavaScript or other languages can be used.
