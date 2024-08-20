---
sidebar_position: 1
title: Unlock Smart Contracts
pagination_next: core-protocol/unlock/README
description: >-
  Guide to Unlock Protocol smart contracts including where to find them and how
  they can be used.
---

# Unlock Smart Contracts

The Unlock Protocol, at its core, is enabled by 2 primary Ethereum smart contracts, deployed on [all networks](unlock/networks.mdx) supported by Unlock: [the Unlock](unlock/) and the [PublicLock contracts](public-lock/). We have a few more contracts, such as the governance token contract and the actual governance contract, but they are not required by the core protocol.

Our contracts have [been audited](audits.md) by 3 different teams.

## Npm Modules

Each version of each contract is available via the `@unlock-protocol/contracts` module. Among other things, this module includes the compiled artifacts for both `Unlock.sol` and `PublicLock.sol`, as well as the interfaces for our contracts, a changelog and, the commit hash for this version. This allows us (or anyone) to support multiple versions when building on Unlock!

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

## Supported networks

You can find the [list of networks on this page](unlock/networks).
