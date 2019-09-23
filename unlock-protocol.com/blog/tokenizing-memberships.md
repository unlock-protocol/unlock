---
title: Tokenizing Memberships
subTitle:
authorName: Julien Genestoux
publishDate: September 23, 2019
description:
image:
---

The [web needs a new business model](https://medium.com/unlock-protocol/its-time-to-unlock-the-web-b98e9b94add1) which does not lead to privacy erosion or to centralization. In the last 20+ years that the web has been part of our daily lives, we've been able to witness some of the things that it's really good at and **creating communities is definitely one of its unique strengths**. We're all members of dozens of communities online: from our own social circles to the web applications we use every day.

Personally, I am still reading [Macbidouille](https://macbidouille.com/) in my [feed reader](https://feedbin.com/) and using [Medium](https://medium.com) on my phone as I commute. I am also listening religiously to episodes of my [favorite](https://gimletmedia.com/shows/reply-all) [podcasts](https://darknetdiaries.com/)... I am a member of these communities, and many more. I am also the creator of a few, _much smaller_ communities: there are also people following [me on Twitter](https://twitter.com/julien51) or [my blog](https://www.ouvre-boite.com/) or those who are [watching our work on Github](https://github.com/unlock-protocol/unlock/).

At Unlock, we believe that these memberships should be "materialized".

# What does it mean?

As we've seen, memberships can be many things, and there exists a lot on the web. However, for now, at least, a lot of these memberships are either "abstract" (there is no representation of "people reading my blog"), or, too often, locked inside proprietary databases (my Medium membership for example, or the Github stars on our repository). In some cases, the membership is portable (my RSS feed reader allows me to export these subscriptions to another reader for example).

> We believe that by "materializing" them, we can make these membership re-usable, programmable and, criticially, monetizable!

# Tokenization

Someone could build yet another service which stores memberships as associations in a very large database, but that would not be very "web-like". That database would be an obvious single point of failure and whoever manages it could arbitrarily change how it works and break all of the memberships. This is not acceptable.

Luckily, we now have fully permission-less and unstoppable databases in the form of blockchains. The most famous one, Bitcoin provides a secure ledger for its own currency, but more recently, we have seen the emergence of chains which are able to store arbitrary data, which we call **tokens** with the help of smart-contracts.

These blockchains come with the benefits that we are looking for when building native web intrasctruture: open, permission-less, unstoppable... But they also bring a lot of very useful characteristics such as interoperability, as well as ways to build economic incentives, but let's not get too technical here.

There are many types of tokens. The most popular ones are acting as currencies, such as [DAI](https://makerdao.com/en/dai/). Another type of token that you might have heard of are gaming items, such as [CryptoKitties](https://www.cryptokitties.co/). These are part of a large category called [Non Fungible Tokens](https://unlock-protocol.com/blog/non-fungible-tokens-betaworks/).

> At Unlock, we believe that we should use tokens to represent a membership.

Once they're tokens, memberships have a lot of very interesting properties: they exist "outside" of the context on which they're created. For example, the fact that I am a Medium paying member could be re-used by another application (even if Medium refused to disclose this!) to grant me access to some kind of exclusive preview, or the fact that you follow our Github means you could be invited to our launch party... and, if Github decided to remove their ⭐️ feature, you would still be a member of our loyal dev community.

Another aspect, for paid membership is that people could then transfer these memberships to someone else, if they did not want to be part of the community anymore. Users (or creators) could even burn the membership token itself.

# It's not (just) about the money

Being a member of a group does not have to be about "paying" only. I would argue that paying is actually only a very small part of what a membership is. Many memberships are about the social status, showing support, or even just "belonging". Many people proudly show their love of a brand by showing their logos on their cars, clothes, laptops... etc. Non profit organizations understood a long time that getting people to show their support by wearing a colored ribbon 🎗was sometimes as powerful as getting a donation from them. Finally, many sports team will monetize their aficionados' passion by selling hats, jerseys and gear with the colors of the club.

As you can see, the financial transaction is not only optional but often _just a small feature of the actual "membership"_. As a New Yorker subscriber, I know too well that my subscription is probably more about the status than it is about the actual content that I would read...

One of the other benefits of using the Ethereum blockchain as the underlying technology means that the "payments" aspect is already built into the infrastructure: the currencies, the wallets but also exchanges make it easy for members to purchase or sell their memberships, which means that communities who want to monetize through memberships more than through attention can achieve that more easily than by building all of the required infrastructure themselves.
