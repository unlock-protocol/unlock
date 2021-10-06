---
title: Airdrop!
subTitle: Everyone who used Unlock before September 1st can join our DAO!
authorName: Julien Genestoux
publishDate: October 6, 2021
description: Today, we're announcing a retro-active airdrop where anyone who contributed to Unlock's network can claim some UDT to join our governance
image: /static/images/blog/airdrop/coin.svg
---

Last week, we introduced the [Unlock DAO](/blog/unlock-dao) where anyone can contribute proposals and vote on these in order to collectively govern the protocol and its treasury. Today, we're excited to announce that we're going one step further by doing a **retro-active airdrop**: anyone who has contributed to Unlock before September 1st 2021 is eligible to receive some UDT.

We expect to distribute **up to 7,314 UDT**! Claim your tokens now at [https://airdrop.unlock-protocol.com/](https://airdrop.unlock-protocol.com/)

<p style="
    text-align: center;
"><img src="/static/images/blog/airdrop/coin.svg" alt="Unlock DAO"></p>

# Rewarding past contributions

The protocol already mints and distributes new tokens for every eligible new key purchase. This very important mechanims lets us make sure that developers, creators and members who participate in the networks' growth can get a say in its governance.

However, we introduced the tokens after months of having the protocol functional because we focused on building utility first. Today, we want to acknoledge these early contributions and allowing all of these users to claim some tokens to join our governance.

We applied the following rules:

* __3 UDT per lock deployed__, on any of the production networks that we currently support (Ethereum, xDAI and Polygon).

* __1 UDT per key__ purchased on any supported production network.

* __1 UDT for any UDT holder__ with a balance of 3 UDT or more, as of September 1st 2021 at midnight (including liquidity providers on the Uniswap v2 pool)

# Claiming... and delegating

One of the most critical aspect of a successful DAO is participation. For this reason, we have decided to alter [Uniswap's merkle-distributor contract](https://github.com/unlock-protocol/merkle-distributor), to require eligible addresses to delegate their tokens in order to claim them.

Our goal here is to make sure that all new tokens claimed are accounted for when it comes to governance. Additionnaly, since delegation applies to all off the tokens owned by any single address, we expect that a large portion of the existing token holders will achieve delegation in order to claim their tokens!

In order to ease the process, we identified a few members of our community who are willing to be delegates:

* Andreu: _Cybersecurity expert, Investor, lover of challenges and everything related to blockchain and technology._

* Aseem: _Currently building products at Uniswap Labs; Previously, cofounder at Open Collective and a PM at Dropbox, Google._

* Megan: _Decrypting crypto accounting._

* Elefterios: _Eleftherios is the founder of Radicle, a web-3 network for code collaboration._

Of course, you can very well pick any other address, but please, remember that it's very important for that delegate to vote on proposals made by the community!


# Time limit

Finally, in order to make sure that tokens available for the airdrop are not wasted, we added a clean-up mechanism. This mechanism can be triggered by anyone after 1,000,000 blocks have been mined [from the moment](https://etherscan.io/block/13359160) the [airdrop contract](https://etherscan.io/address/0xC10Bc8Edb561E7c5002Ee6fBab4F3810638e80dF) has been deployed. We expect this to be around 150 days, or around March 4th 2021!

At that point, all of the remaining tokens that have not been claimed will be transfered to the DAO, through the timelock contract, for the community to use as they wan, along with the rest of the treasury.
