---
title: Swap and Call
subTitle: Simplifying spending on Ethereum
authorName: Nick Mancuso
publishDate: January 31, 2020
description: Calling contracts without having to get a specific ERC-20 token type first.
image: /images/blog/unlocking-smart-contracts/code.jpeg
---

Unlock Protocol enables content creators to sell keys which are NFTs used to gain access, unlock features, and/or display support for the creator.  The content creators choose the price and which currency they prefer. ETH is the native currency but the value is volatile. Many prefer to price things in USD by using an ERC-20 token such as DAI.

We need to make this easy for users.

If someone is holding ETH, don’t tell them to find an exchange to buy DAI first - not if we can do it for them.  Similarly if they are holding SAI or USDC but the content creator asked for DAI - it should just work.

Composability on Ethereum has been a recent topic of discussion in the industry. A great example popping up are DEX aggregators - these can connect to several exchanges to ensure traders always get the most for their money. It got us thinking...

Buying an NFT isn’t really much different than swapping from BAT to DAI. So we are not really solving a new problem here. And we have great examples to learn from.

## What this means for users

We do not have a frontend yet, but it’s coming! Once the feature has been integrated, users will be presented options during checkout.

E.g. if the key costs $5, I could have the option to:
 - Pay with ~5 DAI / SAI / USDC / USDT
 - Pay with ~0.03 ETH
 - Pay with ~25 BAT

Only options using tokens the user actually owns will be presented. So if the user does not have USDT, it will not be mentioned.

This helps to overcome one of the challenges users have today - [“there are just too many ERC-20 [token types]”](https://twitter.com/julien51/status/1222957379031117825).

## How it works

[swap-and-call](https://github.com/unlock-protocol/unlock/tree/master/smart-contract-extensions) has an implementation that’s very similar to the [1inch.exchange](https://etherscan.io/address/0x11111254369792b2Ca5d084aB5eEA397cA8fa48B#code) contract. It’s basically a batch transaction processor with a little logic before and after for this use case. It is not built for Unlock specifically and does not assume any specific DEX, this approach should work for many other use cases as well.

High level steps for a swapAndCall transaction:
 - Collect tokens from the user using `transferFrom` (if spending tokens instead of ETH)
 - Call one or more contracts (any contract, any method, and params may be included)
 - Send any tokens remaining back to the user

For Unlock’s use case, the contract calls we make are:
 - Approve Uniswap to `transferFrom` SwapAndCall (if spending tokens instead of ETH)
 - Call Uniswap to swap from the source token into the token type needed to buy a key
 - Approve the Lock to `transferFrom` the SwapAndCall contract (if the key is priced in tokens instead of ETH)
 - Call purchase on the lock contract to acquire a key which is sent directly to the user

<p style="text-align:center">
	<img src="/images/blog/unlocking-smart-contracts/code.jpeg" width="400px" alt="Smart contracts">
</p>

Here’s [an example transaction](https://etherscan.io/tx/0x8c0e34bb009a13b4c35ba3bd6b96c6ed2b5807ac0e5da47f65350017b38f5450) where I use SwapAndCall to pay with ETH and buy a key priced at $1, in DAI.

I sent the transaction to SwapAndCall with 0.0056 ETH (~$1.02)
 - SwapAndCall forwards the ETH with a call to Uniswap to swap for the exact amount of DAI required
 - Uniswap sends DAI to the SwapAndCall contract and refunds the leftover ETH
 - SwapAndCall calls `purchase` and the key is sent directly to the end-user
 - SwapAndCall refunds the remaining 0.00009 ETH to the end-user

We are using [Uniswap](https://uniswap.exchange/swap) but this process would work with other exchanges such as [Kyber](https://kyber.network/) or [Oasis](https://oasis.app/).  You could also use a DEX aggregator such as [1inch](https://1inch.exchange/), [0x](https://0x.org/api/), [Dex.ag](https://dex.ag/), or [ParaSwap](https://paraswap.io/#/).

## What’s next
The front-end of course. But there is another big feature we want to add -- meta-transactions! (see our [roadmap document](https://github.com/unlock-protocol/unlock/wiki/Roadmap) to learn more!)

Meta-transactions allow users to sign messages approving smart contract actions, instead of broadcasting transactions. This means they are not paying gas fees directly and do not need to have any ETH.

[DAI](https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f#code) is helping to push this forward with the inclusion of the `permit` feature. Combined with SwapAndCall meta-transactions users could buy keys with DAI, without ever owning any ETH.

Like always, [all of our code is open source](https://github.com/unlock-protocol/), and we take pull requests, as well as grant bounties to people who help us move forward!

Let's keep pushing for a better user-experience.
