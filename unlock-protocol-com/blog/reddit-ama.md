---
title: Highlights from Unlock's Reddit AMA on r/Cryptocurrency!
subTitle: Julien Genestoux and Amber Case answer Reddit's questions about Unlock
authorName: James Au
publishDate: September 24, 2021
description: Unlock's CEO Julien Genestoux and adviser Amber Case answer Reddit's questions about Unlock
image: /images/blog/reddit-ama/reddit-ama.png
---

![reddit-ama](/images/blog/reddit-ama/reddit-ama.png)

Thanks to everyone who joined [the recent r/Cryptocurrency AMA](https://www.reddit.com/r/CryptoCurrency/comments/pu1xyc/im_the_founder_of_unlock_a_membership_protocol/) with our CEO Julien ([u/julien51](https://www.reddit.com/user/julien51/)) and adviser Amber ([u/Consistent__Patience](https://www.reddit.com/user/Consistent__Patience)), and to the excellent hosts for helping make it happen. Here’s some highlights, starting with the most high level questions, then getting into the weeds on various use cases, and technical/company questions.

## **What’s Unlock Protocol & Why Do We Need It?**

### *Can you explain in layman’s terms here on Reddit what [Unlock] does? (u/who_loves_laksa)*

Unlock lets creators deploy a membership contract so that they can easily limit access to their content, work and community to people who have a valid membership!

You can think of Unlock as a decentralized version of Patreon but also not with a single platform. Imagine that if supporting a creator on Patreon would give them access to some secret/members-only content on their subreddit for example. Or to a private channel on their Discord, etc.

As an open web fan, I really want the core web protocols to include a monetization protocol so that the answer is not always "I'll sell my visitors attention". Generally, it looks like the web is moving toward more and more memberships. I don't want Apple and Google and Amazon to own that and we need an easy way to do that across the web, using the same patterns!

### *Why use Blockchain for your product? (u/KucingRumahan)*

Because we want memberships to be permissionless and decentralized. We don't want to build yet another middleman or gatekeeper.

### *Unlock seems like a good idea for people who already use ETH, but is it really a better or easier solution for people who just use fiat to buy tickets/subscriptions/etc.? If so, how? (u/geekteam6)*

I think it is also better for them! First, we support credit cards, which makes things much easier for them, but then we actually build a protocol, a standard way of handling all of their memberships, across many websites, applications or spaces.

Right now, each of my membership is on a different website, has different "terms" (can cancel only at certain times, etc.) and they are really hard to manage. I also can't transfer them to someone else.

Using a crypto wallet is an investment that I believe everyone will eventually make. Each year it's getting easier and soon people won't think too much about it. The hard part only happens once, and after that you're all set for all of your memberships, rather than creating new accounts on every web/app each time I want to get a membership!

### *Please explain more about how Unlock, Inc. monetizes the protocol? How do you make money?(u/ForeignShooter)*

That's a very good question! Unlock Inc. has built a credit card integration that lets users who do not have a wallet or those who have one but don't want to pay with their cryptocurrency purchase one with their credit card. When that happens, Unlock Inc. will take a small fee. (I should note that anyone else could build their own credit card integration on top of the protocol, we don't get “special access" or anything!).

We also believe there is value in holding governance tokens for a protocol that is widely used and we want to eventually keep about 20% of these governance tokens (the rest will be distributed to users of the protocol, thru grants and to the DAO).

### *Do you have a token? if so what are the tokenomics? (u/Greedy-Visit-1905)*

We have a governance token because we think every protocol should be governed by its community of users and developers. You can find more details about [it in our docs](https://docs.unlock-protocol.com/governance/the-unlock-token).

It's already started to get distributed. You can find the current breakdown on etherscan. As you can see [there] the company still owns about 78% of the supply but our goal is to eventually go down to about 20%. We have distributed a large amount of tokens to the DAO contract, and through grants.

## **Use Cases for Unlock**

### *Could Unlock be used as a payment system for creators in non-blockchain virtual worlds like VRChat or Second Life? If so, how? (u/slhamlet)*

Yes! Absolutely! First, as long as there is a way to display some kind of web-view or redirect the user to one, it is possible to get the user to authenticate (sign a message) and purchase a membership, using either crypto or their credit cards!

There's actually an integration with Decentraland right now, as well as Discord and other networks. In Decentraland, some users have locked access to a saloon! [More details here](https://unlock-protocol.com/blog/decentraland).

### *Do you think this could be used for something like a decentralized OnlyFans? (u/roymustang261)*

Absolutely! We even submitted a Request For Grants and two teams applied and have been building for the last few weeks! Combined with other technologies and protocols, we believe a fully decentralized UnlockFans is possible!

And also, we have [a wishlist of integrations we'd love to see built](https://www.notion.so/Request-for-Grants-9aac49be49124e70a88543bc79748555).  If you have ideas for building on any of these, [check out the grant program](https://unlock-protocol.com/blog/token-grant-program)!

## **Technical/Roadmap/Company Questions for Unlock**

### *Are there any automated workflows to assign NFT's in bulk? Is Unlock able to facilitate sets that contain thousands of item both in capacity as well as in the tools required to manage them? (u/Thefriendlyfaceplant)*

Yes! The lock contract has a grantKeys function that can be called by any lock manager (creator of the lock by default) to "air-drop" memberships to many users! We don't provide a UI for this, but it will come soon!

This is on the roadmap! Expect some updates on this by the end of the year. It's one of the most frequent requests! If you'd like to discuss more about what you're looking for in particular, please join the Discord and say hello!

### *How would [MOON] integration work? Is there any way to deploy a lock to a custom network?  If I create a lock on XDAI can I require users to pay in tokens on another network?  (u/nanooverbtc)*

No, you would need to deploy the lock on the same network as the currency you chose.

We are actually working on making it really easy to get deployed on any network [and] are working on releasing on Arbitrum in the next few days/weeks.

### *Can you tell me about the Unlock token (UDT)? What is the max supply? How is it minted? What's the distribution schedule? Benefits to holders etc? (u/Wargizmo)*

UDT does not currently have a max supply. It is actually built to be inflationary using a log curve (always more, but fewer and fewer more). The goal here is to reward all usage, but with a disproportionate amount to earlier users, who are contributing to the economies of scale.

This is a governance token, its main goal is to let protocol users and developers collectively decide on what they want the protocol to achieve, and how it should work in the long term.

[Here is some information](https://docs.unlock-protocol.com/governance/the-unlock-token) about UDT's tokenomics.

### *When is UDT going to list on bigger exchanges (u/Available-Ad-3713)*

Unlock has always been meant to be decentralized. Recently we deployed a governance contract which lets the community of token holders vote on proposals that they come up with! Unlock has always been meant to be decentralized. Recently we deployed a governance contract that lets the community of token holders vote on proposals that they come up with!

You can [join the governance channels here](https://unlock.community/).

### *I see that you are on [Coinbase Ventures](https://ventures.coinbase.com/). Can you explain how they are involved with Unlock? (u/ForeignShooter)*

Yes, they are an investor in Unlock Inc.! They participated in our first round of funding in the summer of 2018 and they own a small piece of equity in the company. (More info [can be found here](https://medium.com/unlock-protocol/unlocking-some-exciting-news-5ad0f3889375).)

### *What is the biggest barrier to entry for your project? (u/surrender_the_juice)*

Crypto adoption! Too few people have wallets, or even understand how to use one. It's coming, and I believe we're giving reasons to use wallet to people who are not into DeFi, but sometimes I wish it was faster!

[Read the whole thread here](https://www.reddit.com/r/CryptoCurrency/comments/pu1xyc/im_the_founder_of_unlock_a_membership_protocol/), especially if you’re already a member of r/Cryptocurrency and are interested in using Unlock with MOON, the community’s official token, because we go into much more MOON-y details there!
