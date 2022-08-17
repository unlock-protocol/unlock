---
title: Unlock Protocol Expands Monetization Options for Developers, Creators, Platforms, and Affiliates
subTitle: Unlock Protocol now supports referral fees, affiliate fees, and other monetization options
authorName: Julien Genestoux
publishDate: August 16, 2022
description: Unlock Protocol now supports referral fees, affiliate fees, and other ways for developers, creators, platforms, and the Unlock ecosystem to monetize.
image: /images/blog/referral-fees/header-affiliate.png
---

The latest version of Unlock Protocol introduces a whole new feature: referrer fees.

The main idea behind this is to enable revenue sharing between the lock (the membership smart contract) and the *distributor* of memberships.

## How do Unlock Protocol referrer fees work?

The Unlock Protocol *purchase*, *extend*, and *renew* functions include a *referrer* parameter. This parameter is an address that is expected to be the address of the entity that “triggered” the purchase by the user.

<aside>
💡 Let's take an example: let's imagine that an indie developer created a Ghost plugin to add support for Unlock. It would be perfectly acceptable in that scenario for the Ghost plugin author to set their address as the referrer in the plugin.

</aside>

Historically, the referrer address received UDT (the protocol governance tokens) on applicable membership purchases for paid memberships on supported networks.

With this new version of the protocol, each lock manager can additionally decide to share the proceeds of each purchase with a referrer.

To achieve that, the lock manager sets a custom referrer fee on their lock contract for a specific referrer address by calling *setReferrerFee* and passing both the address of the referrer they want to share the proceeds with, as well the the percentage (in basis points) they will share. By default, the referrerFee is 0 for any address.

In addition to setting referrer fees for specific addresses, lock managers can also use the zero address (0x0) to set a default fee that will be paid to *any* address that refers in a paid membership.

## Platforms

We believe that the emergence of web3 will not replace platforms, but will instead “unbundle” them and remove lock-in. For example, we think that platforms like Substack, YouTube or Patreon should offer the ability to their creators to use the Unlock Protocol as a way to offer memberships, and, optionally, lock content so that only members can access it.

With the referrer fee mechanism, each platform could, for instance, choose to enable that feature for a creator and their locks *only* if the lock has a specific referrer fee for them. In essence, the platform would be explicitly compensated for promotion and distribution of the creator's content.

This mechanism opens the door for incentivized distribution by platforms *who get paid* for bringing new members to the creators using their products!
