advent-infographic

---
title: Airdrop for NFT Memberships
subTitle: How to easily grant access to token-gated communities
authorName: Julien Genestoux
publishDate: January 11, 2022
description: Creators have multiple options to airdrop memberships to their fans so they can become members and receive the NFT in their wallets
image: /images/blog/advent-infographic/advent-infographic-share.png
---

Creators can easily deploy their membership contracts (called Locks) using the Unlock dashboard. Each Lock has different membership terms: membership price, number of members, duration of the membership (yes, the NFT does expire!)... etc.

Memberships can then be purchased directly by the fans. This happens by calling the `purchase` function on the Lock contract. In practice, this function can actually be called with another recipient's address, in order for them to receive the NFT (instead of the buyer).

However, in a lot of cases, creators may want to "give away" or **airdrop NFT memberships** for free to some of their users. Here are examples of why this is useful:

- This is how our [credit card](/blog/credit-card-nft) flow works: the NFT is paid "off chain" via a credit card transaction, and _granted_ on chain (technically, no on-chain payment happens).
- Someone might want to give a "limited time" trial. For example, my [personal blog](https://ouvre-boite.com) has a membership of its own, where NFTs expire after 1 year, but where anyone who [follows me on Twitter](https://twitter.com/julien51) [can claim a 30 minute](https://claim-ouvre-boite-membership.herokuapp.com/) trial!
- Finally, some communities and memberships cannot be purchased, but only be granted. That is the case for the [PlannerDAO certifications](https://twitter.com/PlannerDAO/status/1479097169747529735).

# How to airdrop NFT memberships

## Using the Dashboard

We have created a comprehensive guide to [airdropping NFTs](https://unlock-protocol.com/guides/how-to-airdrop-memberships/) using Unlock Protocol using the Dashboard.

![Advent infographic](/images/blog/advent-infographic/advent-infographic-v2.png)

