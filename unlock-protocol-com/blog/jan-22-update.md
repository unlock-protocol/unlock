---
title: Unlock Protocol Product Updates for January 2022
subTitle: Upgradable contracts, new capabilities for creators and developers
authorName: Christopher Carfi
publishDate: January 27, 2022
description: Unlock's January 2022 release adds upgradable contracts, NFT airdrop support, and over a dozen other new capabilities for creators and developers.
image: /images/blog/jan-22-update/rocket-with-unlock-logo.png
---

The Unlock Protocol team has been on a 🚀 ride of BUIDLing as we blast into 2022! First, there is a major new release of the underlying Unlock smart contract — the engine that powers Unlock — as well as a whole smorgasbord of new capabilities that add power and flexibility to the protocol. 

Members of the Unlock team — heck, the whole Unlock community — are constantly finding new ways for creators and developers to benefit from building their membership-based projects, solutions and businesses using the open-source Unlock Protocol. Here’s what’s new in January 2022.

## You can now upgrade Unlock smart contracts

When you deploy a lock with Unlock, a new instance of the PublicLock contract (ERC-721) is created with the parameters you defined (name, token, etc). In Solidity, several patterns exist to deploy a contract from another contract. The previous version of Unlock was using a Minimal Proxy (EIP-1167). Instead of deploying the entire contract for each new lock created, a small proxy is deployed just to hold the data and forward calls to a main instance that deals with all the incoming data. That would potentially save a significant amount of gas when deploying a new lock instance.

However, the minimal proxy approach did not allow for upgrades. We wanted all locks to benefit from the latest features available, so we implemented a mechanism to deploy a full proxy from a contract and allow users to upgrade their locks when new features were released.

[Here is a deep dive behind what this means for implementers of Unlock](https://unlock-protocol.com/blog/upgradeable-patterns).

## New capabilities for Creators

- [**Airdrop NFT keys directly from the Unlock dashboard**](https://unlock-protocol.com/blog/airdrop-nft-memberships) — A lock owner can grant keys directly from the dashboard to their members
- **Non expiring memberships** — Memberships can be set to never expire
- **Increase the number of keys on a lock** — A lock manager can increase the number of keys on a lock even after it was created
- **Offer gas refund from locks** — A lock manager can allocate a “gas refund” to be paid to the person submitting a purchase transaction

## New tools for Developers

- **onValidKey Hook** — Ability to delegate the check about whether an address owns at least 1 valid membership to a 3rd party contract — this can check to see if a key purchaser has, for example, a particular ERC-721 NFT or a particular ERC-20 in their wallet
- **OnTokenUri hook** — A hook to let a lock owner customize the metadata on the NFT that’s fully on chain
- **Key manager on purchase** — When purchase transaction is called, a key manager can be set that could be different from the beneficiary of the membership
- **Try/catch on Unlock** — Locks could technically be “cut out” of Unlock and still work
- **Sign In With Ethereum**: Unlock’s front-end now provides a “Sign In With Ethereum” endpoint that can be used by a 3rd party application to easily identify a user’s Ethereum address

Ok, you’ll be glad you read down this far. This is kind of like the after-credits scene in the MCU movies. But — instead of Nick Fury, you get a look at some of the kick-ass stuff that members of the Unlock community have launched over the past couple of weeks. Check it:

[Croissant](http://twitter.com/croissanteth) has launched BakeryDAO with a thundering Twitter thread...

[![Croissant](https://unlock-protocol.com/images/blog/jan-22-update/1-min.png)](https://twitter.com/CroissantEth/status/1486387648457580546?s=20)

[ETHAnglia](http://twitter.com/ethanglia) is bringing web3 to the East of England...

[![ETHAnglia](https://unlock-protocol.com/images/blog/jan-22-update/2-min.png)](https://twitter.com/ETHAnglia/status/1484517935796400128?s=20)

[WPOptimizers](http://twitter.com/YoRaulGonzalez) 🇪🇸 has created a membership site for optimizing WordPress, the open-source content management system that powers 43% of the web...

[![WPOptimizers](https://unlock-protocol.com/images/blog/jan-22-update/3-min.png)](https://twitter.com/YoRaulGonzalez/status/1483756404947181571?s=20)

[The Willow Tree](http://twitter.com/twtdao) has launched their membership for bridging web3 and rave culture (and their site design is off the charts)...

[![TWT](https://unlock-protocol.com/images/blog/jan-22-update/4-min.png)](https://twitter.com/twtdao/status/1485996222003433477?s=20)

[CDAA](http://twitter.com/plannerdao) is one of the first projects we have seen using utility NFTs as the basis for industry certification and on-chain credentials for digital asset advisors...amazing...

[![CDAA](https://unlock-protocol.com/images/blog/jan-22-update/5-min.png)](https://twitter.com/PlannerDAO/status/1480991827209641988?s=20)

Want to know what’s going on with Unlock in real time? [Jump into our Discord](https://discord.com/invite/Ah6ZEJyTDp). #protip
