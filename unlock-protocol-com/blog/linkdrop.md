---
title: 'Linkdrop: granting keys through links!'
authorName: Julien Genestoux
publishDate: October 9, 2019
description: Linkdrop provides a simple mechanism which lets anyone create links to "claim" keys for free!
image: /images/blog/linkdrop/linkdrop.png
---

In the blockchain world, one of the most potent distribution mechanisms is called **an airdrop**. It is a way for token creators to send their tokens to a large set of people, without requiring these recipients to perform transactions and pay fees themselves. Unfortunately it is often used as a vector for spam even though it is a very useful tool to boostrap a fairly wide adoption.

At Unlock, [we believe](/blog/mission-vision/) that all creators should make a sustainable living from their work, while respecting the time, privacy and health of their community... and spam does not really fit in this vision!

Additionally, when talking with creators, they often mention that they want to give away some access keys to their most loyal fans or others members of their community as a way to thank them for their contributions. Of course, our smart contract already includes a `purchaseFor` method which anyone can invoke in order to purchase a new key and assign it to someone else. In the Ethereum world, this is akin to a "meta transaction", a transaction whose beneficiary is not its sender.

Unfortunately, this function, `purchaseFor` requires the purchaser to know the recipient's Ethereum address in advance which is not always practical. Luckily, the team at [LinkDrop](https://linkdrop.io/) found a very good way to solve this: they created a system which lets anyone _create links_ with attached keys. The first user who clicks on a link can then claim a unique key for it. This way, someone who wants to give away keys to a lock can easily do so by creating droplinks which they would then send to users by email, social networking, or even for promotional events.

For which lock would you want to generate links? You can easily [use Linkdrop's tutorial](https://github.com/LinkdropHQ/linkdrop-unlock)!
