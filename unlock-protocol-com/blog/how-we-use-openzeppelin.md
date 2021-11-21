---
title: How we use OpenZeppelin
subTitle: Showcasing our usage of open-source tools.
authorName: Nick Furfaro
publishDate: February 24, 2020
description: Openzeppelin provides the ethereum community an excellent assortment of reusable libraries and command-line tools. Here's how we use them at Unlock.
image: /images/blog/zeplin.jpg
---

### What it is

Unlock is a protocol which enables creators to monetize their content with a few lines of code in a fully decentralized way, enabling programmable access to resources. This could include a blog, a subset of software features, or an event.

The core of the protocol is built on ethereum, and is enabled by 2 primary smart contracts, `Unlock.sol` & `PublicLock.sol`.

- `Unlock.sol` is the factory contract. it deploys locks for creators and is responsible for managing network-wide functionality such as granting discounts and tracking the GNP of the network. This contract is upgradeable.

- `Publiclock.sol` is the lock contract. These are deployed by the factory when a creator creates a new lock. We don't actually deploy the full lock contract for each lock. This would be very heavy, as `PublicLock.sol` is a large contract. (To get an idea of the size, when flattened it's about 3,470 lines of code). Instead, we make use of eip-1167 (minimal proxies) to deploy lightweight proxy-clones for each lock. The logic for these clones is determined by a single deployed `PublicLock.sol` which acts as the template for all locks.

### How we use OpenZeppelin

We make use of a number of the tools & libraries that OZ offers:

#### Upgradeability

At Unlock, our approach to upgradeability has been to make the factory contract(`Unlock.sol`) upgradeable to enable us to continue to add and refine features. Since launching, we've had many requests from users to add support for new use-cases and without upgrades, this just wouldn't be feasible. However, the Lock contracts deployed from this factory are NOT upgradeable. This gives lock creators assurance that their lock is theirs forever, and can't be changed by anyone.
While there's no shortage of debate over the very idea of upgradeable contracts in the industry, one thing is very clear; the Openzeppelin-SDK makes it super-easy to manage and track upgrades! We manage most contract deployments and upgrades of `Unlock.sol` with openzeppelin's cli and appreciate the way the "network files" (ie: `/.openzeppelin/mainnet.json`) help us to keep track of the deployed contract addresses, current implementations, etc. Also, the ability to deploy contracts and then query them or submit tx's easily all via the cli is nice, avoiding the need to jump back and forth between many different toolsets to achieve the same.

#### Library

We use a number of openzeppelin's contracts from `@openzeppelin/upgrades/`, `@openzeppelin/contracts/`, and `@openzeppelin/contracts-ethereum-package/`. These include:

- `Initializable.sol`
- `IERC1820Registry.sol`
- `ECDSA.sol`
- `Address.sol`
- `Ownable.sol`
- `ERC165.sol`
- `IERC721Enumerable.sol`
- `IERC721Receiver.sol`
- `SafeMath.sol`
- `Roles.sol`
- `IERC20.sol`
- `SafeERC20.sol`

#### Test-Helpers

We've only just started to use some of the OZ test-helpers, but the experience so far has been great. For those who haven't tried them, they make a lot of common, repetitive tasks in testing very straightforward, and I highly recommend at least checking them out.

#### Access Control

We currently use `Ownable.sol` and the `onlyOwner` modifier extensively throughout our contracts. However, having realized some of the limitations/drawbacks of this approach, we've been re-evaluating our approach to access control and are migrating to a predominantly role-based approach using OZ's `Roles.sol`. At the moment it seems that the current approach to this topic is being revamped by OZ, so we're watching to see what emerges and will have to reassess whether it still meets our needs.

### Links

To learn more or get in touch, feel free to reach out to the team, try out our dashboard on the rinkeby testnet, or just explore the code in our GitHub repo.

- Unlock-Protocol: [unlock-protocol.com](https://unlock-protocol.com/)
- Github: [github.com/unlock-protocol/unlock](https://github.com/unlock-protocol/unlock)
- Docs: [docs.unlock-protocol.com](https://docs.unlock-protocol.com/)
- Blog: [unlock-protocol.com/blog](https://unlock-protocol.com/blog/)
- twitter [twitter.com/UnlockProtocol](https://twitter.com/UnlockProtocol)
- discord: [discord.gg/Ah6ZEJyTDp](https://discord.gg/Ah6ZEJyTDp)
- email: hello@unlock-protocol.com
