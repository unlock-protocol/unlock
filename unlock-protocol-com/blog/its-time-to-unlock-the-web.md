---
title: It’s Time to Unlock The Web
subTitle: The web needs a better business model — and we believe the technology is finally here to do it.
authorName: Julien Genestoux
publishDate: April 27, 2018
description: The web needs a better business model — and we believe the technology is finally here to do it.
image: /images/blog/itstimetounlocktheweb/unlocklegacy.jpg
---
It’s become dangerously clear in the last few years that the business model we thought would support a vibrant, open web just isn’t going to work any more. Driving more and more eyeballs to ads was always considered ethically and morally borderline, but today, monetizing clickbait isn’t just economically fragile: it’s feeding our democracies with more misinformation and fake news.

The thing is, plenty of publishers and creators have been ahead of the curve on this one, even if we don’t give them much credit for it. They knew that free content can, in fact, be very costly and that **real freedom comes from knowledge that’s expensive to produce**. They understood that when Stewart Brand famously said that [“information wants to be free”](https://en.wikipedia.org/wiki/Information_wants_to_be_free) he meant free as in “speech” (_libre_), not free as in “beer” (_gratis_).

Some publishers, like the New York Times, got a lot of heat when they introduced [their paywall](https://www.nytimes.com/2011/03/18/opinion/l18times.html), but the trend they set isn’t reversing: they now have 3M subscribers and aim for 10M by [2020](https://www.nytimes.com/projects/2020-report/index.html). Hundreds of other news and content organizations are going in the same direction, [including this very platform](https://medium.com/membership).

Another trend emerged in the last 10 years: ownership does not seem to matter as much as it used to. People are getting rid of their meticulously amassed records and DVD collections to replace them with monthly subscriptions to Spotify and Netflix. Ride sharing platforms have put yet another dent in the car ownership status symbol… etc. **My generation is putting access above ownership.**

## The Impossible Dilemma

And yet getting people to subscribe or join a cause is still just as hard as ever. Many publishers are going at it alone, building their own systems at great expense so that they can stay independent and in control of their decisions, even if it adds friction and create balkanization on the consumer’s side, leading to lower conversion rates.

On the other end, ad supported networks have the ability to leverage the whole web for tracking in order to improve their targeting and since they reward page views, Google and Facebook have slowly but surely captured attention and distribution: they now control both supply and demand.

Some creators lean on gatekeepers like Netflix or Spotify or Patreon, who take payments direct from users and then redistribute them back to creators. Apple, Google or Amazon have also identified the opportunity to become the payment layer of the web and are starting to court publications. But if you’re a creator, why would you rely on a tech company that will change its rules, again? Or one that will censor content for unclear reasons? Or one that could limit distribution to the highest bidders only?

Surely there must be another way?

## Yes, there’s another way.

When I started my last company, [Superfeedr](https://superfeedr.com/), I wanted to solve a different problem that creators were having online. We were looking for a different way to help information spread around the web more quickly, and so we built a way for anyone to take their feeds of information, standardize them — building on RSS, one of the pillars of the open web — and push that information around the web with the PubSubHubbub protocol (or [WebSub](https://www.w3.org/TR/websub/), its successor).

That combination of things wasn’t an accident: I’ve been an open web nerd for ever, and the idea of a world wide network with no gatekeeper has always felt like the future… the future of knowledge, of information, of social interactions. And, obviously, that’s a future worth fighting for.

But distributing information quickly wasn’t enough. Over time, I saw the silos emerging, and the tension between creators, platforms, and users building into full-scale battle. It became clear that [things would never work](https://medium.com/ouvre-boite/take-my-money-290bea3532ba) if the systems weren’t in sync with the needs of consumers and creators. **The lack of clear business model directly led to centralization of data and power in the hands of a few silos.**

Now, I think the technology exists to make those systems. So that’s what I’m working on. **It’s called [Unlock](https://unlock-protocol.com/).**

Unlock is meant to help creators find ways to monetize without relying on a middleman. It’s a protocol — and not a centralized platform that controls everything that happens on it. This time, though, it’s not about helping information spread faster, it’s about helping value spread more easily. It’s about taking back subscription and access from the domain of middlemen — from a million tiny silos and a handful of gigantic ones — and transforming it into a fundamental business model for the web.

![unlock original logo](/images/blog/itstimetounlocktheweb/unlocklegacy.jpg)

## Here’s how it works.

**For creators**, Unlock provides simplicity. Unlock gives them a JavaScript snippet which lets creators embed locks on their own websites that restrict access to people who have the right key. A lock is just an “access control list”: the list of consumers who are allowed to access their creation (because they own a key). It makes adding a membership layer to your website, or even to a single article, just as easy as embedding an ad.

**For users**, Unlock provides consistency. Up until now, subscriptions have been totally chaotic, with hundreds of different approaches, requiring you to keep a collection of accounts — and passwords! — to access all the things you care about. There’s no intelligent way to connect them together, unless you’re the platform that controls the network. The blockchain allows Unlock and creators to know only who has access to what, and nothing more.

Yes, I said it: **the blockchain**. _And I hear the eyes roll._

It’s true that the blockchain is a huge thing that most people don’t really understand, except that they know some people say it’s meant to fix everything. And it’s true that most crypto projects are confusing or underwhelming or over-the-top.

But Unlock isn’t whimsical or unwanted; it’s very practical, very simple, and very tangible. We’re using the technologies at our fingertips to help solve a real problem which is undermining the world around us, in a fully decentralized way.

I think Unlock will change how content is accessed and paid for, and build a much healthier ecosystem for everyone. It has the potential to become the way people access restricted content on the web, in the same way that the web browser eventually became the way people consumed most content on the web.

## What does it enable?

Because Locks are the “nodes” in the Unlock network, sharing the same code and the same API, they can become a layer on which services can be built — services to perform discovery, recommendations, syndication, and even to build secondary memberships markets.

And what about the network effects that those gatekeeper platforms — the Netflixes, the Spotifys, the Googles, the Facebooks — use to create growth and guarantee attention? That’s achievable too. The protocol is, at its core, **a web-centric protocol that will encourage and reward referrals**. So once a user has unlocked something, the protocol can tell if she shared those links and whether that sharing results in other people getting keys to the same lock. As a reward, the protocol will grant her discount tokens so she can access more content at discounted prices.

This creates a strong network effect where the users who have unlocked content are incentivized to share the best content and convince new users to join the network. That’s good for creators, and good for consumers.

_Can you tell I’m excited?_

## Actually, here’s _really_ how it works

(Feel free to skip this technical section if this bit doesn’t matter to you.)

**Creators deploy smart contracts** (which we call locks) that keep track of who has access to their work. Each creator, and only them, fully owns their locks. They also control these locks: the price, scope, expiration of keys and other terms are set by the creators themselves. They can set up site-wide locks, build shared (bundled) locks with other creators, make distinct locks for each piece of content (micro-payments) or even make locks which don’t represent access to content at all — perhaps just “status” or features.

**Unlock provides a JavaScript snippet** which lets creators embed the locks on their own websites to restrict access to people who have the right key. It makes adding a subscription layer to your website as easy as embedding an advert.

**For users, nothing really looks different** from today. They sign up to access a piece of content, get a key to the things they want through native crypto currencies such as Eth (since we’re building on ethereum). Transactions happen then on the blockchain between the consumers and the creator. There are no middlemen.

**Keys are [non fungible tokens](https://hackernoon.com/non-fungible-tokens-5ba83906b275)**; once they have been assigned, nobody can take them back. Because keys are stored on the blockchain, they don’t require users to use a specific single point of failure in order to gain access or show that they previously did: **keys to locks can be easily used on any application or connected device**. Finally, since the keys are crypto assets, users could also trade them (when applicable) or use them to signal that they belong to a community of supporters.

The Unlock Discount Tokens (Ʉ) are managed by another smart contract which rewards curators and referrers, as well as grant discounts upon purchases. This smart contract is also decentralized, through its ownership and **governance**: each discount token owner can vote on who is the “maintainer” of the Unlock Discount smart contract.

## OK, so what happens now?

Unlock is the next phase in my career, but it’s also the next leg of a fascinating journey which started 30 years ago, when the web was born. We are building on the work of many people who came before us — people who may not have predicted the web that we see today, but did understand the value of decentralization. We also have a clear understanding of the web’s current state: **true decentralization cannot be achieved if economic incentives are not aligned between consumers and creators**.

We’re just starting, and I need your help. We’re hiring a small, diverse and multi-disciplinary team: if you know someone we should hire, send them my way!

If you want to stay in touch, [please leave your email address](https://unlock-protocol.com/). We promise to never share your contact information, or send you unwanted messages.
