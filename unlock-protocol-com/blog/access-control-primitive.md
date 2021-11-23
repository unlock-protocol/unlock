---
title: The Access Control Primitive
authorName: Julien Genestoux
publishDate: March 10, 2020
description: The web is an operating system. Unlock Protocol is its access control primitive
image: /images/blog/first-lock/new-lock.jpg
---

[Wikipedia says it best](https://en.wikipedia.org/wiki/Operating_system):

> An operating system (OS) is system software that manages computer hardware, software resources, and provides common services for computer programs.

As the Coronavirus is bringing the physical world to a halt through a denial of service attack on healthcare systems, it's increasingly obvious that the _virtual_ layer that we've been building for the last 40 years is acting as an **operating system for mankind**. As a system, Internet provides the underlying architecture upon which we communicate, work, collaborate, teach, learn, commerce and even have feelings.

## The Interet Operating System

Operating Systems provide a set of primitives which are used by applications running on that same operating system. Internet is not different. On the internet, these primitives take the form of **Protocols**!

For example, your computer (or phone!) has an addressing primitive. Do you remember when people talked about your `C:\` Drive? On the web, it's the job of the URL. The format of these URL is protocol which describes to web browsers how to access a file.

Another example is _identity_. Computers have "accounts". On the web, this identity layer is now mostly controlled by Google and Facebook... In the blockchain world, public-key cryptography provides that layer. On top of the identity layer, sits an authentication layer. On the web, this time, the [OAuth](https://en.wikipedia.org/wiki/OAuth) protocol enables internet users to login on a website with their identity from another website. It's a great experience because it reduces the need to create accounts (and remember passwords) on every single website.

Internet is of course, powered by dozens of protocols. Do you know about `TCP`, `HTTP`, `FTP`, `XMPP`, `WebSub`, `IPFS`, `NTP`, `IMAP`, `DNS` or `Bitcoin`? What about `IRC`, `SSH`, `MQTT`, `DHCP`, `SIP`, `POP`, `SMTP`?... They all have a distinct purposes.

# Access Control

As we've seen above *identity is a core primitive of any operating system*, including Internet. It is critical to another very important primitive called **Access Control**. _This primitive enforces which user gets access to what resources inside of the Operating System._

For example, on a computer or a server, when a user creates a file, they can determine which other user can access it. Each application has a set of users who can run it... etc.

> On the internet, the access control layer is critical, because access control represents an opportunity for monetization, [away from attention](https://medium.com/unlock-protocol/the-end-of-the-ad-supported-web-d4d093fb462f).

Each creator, whether they [compose music](http://phunkstatik.zplit.eth.link/), [record videos](https://chrisblec.com/CHAI/), [write content](https://bit.ly/the-defiant) or software should be able to decide the terms for access, including the price of a membership, the duration of a membership, or even the number of members!

It is already happening: Google, Facebook, Apple and Amazon **already own identities** and the logical next step is to own access control. Apple made the first move with the AppStore, and later, Apple Pay. Google follows very closely. As more and more people get online and purchase access to content or software, these 2 companies increasingly act as gatekeepers. Creators don't decide of the terms: Apple and Google do. It's pretty clear that Facebook and Amazon are pursuing similar strategies, the first by building Libra, a currency for the internet, and the second one by owning more and more of the internet's underlying architecture, including users' wallets.

At Unlock, we strongly believe that a _healthy web is one where creators are rewarded by their fans_, not through them. We also believe that the web needs to be decentralized to remain useful: permissionless innovation has been the main driver of progress and we do not want to accept a world where a few tech companies decide what content is "worth" being produced, distributed or even monetized!




