---
title: Check In Attendees Using a Smartphone Using QR Code Tickets
subTitle: Tickets to conferences are memberships!
authorName: Julien Genestoux
publishDate: August 20, 2023
description: At Unlock, we're proud to power the tickets for several conferences... but no ticketing solution is complete without a check-in mechanism!
image: /images/blog/checking-key-in/event-ticket-phone-qr-code.png
---

Memberships are everywhere: from your local gym, to your favorite news site, through conferences! At Unlock, we take great care in making sure we can _bridge_ the gap between online memberships and the offline world.

Today, we're excited to show you the flow to **check users in** if you are using onchain tickets for a conference.

# The flow

First, the users will have to purchase a ticket. You can learn much more about onchain ticketing at [https://events.unlock-protocol.com](https://events.unlock-protocol.com).

The ticket is a non-fungible-token, and can be delivered to either an email address or a crypto wallet. We also [built a key chain](https://app.unlock-protocol.com/keychain/) where users can instantly view all of their tickets and other onchain memberships.

On the keychain, an attendee can "confirm ownership" of their ticket, which is a way for them to prove that they own it.

<p style="text-align:center" ><img width="300" src="/images/blog/checking-key-in/devcon-demo-ticket.jpg" alt="key in keychain"></p>

For each ticket, we generate a QR code which can then be used by anyone to verify that indeed, this user owns this ticket and that this ticket is valid. Below is my QR code for a ticket. You can scan it with your camera application!

<p style="text-align:center" ><img width="300" src="/images/blog/checking-key-in/qr-code.png" alt="qr code ticket"></p>

# Checking users in

In a small number of cases, some individuals may try to transfer their ticket to someone after they have used it. This means that, unless we use a mechanism to prevent this, an unscrupulous individual could use their ticket (and the corresponding QR code) to enter a venue, and then transfer the ticket to another user who is waiting outside, who would re-use the same ticket (and another version of the QR code) to enter the venue as well. **This is not how tickets are supposed to work**!

Unlock has built-in mechanisms to prevent this, by checking in tickets at the venue and marking those tickets as "used" for event organizers who wish to do so. The verification page above works from any web browser. For this, we are using metadata on the NFT which can only be set by the event organizer (lock owner). This way, if the ticket is then transfered to someone else, the organizers would still be able to quickly identify sneaky users who are trying to re-use a ticket.

<p style="text-align:center" ><img width="300" src="/images/blog/checking-key-in/checked-in-key-2.png" alt="checked-in!"></p>

With our support for credit cards, the ability to ask users to submit information for their tickets, and sell them on the organizers' website directly, we believe Unlock now provides a **ticketing experience** that's even better than most legacy solutions, while still leveraging Ethereum's core capabilities: decentralization, permissionless and programmable!

You can learn much more about Unlock's ticketing flow for events, how to implement QR codes, and more in our [How To Sell NFT Tickets for an Event](https://unlock-protocol.com/guides/how-to-sell-nft-tickets-for-an-event/) guide.
