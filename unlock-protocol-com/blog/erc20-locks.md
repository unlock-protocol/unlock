---
title: Introducing ERC20 Locks
subTitle: Creators can chose any Ethereum based token when they sell keys to their locks.
authorName: Julien Genestoux
publishDate: June 13, 2019
description: 'A lot of the creators that we spoke with were concerned by the volatile nature of Ether when using it to price their keys: we needed to support stable coins. The ERC20 standard is a way to create tokens which are all compatible, even though they may have different implementations.'
image: /images/blog/erc20-locks/hero.jpg
---

![Dashboard Lock](/images/blog/erc20-locks/use-dai.jpg)

When creators deploy their locks using our dashboard, they can chose the following:

- the name of their locks
- how long each key is valid (from seconds to centuries!)
- how many keys they are selling (with the ability to sell an unlimited amount)
- and more importantly, the price of keys

Up until today, the price of the keys had to be in Ether. Today, we're happy to announce that we now support any ERC20 token as the currency for the price. As a creator you can now sell access to your content or features inside of your (d)applications using BNB, MKR or even BAT...

## Using stable coins

Out of ERC20 tokens, there is a category of tokens which is special: stable coins. These tokens have a value that is designed to be stable, most often against US dollars. Some of them are actually backed by financial organizations who guarantee a 1 to 1 exchange (such as USDC for example), while others are based on onchain collaterals (DAI is a good example of that!), while finally, a 3rd category is based on seigniorage: the supply expands and retracts based on price fluctuations. Learn more about stable coins with [this overview](https://multicoin.capital/2018/01/17/an-overview-of-stablecoins/) from Multicoin.

A lot of the creators that we spoke to were worried about the use of fluctuating currencies. If the price went down, they would lose some of their revenues, and if it went up, they were rightfully worried that their customers may not end up buying keys from them... as they could be waiting for appreciation of their tokens.

We believe that many locks will end up being priced using stable coins, which is why our dashboard UI will let creators pick DAI as the currency<sup>1</sup>.

## Bringing utility to utility coins!

We also strongly believe that many ERC20 currencies are "community" currencies. Their value is rooted in the fact that it is a very specific use. For example, MKR is a governance token which lets owners of it vote on changes in the Maker systems.

Now, nothing says that the MKR tokens, which are actively traded on several exchanges could not be used for other purposes, such as purchasing access keys. For example, Maker could organize a launch party for their upcoming multi-collateral currency where tickets are sold using MKR. For this, they could use Unlock's [ticket application](https://tickets.unlock-protocol.com/)...

## Get started today

Head out to the [creator dashboard](https://unlock-protocol.com/) now and click on the _Create Lock_ Button:

![Create a Lock](/images/blog/erc20-locks/create-lock.png)

Then, select DAI as the currency when picking up a price:

![Create a Lock](/images/blog/erc20-locks/select-dai.png)

Choose how much you want to charge (you can still change that later, but not the currency...). And hit submit. Once that transaction has been mined, your lock has been deployed!

Once you have embedded the lock on your page, your readers are offered the ability to Unlock it:

![A DAI lock](/images/blog/erc20-locks/dai-lock.png)

When clicking on it, they are required to approve 2 transactions (the ERC20 could be a bit simpler... but we have ideas on how to solve that!):

1. They need to approve the lock to withdraw some of their DAI (just the amount for the key purchase!):

![Approve the ERC20 transfer](/images/blog/erc20-locks/approve-withdraw-erc20.png)

2. Actually purchase the key (the lock contract will withdraw the right ERC20 balance):

![Purchasing the key](/images/blog/erc20-locks/purchase-key.png)

Once the transaction as been confirmed, the customer will receive their non fungible token!

We're very excited about this release, because it opens the door to several other releases in the next coming weeks! Stay tuned ;)

<sup>1</sup> Reach out if you need to deploy a lock using another ERC20 of your choice: we can help, even if we wanted to keep our UI minimalistic.
