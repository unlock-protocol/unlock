---
title: Launching Unlock Discount Tokens
subTitle: Starting the decentralization of Unlock!
authorName: Julien Genestoux
publishDate: December 15, 2020
description: As an open protocol for memberships, we want Unlock to belong to its users. Today we are introducing the protocol's native token.
image: /images/blog/launching-unlock-discount-tokens/decentralized-unlock.jpg
---

Unlock is a protocol. Like any other protocol, it should not belong to anyone but its community of users and adopters. Today, we're very excited to introduce Unlock Discount Tokens and start the journey toward a fully decentralized protocol, where users co-own the protocol, as well as earn rewards for their use!

Don't forget to check the [step-by-step upgrades and deployments as documented on our wiki](https://github.com/unlock-protocol/unlock/wiki/The-Path-to-UDT!)!

![Decentralizing Unlock](/images/blog/launching-unlock-discount-tokens/decentralized-unlock.jpg)
# How does UDT work?

The Unlock Discount Token (UDT) is an **optional** ERC20 token that exists to add incentives to actors who are willing to grow and use the Unlock Protocol and network as well as progressively give them control of future upgrades. The smart contract which mints UDT has been deployed to the Ethereum main network and can be found at [`0x90de74265...`](https://etherscan.io/token/0x90de74265a416e1393a450752175aed98fe11517).

Unlock Discount Tokens are minted and granted as rewards upon key purchases to an address designated in the key purchase call, as shown on [this transaction for example](https://etherscan.io/tx/0xb0e5f95ea980c1f096a841e5507f465827411cc29f80f8b95971a5241d9e81bb). Like all of our contracts, it is fully verified on Etherscan and you can access the full [source code on GitHub](https://github.com/unlock-protocol/unlock/)!

We pre-mined 1,000,000 tokens and we'll distribute some of them to early investors and adopters soon, but this pre-mine will also quickly become a minority stake as the supply of tokens will grow as the network grows, since new tokens can be minted for every new key purchase.

As of now, the Unlock and UDT contracts are upgradable using OpenZeppelin and "owned" by a Gnosis multisig wallets whose signers are Unlock employees. Our goal is to soon decentralize that mechanism so that upgrades can only be triggered by UDT holders, after a voting process through a DAO, where votes are weighted by UDT ownership!

**Additionally, the first upgrade that we will then submit will add a mechanism that lets UDT holders claim discounts on their key purchases!**

Our [wiki provides a long description](https://github.com/unlock-protocol/unlock/wiki/The-Unlock-Discount-Tokens) of how UDT works.

# How can I earn UDT?

From now on, there is only a single way to create (and earn) new tokens: making key purchases. The number of tokens minted is based on the value of the purchase relative to the size of the overall network. This means that when the network is small, the number of tokens minted will be relatively larger than when the network is getting large. **This rewards early adopters more**!

The number of tokens minted is also capped to the gas spent by the transaction, so that it is always cheaper to purchase UDT from an exchange [such as Uniswap](https://app.uniswap.org/#/add/ETH/0x90DE74265a416e1393A450752175AED98fe11517) than it would be to purchase keys for yourself and earn tokens doing it.

It's important to note that even though the supply of tokens will grow forever as the network grows, the growth of the supply will slow down forever as well, which means that it is much easier to accumulate tokens in the early days of the network than once it will be larger.

# What is next?
The next step toward a fully decentralized Unlock Protocol is to start working on moving away from our multisignature based upgrades to upgrades driven by a Decentralized Autonomous Organization. This will be our focus in the next few months.

We will also work on allowing token holders to claim discounts on their purchases as we think it is important to add financial rewards to stakeholders.

Do you want to learn more? Are you interested in joining us? [Reach out on Discord](https://discord.gg/Ah6ZEJyTDp)!
