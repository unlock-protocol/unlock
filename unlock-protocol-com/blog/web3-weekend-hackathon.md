---
title: Unlock Protocol Winning Teams from Web3Weekend
authorName: Amber Case
publishDate: June 1, 2021
description: On May 28-30th, 2021, Unlock participated in Web3Weekend, in partnership with Protocol Labs and EthGlobal. We added UDT Tokens to the $50K+prize bounty shared by all of the sponsors and community.
image: /images/blog/web3-weekend/web3-weekend-hackathon.png
---

![web3 weekend](/images/blog/web3-weekend/web3-weekend-hackathon.png)

On May 28-30th, 2021, Unlock participated in [Web3Weekend](https://web3.ethglobal.co/), in partnership with Protocol Labs and EthGlobal. We added UDT Tokens to the $50K+ prize bounty shared by all of the sponsors and community.

At the end of the weekend, we were excited to see that there were 19 submissions using Unlock for part of their application! *Unlock Protocol was the second most used technology* during the hackathon. We were excited and impressed by all of the submissions, and it was very difficult to choose our top three. We gave away a total of 11 UDT to three submissions, which we'll include below.

Thanks so much to everyone who tried out Unlock this weekend! We are looking forward to sponsoring future events!

# Hackathon Winners

## BlockFood - 5 UDT

A decentralized restaurant reservation app  for restaurant owners and customers using Unlock

<iframe width="100%" height="410px"  src="https://www.youtube.com/embed/3ptHEtkYjQg?start=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

**Description**

BlockFood allows you to Unlock reservations at a popular restaurant for a fee. If you show up, you'll get your fee back, but if you don't show up, the restaurant keeps your fee.

With this project customers of a restaurant can select a table at a chosen time and reserve it by depositing a configurable fee.

To get the fee back the guest has to enter a private key which is displayed at the chosen table.
The restaurant owner also has the option to manually refund the fees of a certain reservation.

If the guest does not check in at the designated time (+ a configurable margin of x minutes) the fees will be unlocked and the owner can withdraw the fees to his wallet.

![https://ethglobal.s3.amazonaws.com/recg7hIqwhvqvFgUb/BlockFood3.png](https://ethglobal.s3.amazonaws.com/recg7hIqwhvqvFgUb/BlockFood3.png)

**How it's made**

This project uses Unlock to create the posibility for users to create a reservation for a Restaurant by depositing a fee.

FrontEnd:
- latest version of Angular
- Ethers.js
- Angular material

BackEnd:
- Solidity Smart Contract
- Unlock Protocol

Unfinished Topics:
* Reservation on a specific time (date and timepicker in the FrontEnd does not submit values to the SmartContract).
* Withdraw function in the FrontEnd.
* Refund of multiple reservations ( purchase -> purchase -> refund -> refund)


🛠 [https://github.com/sudojanuc/BlockFood](https://github.com/sudojanuc/BlockFood)

🎥 [https://showcase.ethglobal.co/web3weekend/blockfood](https://showcase.ethglobal.co/web3weekend/blockfood)

## ****ContentStream -**** 3 UDT

ContentStream is a broadcast platform and marketplace allowing content creators to sell streams as bundles and NFT's.

Existing streamers often have large followings and may post their content to youtube or other sites after streaming of networks like Twitch (or LivePeer) - but that could be the end of it. Given these followings, we want to provide an opportunity to further connect with fans by providing memorabilia, and providing an additional revenue opportunity for the content creator. ContentStream allows any streamer to turn their streamed content into a sellable NFT and IPFS collection.

These collections can also be later resold and traded by new owners.

Many NFT marketplaces exist, but:

1. There's not a dominant one that appeals to the streaming market.
2. May not integrate with existing streaming networks. ContentStream doesn't care how you broadcast, only that the uploaded listings have a particular format and content.
3. Have higher overhead - contentstream backed by LivePeer and allows you to re-use existing assets and content if you wish.
4. Many streamers are already into technology and can port their existing streams onto the platform.
5. ContentStream is a niche platform not focused on current categories like artwork/real estate - only video content.

## Initial Monetization

ContentStream takes a small royalty fee off of transactions.

<iframe width="100%" height="410px"  src="https://www.youtube.com/embed/fWVWChMDGC0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

🛠 [https://github.com/cbonoz/content-stream](https://github.com/cbonoz/content-stream)

## Technology

- Web3/metamask integration: Authenticate the current user for submitting and receiving payments for marketplace listings.
- Livepeer: Session and stream recording generation.
- IPFS/Textile: Preservation of stream listings/packages in separate buckets. Used as a distribution mechanism for purchased assets.
- UDT / Unlockjs: Paywalls for asset purchasing. Representation of the stream as a purchase
- The graph: Reporting and health of ecosystem. Volume indicators for using LivePeer. Indexing of contentstream transactions in the future.

## Inspiration

NFTs are exploding in popularity but a lot of the current use cases revolve around speculative artwork. Owners of NFTs often purchase them with the hope that the price will increase. Instead of being rooted in speculation, we hope to create NFT that people can connect to as well as have a piece of history from a streamer's career.

With the rise in popularity of these sorts of marketplaces, video content is starting to discover a market as well.

![https://ethglobal.s3.amazonaws.com/recebjvLesM6a0aA9/Screen_Shot_2021-05-30_at_9.19.13_AM.png](https://ethglobal.s3.amazonaws.com/recebjvLesM6a0aA9/Screen_Shot_2021-05-30_at_9.19.13_AM.png)

**How it's made**

- Web3/metamask integration: Authenticate the current user for submitting and receiving payments.
- Livepeer: Session and stream recording generation.
- IPFS/Textile: Preservation of the stream in Bucket. Used as a distribution mechanism for purchased assets.
- UDT: Paywalls for asset purchasing. Representation of the stream as a purchase
- The graph: Reporting and health of ecosystem. Volume indicators for using LivePeer. Indexing of contentstream transactions in the future.

## ****Cross Chain Wallet Dashboard****  - 3 UDT

This projects helps you to keep track of your liquidity across chains.

A multi-chain wallet dashboard that gives you current balances, USD prices from multiple wallets you can connect. The innovation here is, that we not only show their balances on the Ethereum chain, but also on different other sidechains like Polygon and BSC.

We try to introduce classic e-commerce mechanisms by employing a freemium-based business model. You can connect one wallet for free, but then you need to pay for an UNLOCK-Key (via Unlock-Protocol) to be able to connect more than one. We also use TheGraph to query and show how many people have bought a key within the last 24h and provide the according Etherscan-link to be able to verify that by yourself. The blockchain comes in very handy in that use case.

The whole dashboard is hosted in TEXTILE Buckets on IPFS and we use Cloudfront to cache the website and be able to provide a nice URL.

![https://ethglobal.s3.amazonaws.com/recJGwncbDnu0XyE5/localhost_3000__1.png](https://ethglobal.s3.amazonaws.com/recJGwncbDnu0XyE5/localhost_3000__1.png)

**How it's made**

- Allow to connect multiple wallets from different EVM powered chains like Ethereum, Polygon, BSC, DAI,..
* Get current balances from each chain's RPC
* Get current USD prices from Coingecko and multiply it with each balance to get the real value of our portfolio
* Unlock premium features (adding multiple wallets) via UNLOCK-PROTOCOL - that way we can monetize our dashboard in a classic freemium fashion
* We then use THEGRAPH to get the unlock-driven sales from within the last 24h to have a "social proof" feature to encourage buying. People also get the link to the contract on Etherscan so that they can verify that.
* Everything is hosted via TEXTILE buckets on IPFS
* Using Cloudflare CDN as cache to be more accessible via custom domain: https://dashboard-textile.cryptopixels.org/
* Wallets can be easily added using ENS

<iframe width="100%" height="410px"  src="https://www.youtube.com/embed/ptESIU1UJto" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

🛠 [https://github.com/zenkteam/cross-layer-wallet-overview](https://github.com/zenkteam/cross-layer-wallet-overview)

## Thank you so much!

Congratulations to all of the winners, and thanks to all of the amazing entrants! Thanks especially to [Protocol Labs](https://protocol.ai/). We hope to see you at future hackathons!

### Unlock Token Grant Program

Have a project you'd like to build with Unlock? We have a token grant program! You can learn more about it here:

[https://share.hsforms.com/1gAdLgNOESNCWJ9bJxCUAMwbvg22](https://share.hsforms.com/1gAdLgNOESNCWJ9bJxCUAMwbvg22)