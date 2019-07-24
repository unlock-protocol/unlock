---
title: Unlock this blog
subTitle:
authorName: Julien Genestoux
publishDate: July 24, 2019
description:
image: /static/images/blog/unlock-blog/hero.jpg
---

![new lock](/static/images/blog/unlock-blog/hero.jpg)

Unlock is a [protocol for memberships](/blog/protocol-for-membership). It helps creators monetize their community (fans, supporters, or even simple users) by helping them deploy a lock and sell access keys to this lock (they can chose their currency, price, the duration of the keys and the number of keys they want to sell...).

We decided to create a lock for members of our community. It's a good way for us to show what's possible with a lock. Since our goal was not to make money, we decided to charge _0 eth_ for the keys.

When integrating the lock on this blog, we decided to reflect the membership status in 3 different things:

1. The lower bar at the bottom of every page. ⬇️ Since I am a member, mine shows this:

![member bar](/static/images/blog/unlock-blog/member-bar.png)

2. On each post, users can view and leave [comments](#comments), but only if they are members themselves.

3. On some posts, we have decided to lock some content. For example, read this Google Slideshow from a presentation I made at Betaworks about [Non Fungible Tokens](/blog/non-fungible-tokens-betaworks).

# Bundling

One thing to note is that the lock we use on this blog is in no way limited to this site. We could (and will, stay tuned...) re-use the lock on different sites or applications. As a matter of fact, you could even add *our* lock to *your* site or application, if you wanted to only grant access to people who are part of our community. That approach is how creators can deploy "bundles": a single lock is used on several different websites or applications!

# Several locks

Another important detail is that we could very well add multiple locks to this site. Maybe we'd have one for our most loyal fans (with a limit on the number of keys), and maybe we'd have one for our everyone else, using another currency or one which we would "share" with several other applications to be part of their bundle... etc.

# A Non Fungible Token

Of course, this website implements what we call [optimistic unlocking](/blog/hello-optimistic-unlocking/). Basically, our blog will treat you as a member as soon as you've sent the transaction, without waiting for it to have completed mining. But, once the transaction actually goes through, you will receive you unique access key. It is a non fungible token and you can [view them all on this page](https://opensea.io/assets/unlock-blog-members).

Like all other non fungible tokens, you can trade your keys! For example, I am auctionning my key to this very blog for 0.1Eth: get it for free here, [or buy it from me](https://opensea.io/assets/0xb0114bbdce17e0af91b2be32916a1e236cf6034f/2/sell#!)!




