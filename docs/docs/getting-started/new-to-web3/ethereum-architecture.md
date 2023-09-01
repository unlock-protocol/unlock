---
title: Ethereum Architecture
description: A high level overview of what Ethereum application architecture looks like.
sidebar_position: 1
---

# Ethereum Architecture

### A high level Ethereum application architecture

```text
----------------------------------
            Wallets
----------------------------------
             Dapps
----------------------------------
              RPC
==================================
         Smart Contracts
----------------------------------
              EVM
----------------------------------
```

The Ethereum blockchain is, before anything else, a network. As of Ethereum 1.x, each node in the network includes an (eventually) identical copy of a virtual computer. These nodes communicate together to stay in sync while still being able to evolve their state.

At the core of the Virtual Computer, sits the Ethereum Virtual Machine (or EVM) that is in charge of "executing" transactions to alter the data stored in it. You can think of it as the _operating system_ of a distributed computer. Among other things, it stores the ledger that keeps track of the ether balances of each account. Ether is the native currency of the Ethereum ecosystem. Smart contracts are the equivalent of _apps_ running inside of the EVM. They can store data and have methods that can be invoked by users or other smart contracts. As these applications consume resources on the EVM (compute, storage...), they can only run if the caller supplies "gas", which is spent to cover the cost of these resources. Gas is paid in Ether.

In order to communicate with the distributed computer each node provides an RPC interface: it is a way to send transactions, as well as read state. These interfaces are fairly standardized which means that users could, in theory, connect to any node. The RPC calls can be used to transfer funds, but, more importantly to execute transactions in smart contracts.

To make it easy to interface with smart contracts, developers are building "dapps" (distributed apps), which are generally only using state stored in the EVM with a user-friendly interface (almost always web-based). Since the state of each application is "public", multiple dapps can be built for the same smart contract. Some advanced dapps will let users interact with several smart contracts in single interface.

Finally, wallets are "wrappers" around private keys that let user sign messages and transactions sent through Dapps and RPC to distributed computer. These wallets can also store valuable state for users such as their balance of Ether, or even data from some specific smart contracts, such as their balances of certain tokens.

Given the popularity of the Ethereum mainnet, several side-chains and "layer 2" have emerged. They provide a very similar architecture and can be "connected" to the Ethereum mainnet through "gateways" whose role is to transfer tokens from a network to another.
