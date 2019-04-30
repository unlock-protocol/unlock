---
title: Introducing Tickets
subTitle: Now you can buy tickets to real-world events using Ethereum
authorName: Ben Werdmuller
publishDate: April 30, 2019
description: Now you can buy tickets to real-world events using Ethereum and the Unlock Protocol.
image: /static/images/blog/introducing-tickets/introducing-tickets.jpg
---
![introducing tickets](/static/images/blog/introducing-tickets/introducing-tickets.jpg)

The Unlock Protocol isn't just a way to pay to access services on the internet.

We’re building a protocol that can be used to unlock access to _anything_ - and while that means [content, software 
licenses and more](https://unlock-protocol.com/blog/ways-to-unlock-the-web/), we also want to help people sell access 
things in the real world.

In the future, the Unlock Protocol may be used to sell tickets for transportation, as a way to seamlessly manage room 
access in hotels and holiday rentals, and as a way to prove you've paid for a membership. Today, we're starting with
events. Specifically, the 
[NFT Dev Meetup during NYC Blockchain Week 2019 on May 16, 2019](https://tickets.unlock-protocol.com/event/0x5865Ff2CBd045Ef1cfE19739df19E83B32b783b4).

We're working with Dapper Labs, OpenSea, and SuperRare to host an event about non-fungible tokens. To attend, all you
need to do is buy a ticket using Unlock. 
[Visit the event page with a web3-compatible wallet](https://tickets.unlock-protocol.com/event/0x5865Ff2CBd045Ef1cfE19739df19E83B32b783b4)
like [Metamask](https://metamask.io) to purchase a ticket at a nominal price.

## How tickets work with Unlock

Every Unlock transaction - whether for content, an event, software licenses, or anything else - works by selling a _key_ 
to a _lock_ using Ethereum. Tickets are no different.

Once you've created a lock, you'll have access to a number of ways to use it: different applications that sit on top of
the Unlock Protocol. The ticketed event application allows you to save a date, title, description, and location for the
event. These aren't stored on the blockchain itself: instead, they create a database record that references the lock's 
Ethereum address.

A user with an Ethereum wallet like Metamask can buy a key with one click. The event page then shows a QR code, which
contains the user's public key and a signed version of the lock address. This can be verified at the door with a
commodity QR code reader, which are now built into every major mobile operating system.

![Unlock ticket screenshot](/static/images/blog/introducing-tickets/unlock-tickets.png)

## Multi-use locks

On the Unlock Protocol, you're not limited to using one application per lock. This means that a ticketed event and a
content paywall can run on the same lock: if you purchase access to the paywall, you'll be able to get access to the
event, or if you purchase access to the event, you'll automatically be able to view protected content.

This means you can very easily string together a series of connected assets to sell as a bundle. Perhaps you want to
give premium customers for your publication access to a series of workshops. Or you want to provide access to a custom
social network for attendees of your event. As we add more applications, and third parties build on top of our open
protocol to add even more, the possibilities will become endless.

## Learn more

To find out more about tickets and Unlock, come see us at the 
[NFT Dev Meetup on May 16](https://tickets.unlock-protocol.com/event/0x5865Ff2CBd045Ef1cfE19739df19E83B32b783b4). If
you're not able to travel to New York City or attend the event, you can always join us on our 
[Github project](https://github.com/unlock-protocol/unlock/) or reach out and say hello at
[hello@unlock-protocol.com](mailto:hello@unlock-protocol.com). We would love to hear from you.
