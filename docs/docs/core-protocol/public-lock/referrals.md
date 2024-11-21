---
title: Referrals
description: The Public Lock membership contracts includes a referral mechanism.
sidebar_position: 6
---

Every transaction that includes a transfer of value between a purchaser and the Public Lock smart contracts includes a `referrer` parameter:

- [`purchase`](/core-protocol/smart-contracts-api/PublicLock#purchase)
- [`extend`](/core-protocol/smart-contracts-api/PublicLock#extend)
- [`renewMembershipFor`](/core-protocol/smart-contracts-api/PublicLock#renewmembershipfor)

The referrer can optionally receive a share of the price paid by the purchaser.

### Setting a referrer fee

A lock manager can call the `setReferrerFee` function on the Public Lock contract to set a specific referrer fee for a given address. This function takes 2 arguments. The first one is the address of a `referrer` and the second one is the referrer fee percentage, expressed in basis points.

As such, the lock manager can set multiple referrer fees for various referrers. For example a given referrer could receive 10% of the price paid, while another one could receive 30%.

Finally, if the lock manager sets a referrer fee for the `0x0` address (the zero address), then the referrer fee will apply to _any_ referrer address.

It is possible to query a contract to identify the referrer fee set for a specific address by querying the `referrerFees` function.

### Examples

This presentation includes multiple of examples of how the referrer fees can be used to reward platforms,

<div style={{
  "position": "relative",
 "overflow": "hidden",
 "width": "100%",
 "padding-top": "0%"
 }}><iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQq_4ktW66q-Hn68Q07cazlMaQujJjSJWQHCz2LuzSAElBkmArOmlN8p6Aq5y6lnajicI5T7WvlKrXA/embed?start=false&loop=false&delayms=3000" frameborder="0" width="680" height="411" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe></div>
