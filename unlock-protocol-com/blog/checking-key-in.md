---
title: Checking Keys In
subTitle: Tickets to conferences are memberships!
authorName: Julien Genestoux
publishDate: February 6, 2020
description: At Unlock, we're proud to power the tickets for several conferences... but no ticketing solution is complete without a check-in mechanism!
image: /images/blog/introducing-tickets/introducing-tickets.jpg
---

Memberships are everywhere: from your local gym, to your favorite news site, through conferences! At Unlock, we take great care in making sure we can _bridge_ the gap between online memberships and the offline world.

Today, we're excited to show you the flow to **check users in** if you are using keys to a lock as tickets for a conference.

# The flow

First, the users will have to purchase a ticket. They can do this on your site if you add an Unlock button, like [our friends at EthCC did](/blog/ethcc-tickets).

The ticket is a non-fungible-token, which sits in their crypto wallet... like any other asset. We also [built a key chain](https://app.unlock-protocol.com/keychain/) where users can instantly view all of their memberships (and soon, much, much more!).

On the keychain, key owners can "confirm ownership" of their ticket, which is a way for them to sign the NFT to prove that they own it.

<p style="text-align:center" ><img width="300" src="/images/blog/checking-key-in/keychain.png" alt="key in keychain"></p>

With their signature we generate a QR code which can then be used by anyone to verify that indeed, this user owns a key and that this key is valid. In fact, the QR code includes a full URL can be loaded to verify if the key is valid. Below is my key to EthCC. You can scan it with your camera application!

<p style="text-align:center" ><img width="300" src="/images/blog/checking-key-in/ethcc-ticket-qrcode.png" alt="qr code ticket"></p>

# Checking users in

Unlock keys are, by default, transferable. This means that, unless we use a mechanism to prevent this, someone could use their key (and the corresponding QR code) to enter a venue, transfer the key to another user, who would re-use the same key (and another version of the QR code) to enter the venue as well. **This is not how tickets are supposed to work**!

The verification page above works from any web browser... but, if viewed from inside a browser which has a crypto wallet and if the viewer is actually the lock owner, **the viewer can "mark" the ticket as checked-in**. For this, we are using metadata on the NFT which can only be set by the lock owner. This way, if the ticket is then transfered to someone else, the organizers would still be able to quickly identify sneaky users who are trying to re-use a ticket.

<p style="text-align:center" ><img width="300" src="/images/blog/checking-key-in/checked-in-key.png" alt="checked-in!"></p>

With our support for credit cards, the ability to ask users to submit information for their tickets, and sell them on the organizers' website directly, we believe Unlock now provides a **ticketing experience** that's even better than most legacy solutions, while still leveraging Ethereum's core capabilities: decentralization, permissionless and programmable!
