---
title: Airdrop for NFT Memberships
subTitle: How to easily grant access to token-gated communities
authorName: Julien Genestoux
publishDate: January 11, 2022
description: Creators have multiple options to airdrop memberships to their fans so they can become members and receive the NFT in their wallets
image: /images/blog/airdrop-nft-memberships/dashboard.gif
---

Creators can easily deploy their membership contracts (called Locks) using the Unlock dashboard. Each Lock has different membership terms: membership price, number of members, duration of the membership (yes, the NFT does expire!)... etc.

Memberships can then be purchased directly by the fans. This happens by calling the `purchase` function on the Lock contract. In practice, this function can actually be called with another recipient's address, in order for them to receive the NFT (instead of the buyer).

However, in a lot of cases, creators may want to "give away" or **airdrop NFT memberships** for free to some of their users. Here are examples of why this is useful:

- This is how our [credit card](/blog/credit-card-nft) flow works: the NFT is paid "off chain" via a credit card transaction, and _granted_ on chain (technically, no on-chain payment happens).
- Someone might want to give a "limited time" trial. For example, my [personal blog](https://ouvre-boite.com) has a membership of its own, where NFTs expire after 1 year, but where anyone who [follows me on Twitter](https://twitter.com/julien51) [can claim a 30 minute](https://claim-ouvre-boite-membership.herokuapp.com/) trial!
- Finally, some communities and memberships cannot be purchased, but only be granted. That is the case for the [PlannerDAO certifications](https://twitter.com/PlannerDAO/status/1479097169747529735).

# How to airdrop NFT memberships

## Using the Dashboard

Once your lock is deployed, you can head out to the members page.

![Dashboard](/images/blog/airdrop-nft-memberships/dashboard.png)

On that page you will see the list of all the members on your lock. You can also see a button that lets you airdrop an NFT: click on it!

![Members Page](/images/blog/airdrop-nft-memberships/members-page.png)

A drawer will open and let you easily airdrop a membership to any address.

- Make sure the lock is the correct one!

- You need to enter the recipient's address. The field supports ENS names, in order to avoid making typos!

- Next you can select when this airdropped membership is going to expire. By default, it is based on the duration of the lock, but can be customized. This flexibility means you can grant a key for a few minutes for trials!

- Finally you can select a "key manager". At Unlock, we decouple the "owner" of an NFT from the account who has the ability to transfer said NFT. Most of the time, and by default, it is the same... but in some cases, it can be important to make sure that someone, even if they own an NFT is not able to transfer it. That's the case for credit card purchases. For security reasons, we want to make sure that NFT "bought" this way are not transferable. Similarly, granted keys can be "cancelled" by their owner, triggering a refund, by default. So it can be important to retain the key manager role.

- Once ready, submit the transaction!

![Airdrop](/images/blog/airdrop-nft-memberships/dashboard.gif)

## Using code

Of course, granting keys is possible through code! The `grantKeys` function on the lock can be called by any _lock manager_ or _key granter_ ([read more about the roles](https://docs.unlock-protocol.com/core-protocol/Public%20Lock/access-control)). In order to reduce risks, we recommend using a dedicated `key granter` in your application so that if that account (or contract) was compromised, the attacker could "only" grant new keys (which could be cancelled by a lock manager too...).

Then, on your code you would call the `grantKeys` function](https://docs.unlock-protocol.com/core-protocol/smart-contracts-api/IPublicLockV10#grantkeys). This function can in fact be called to grant multiple keys to multiple users at once. There is a practical limit based on the block-size of each chain. You would call this function with 3 arrays of the same size:

1. the recipients
2. the expiration timestamps
3. the key managers

---

Airdropping memberships is a very important part of the Unlock protocol because it enables not only multiples types of memberships, but also new ways of rewarding or incentivizing community members!
