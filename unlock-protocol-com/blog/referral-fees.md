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

<blockquote>
Example: Let's imagine that an indie developer created a Ghost plugin to add support for Unlock. It would be perfectly acceptable in that scenario for the Ghost plugin author to set their own address as the referrer address in the plugin.

</blockquote>

Historically, the referrer address received UDT (the protocol governance tokens) on applicable membership purchases for paid memberships that were sold on supported networks.

With this new version of the protocol, each lock manager can additionally decide to share the proceeds of each purchase with a referrer.

## Setting referrer or affiliate fees

To set the referrer fee for a lock, the lock manager sets a custom referrer fee on their lock contract for a specific referrer address by calling *setReferrerFee* and passing both the address of the referrer they want to share the proceeds with, as well the the percentage of the sale price (in basis points) they will share. By default, the referrerFee is 0 for any address.

In addition to setting referrer fees for specific addresses, lock managers can also use the zero address (0x0) to set a default fee that will be paid to *any* address that refers in a paid membership.

## Platforms

We believe that the emergence of web3 will not replace platforms, but will instead “unbundle” them and remove lock-in. For example, we think that platforms like Substack, YouTube or Patreon should offer the ability to their creators to use the Unlock Protocol as a way to offer memberships, and, optionally, lock content so that only members can access it.

With the referrer fee mechanism, each platform could, for instance, choose to enable that feature for a creator and their locks *only* if the lock has a specific referrer fee for them. In essence, the platform would be explicitly compensated for promotion and distribution of the creator's content.

This mechanism opens the door for incentivized distribution by platforms or other affiliates *who get paid* for bringing new members to the creators using their products!

## A visual walkthrough of Unlock referrer and affiliate scenarios

The referrer fee mechanism is extremely flexible and extremely powerful. The presentation below illustrates multiple scenarios where developers or creators could implement referrer or affiliate fees in order to incentivize or support distribution of their products or memberships.

<div style="position: relative; overflow: hidden; width: 100%; padding-top: 0%;"><iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQq_4ktW66q-Hn68Q07cazlMaQujJjSJWQHCz2LuzSAElBkmArOmlN8p6Aq5y6lnajicI5T7WvlKrXA/embed?start=false&loop=false&delayms=3000" frameborder="0" width="680" height="411" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe></div>

Have questions about implementing referrer or affiliate fees with Unlock? Hit us up in the [Discord](Discord)!
