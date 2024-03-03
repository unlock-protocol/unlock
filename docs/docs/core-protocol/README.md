---
sidebar_position: 1
title: Unlock Smart Contracts
pagination_next: core-protocol/unlock/README
description: >-
  Guide to Unlock Protocol smart contracts including where to find them and how
  they can be used.
---

# Unlock Smart Contracts

The Unlock Protocol, at its core, is enabled by 2 primary Ethereum smart contracts, deployed on all networks supported by Unlock: [the Unlock](unlock/) and the [PublicLock contracts](public-lock/) . We have a few more contracts, such as the governance token contract and the actual governance contract, but they are not actually required by the core protocol.

Our contracts have [been audited](audits.md) by 3 different teams.

## Npm Modules

Each version of the contracts is available via the `@unlock-protocol/contracts` module. Among other things, this module includes the compiled artifacts for both Unlock.sol and PublicLock.sol, as well as the interfaces for our contracts, a changelog and, the commit hash for this version. This allows us (or anyone) to support multiple versions when building on Unlock!

### How to use

```shell
yarn add @unlock-protocol/contracts
```

```js
// get latest
import unlock from '@unlock-protocol/contracts/abis/Unlock'

// get previous versions
import unlock from '@unlock-protocol/contracts/abis/UnlockV0'
import { UnlockV0 } from '@unlock-protocol/contracts'
```

```solidity
import '@unlock-protocol/contracts/dist/Unlock/UnlockV0.sol';
```

## Standards

Other standards which Unlock adheres to are:

- [erc-1167](https://eips.ethereum.org/EIPS/eip-1167) - Minimal Proxy Contract
- [erc-165](https://eips.ethereum.org/EIPS/eip-165) - Standard Interface Detection
- [erc-712](https://eips.ethereum.org/EIPS/eip-712) - Ethereum typed structured data hashing and signing (**in progress**)
- [erc-20](https://eips.ethereum.org/EIPS/eip-20) - Token Standard (**in progress)**

## Supported networks

You can find the [list of networks on this page](unlock/networks).
