---
title: Creating your first lock
subTitle: A lock is a smart contract which holds the list of members of your community.
authorName: Julien Genestoux
publishDate: July 15, 2019
description: Locks are the core of the Unlock protocol. They are smart contracts deployed on the Ethereum chain which lets your community become members by purchasing keys to your lock.
image: /images/blog/first-lock/new-lock.jpg
---

![new lock](/images/blog/first-lock/new-lock.jpg)

A lock is a way to represent a _membership_. Each member has a key to the lock which they can purchase from the lock directly.

## So, you want to create your first lock?

First, you need an Ethereum wallet. On desktop, the most popular is [Metamask](https://metamask.io/), but things should work similarly with any Ethereum wallet. For now, we recommend using a desktop computer rather than mobile device because the UI is much cleaner there.

Go to the _Creator Dashbboard_ on [https://unlock-protocol.com](https://unlock-protocol.com). This creator dashboard will help you manage your locks (create them, update them, or view some data about them...).

For now, it should be empty and look like this:

![empty dashboard](/images/blog/first-lock/empty-dashboard.png)

On the top left, you can see which network you're connected to. Ethereum has a single "Main Network" and several test networks such as Goerli. Make sure you're on the Main Network. You can also view which address your wallet is currently using.

On the top right, a button lets you create a lock. Once you click on it, a form appears and lets you prepare your first lock.

![create lock form](/images/blog/first-lock/create-lock-form.png)

When creating a lock, each field can be edited.

### The name

First, the name. The lock's name is stored on-chain and is used by other applications which may want to show information about your lock and its keys, such as [Etherscan](https://etherscan.io/), [OpenSea](https://opensea.io/) and more. Use something descriptive but fairly short as every character counts toward the fees you'll pay to deploy this lock.

### The Duration

Each key has a duration. At the end of the duration the membership is considered "expired" and should not grant access to the key holder. In this case, members can renew to make their key valid again.

The duration is expressed in seconds in the smart contract, but given the inherent latency of the blockchain we believe that durations shorter than 1 day are not practical. Most creators will pick durations of months to years.

Picking the right duration is useful because a key holder can "cancel" their key by sending it back to the lock to get a refund. The elapsed duration is used to assess the amount to be refunded.

### The number of keys

As the lock owner you can choose how many people can purchase keys. This is important because many membership are "exclusive". For example, an artist may want to only allocate a small number of keys to their truest fans (in that case, they would have several locks, each represented a _level_ of membership).

It is possible to set an unlimited number of members.

Note that expired keys still count toward the maximum number of keys, but as we've seen, keys can be extended (by sending another payment to the lock) and they can be transfered as well...

### Key Price

The price of each key is made of 2 things: the currency and the amount of that currency. By default, our UI uses Ether, the native Ethereum currency, but the UI also leaves the option to use [DAI](https://makerdao.com/en/dai), a stable coin, whose value is always 1$. <small>(Our smart contract actually supports any [ERC20](https://www.investopedia.com/news/what-erc20-and-what-does-it-mean-ethereum/). Please get in touch if you need to deploy a lock which uses something else than DAI!)</small>

Once you've chosen your currency, you can set the price you want, from 0 to billions!

### Submitting

Make sure all values you've chosen are correct. Most of them cannot be changed once the lock has been deployed.

After submitting, your wallet will ask for a confirmation. Deploying a lock is fairly "expensive" in gas (at least 4M), because it a a full contract deployed under your address. Unless deploying the lock is urgent, you should probably set a low gas price.

It is important that you wait for the lock to be deployed, because its address (starting with `0x`) will only be final then, and that address will be used by your members to send payments and you don't want them to send a payment to the wrong address!

### No Ether? No problem

Locks themselves can be transfered. This means that we can create the locks for you and transfer them to you. If we do this, you do not even need Ether to pay for the fees. We will create the lock based on your needs and send it to your address so you can start using it ASAP!

## Next!

That's it! Your lock has now been created. The next step is to integrate it on your website to let people become members. See the wiki page on [how to integrate unlock](https://github.com/unlock-protocol/unlock/wiki/Integrating-Unlock-on-your-site), and a few posts on how to integrate this in your CMS, such as [Known](/blog/integrating-unlock-with-known/), or inside a front end web framework, such as [React](/blog/integratating-unlock-react/).

If you need help for your own stack, please, reach out, we're here to help!
