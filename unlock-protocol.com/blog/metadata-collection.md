---
title: Collecting Metadata for a Purchase
subTitle: Connecting lock owners and key holders
authorName: Christopher Nascone
publishDate: February 1, 2020
description: Lock owners can require information from key purchasers before the transaction is inittiated.
image: /static/images/blog/unlocking-smart-contracts/code.jpeg
---

# Meeting the Needs of Our Users

Over the course of the past year, Unlock has powered [membership](/blog/tokenizing-memberships/) opportunities like [newsletter subscriptions](/blog/introducing-newsletter/), [event](/blog/ethwaterloo-tickets/) [tickets](/blog/ethcc-tickets/), and [ad-free experiences](/blog/forbes-in-the-news/). One thing we've heard from creators who own locks is that in some cases they need to gather information from key purchasers before they buy a key.

For example, a newsletter publisher may want to email updates to subscribers. We offered a way for newsletter publishers in particular to gather some information through our [newsletter subscription app](/blog/introducing-newsletter/), but there were some limitations to that approach. For starters, publishers could not host this experience within their own site. Further, they couldn't specify which information could be collected. For anyone who needed to collect more than just an email address (or ran something other than a newsletter), we needed another solution.

# Broader Availability of Metadata Collection

Today we're proud to announce an extension to our embeddable Paywall application which allows creators to specify a number of form fields which should be presented to the purchaser before the purchase transaction begins. The technology behind this is our [metadata system](https://docs.unlock-protocol.com/developers/metadata) which we've already used behind-the-scenes in a few places. If you're already familiar with our Paywall, you can learn how to add metadata to your existing configuration [here](https://docs.unlock-protocol.com/applications/paywall/advanced-paywall-configuration). For everyone else, the remainder of this post is a worked example.

# Collecting Information From Purchasers

## The Scenario

Consider a blog that allows anyone to read published articles, but offers a perk for paying members: they get early access to articles before they are published in the open. One way to implement this is to collect an email address from paying members, which will be used to notify them of a new article and link them to a private page.
