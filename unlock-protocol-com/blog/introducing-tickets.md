---
title: Introducing Tickets
subTitle: Now you can buy tickets to real-world events using Ethereum
authorName: Ben Werdmuller
publishDate: August 8, 2019
description: Now you can buy tickets to real-world events using Ethereum and the Unlock Protocol.
image: /images/blog/introducing-tickets/introducing-tickets.jpg
---
![introducing tickets](/images/blog/introducing-tickets/introducing-tickets.jpg)

The Unlock Protocol isn't just a way to pay to access services on the internet.

We’re building a protocol that can be used to unlock access to _anything_ - and while that means [content, software
licenses and more](https://unlock-protocol.com/blog/ways-to-unlock-the-web/), we also want to help people sell access
things in the real world.

In the future, the Unlock Protocol may be used to sell tickets for transportation, as a way to seamlessly manage room
access in hotels and holiday rentals, and as a way to prove you've paid for a membership. Today, we're starting with
events.

You can buy a ticket to the [Berlin Open Source Salon](https://berlin.opensourcesalon.com/) with DAI using Unlock.
[Visit the Unlock event page](https://tickets.unlock-protocol.com/event/0x98c0cbF0e9525f1a6975A51c9D5E8e063c034D6D),
purchase a ticket, and then show your special QR code at the door. Your ticket will be validated on the blockchain.

![Berlin Open Source Salon ticket page](/images/blog/introducing-tickets/boss-tickets.png)

## How tickets work with Unlock

Every Unlock transaction - whether for content, an event, software licenses, or anything else - works by selling a _key_
to a _lock_ using Ethereum. Tickets are no different.

![Unlock ticket creation screen](/images/blog/introducing-tickets/create-an-event.png)

Once a lock has been created, creators have access to a number of ways to use it: different applications that sit on top of
the Unlock Protocol. The ticketed event application allows you to save a date, title, description, and location for the
event. These aren't stored on the blockchain itself: instead, they create a database record that references the lock's
Ethereum address.

An attendee with an Ethereum wallet like Metamask can buy a key with one click. The event page then shows a QR code, which
contains the user's public key and a signed version of the lock address. This can be verified at the door with a
commodity QR code reader, which are now built into the camera apps in every major mobile operating system.

## Multi-use locks

On the Unlock Protocol, you're not limited to using one application per lock. This means that a ticketed event and a
content paywall can run on the same lock: if you purchase access to the paywall, you'll be able to get access to the
event, or if you purchase access to the event, you'll automatically be able to view protected content.

This means you can very easily string together a series of connected assets to sell as a bundle. Perhaps you want to
give premium customers for your publication access to a series of workshops. Or you want to provide access to a custom
social network for attendees of your event. As we add more applications, and third parties build on top of our open
protocol to add even more, the possibilities will become endless.

## Learn more

We're building Unlock in the open. You can always say hello in our [Discord](https://discord.gg/Ah6ZEJyTDp), join
us on our [Github project](https://github.com/unlock-protocol/unlock/) or reach out at
[hello@unlock-protocol.com](mailto:hello@unlock-protocol.com). We would love to hear from you.
